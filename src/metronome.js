import MetronomeWorker from './metronome_worker?worker';

const noteResolutions = new Map([
  [16, 0],
  [8, 1],
  [4, 2],
]);

const settings = {
  lookahead: 25.0, // How frequently to call scheduling function (in milliseconds)
  noteLength: 0.05, // length of "beep" (in seconds)
  scheduleAheadTime: 0.1, // How far ahead to schedule audio (sec). This is calculated from settings.lookahead, and overlaps with next interval (in case the timer is late)
  startBuffer: 0.5, // time before 1st note is scheduled.
};

const state = {
  audioContext: null,
  capturePattern: 4,
  current16thNote: undefined, // What note is currently last scheduled?
  endTime: undefined,
  initialised: false,
  isPlaying: false,
  lastNoteTime: 0.0,
  nextNoteTime: 0.0, // when the next note is due.
  noteResolution: 0, // 0 == 16th, 1 == 8th, 2 == quarter note
  notesInQueue: [], // the notes that have been put into the web audio (and may or may not have played yet. {note, time})
  record: true,
  startTime: undefined, // The start time of the entire sequence.
  tappedNotes: [],
  tempo: 120.0, // tempo (in beats per minute)
  timerWorker: null, // The Web Worker used to fire timer messages
  unlocked: false,
  performanceMap: {
    duration: 30,
    tempo: 120,
    beatsPerBar: 4,
    beatResolution: 4,
    bars: [],
  },
};

function getPercentage(diff, bounds) {
  const positiveDiff = diff < 0 ? diff * -1 : diff;
  const percentage = (positiveDiff / bounds) * 100;
  const inversePercentage = 100 - percentage;
  return inversePercentage;
}

export function captureTap() {
  const tap_time = state.audioContext.currentTime;
  const bounds = 60 / (state.tempo * 4);
  const nearest_note_time =
    state.nextNoteTime - tap_time < tap_time - state.lastNoteTime
      ? state.nextNoteTime
      : state.lastNoteTime;
  const diff = tap_time - nearest_note_time;
  state.tappedNotes.push({
    tap_time,
    nearest_note_time,
    diff,
    accuracy: getPercentage(diff, bounds),
  });
}

export function getResultsArray() {
  return state.tappedNotes;
}

export function setNoteResolution(resolution = 16) {
  const requestedResolution = noteResolutions.get(resolution);
  if (requestedResolution !== undefined) {
    state.noteResolution = requestedResolution;
  } else {
    console.log(`Could not set resolution for: ${resolution}`);
  }
}

export function setNewTempo(newTempo) {
  if (!Number.isInteger(newTempo)) {
    return console.log(
      `The tempo cannot be set to a non integer. Value trying to be set is: ${newTempo}`,
    );
  }
  if (newTempo < 30 || newTempo > 160) {
    return console.log(
      `The tempo must be of an integer between 36 and 160. Value trying to be set is: ${newTempo}`,
    );
  }
  return (state.tempo = newTempo);
}

function nextNote() {
  // Advance current note and time by a 16th note...
  let secondsPerBeat = 60.0 / state.tempo; // Notice this picks up the CURRENT
  // tempo value to calculate beat length.
  state.lastNoteTime = state.nextNoteTime;
  state.nextNoteTime += 0.25 * secondsPerBeat; // Add beat length to last beat time

  state.current16thNote++; // Advance the beat number, wrap to zero
  if (state.current16thNote == 16) {
    state.current16thNote = 0;
  }
}

function scheduleNote(beatNumber, time) {
  // push the note on the queue, even if we're not playing.
  state.notesInQueue.push({ note: beatNumber, time: time });

  if (state.noteResolution == 1 && beatNumber % 2) return; // we're not playing non-8th 16th notes
  if (state.noteResolution == 2 && beatNumber % 4) return; // we're not playing non-quarter 8th notes

  // create an oscillator
  let osc = state.audioContext.createOscillator();
  osc.connect(state.audioContext.destination);
  if (beatNumber % 16 === 0)
    // beat 0 == high pitch
    osc.frequency.value = 880.0;
  else if (beatNumber % 4 === 0)
    // quarter notes = medium pitch
    osc.frequency.value = 440.0;
  // other 16th notes = low pitch
  else osc.frequency.value = 220.0;

  osc.start(time);
  osc.stop(time + settings.noteLength);
}

function scheduleNoteToBePlayed({
  beatType, // bar/beat/sub
  time,
}) {
  let osc = state.audioContext.createOscillator();
  osc.connect(state.audioContext.destination);
  if (beatType == 'bar') {
    osc.frequency.value = 880.0;
  } else if (beatType == 'beat') {
    osc.frequency.value = 440.0;
  } else {
    osc.frequency.value = 220.0;
  }
  osc.start(time);
  osc.stop(time + settings.noteLength);
}

function scheduler() {
  // while there are notes that will need to play before the next interval,
  // schedule them and advance the pointer.
  while (
    state.nextNoteTime <
    state.audioContext.currentTime + settings.scheduleAheadTime
  ) {
    scheduleNote(state.current16thNote, state.nextNoteTime);
    nextNote();
  }
}

// function getNextNoteTime({

// })

function createPerformanceMap() {
  const secondsPerBeat = 60.0 / state.tempo;
  const performanceLength = 10.0;
  const beatResolution = 4; // crotchet / 1/4 note
  const beatsPerBar = 4;
  const subDivisionPerBeat = 4;
  const totalBars = Math.round(
    performanceLength / (secondsPerBeat * beatsPerBar),
  );
  const performanceMap = {
    duration: performanceLength,
    tempo: state.tempo,
    beatsPerBar,
    beatResolution,
    bars: [],
  };
  let nextNoteTime = state.audioContext.currentTime + settings.startBuffer;
  for (let bar = 1; bar < totalBars + 1; bar++) {
    scheduleNoteToBePlayed({
      beatType: 'bar',
      time: nextNoteTime,
    });
    performanceMap.bars.push({
      number: bar,
      time: nextNoteTime,
      beats: [],
    });
    for (let beat = 1; beat < beatsPerBar + 1; beat++) {
      if (beat != 1) {
        scheduleNoteToBePlayed({
          beatType: 'beat',
          time: nextNoteTime,
        });
      }
      performanceMap.bars[bar - 1].beats.push({
        number: beat,
        time: nextNoteTime,
        subs: [],
      });
      if (subDivisionPerBeat > 1) {
        for (let sub = 1; sub < subDivisionPerBeat + 1; sub++) {
          if (sub != 1) {
            scheduleNoteToBePlayed({
              beatType: 'sub',
              time: nextNoteTime,
            });
          }
          performanceMap.bars[bar - 1].beats[beat - 1].subs.push({
            number: sub,
            time: nextNoteTime,
          });
          nextNoteTime = nextNoteTime + secondsPerBeat / subDivisionPerBeat;
        }
      } else {
        nextNoteTime = nextNoteTime + secondsPerBeat;
      }
    }
  }
  console.log(performanceMap);
}

export function startPlaying() {
  if (state.isPlaying) {
    return true;
  }
  if (!state.unlocked) {
    // play silent buffer to unlock the audio
    let buffer = state.audioContext.createBuffer(1, 1, 22050);
    let node = state.audioContext.createBufferSource();
    node.buffer = buffer;
    node.start(0);
    state.unlocked = true;
  }
  if (state.record) {
    createPerformanceMap();
  } else {
    state.tappedNotes = [];
    state.isPlaying = true;
    state.current16thNote = 0;
    state.nextNoteTime = state.audioContext.currentTime;
    state.timerWorker.postMessage('start');
    state.startTime = state.nextNoteTime;
    return true;
  }
}

export function stopPlaying() {
  if (!state.isPlaying) {
    return true;
  }
  state.isPlaying = false;
  state.timerWorker.postMessage('stop');
  state.endTime = state.lastNoteTime;
  return true;
}

export function init({ initialTempo = 120 } = {}) {
  if (state.initialised) {
    console.warn('Scheduler is already initialised.');
    return true;
  }
  state.tempo = initialTempo;
  state.audioContext = new AudioContext();
  state.timerWorker = new MetronomeWorker();
  state.timerWorker.onmessage = function (event) {
    if (event.data == 'tick') {
      scheduler();
    } else console.log('message: ' + event.data);
  };
  state.timerWorker.postMessage({ interval: settings.lookahead });
  state.initialised = true;
}
