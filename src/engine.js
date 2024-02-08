const state = {
  audioContext: null,
  isPlaying: false,
  performanceMap: null,
  // performanceLength: 15.0,
  tapRange: 16,
  // tempo: 120.0,
  unlocked: false,
  // clickResolution: 4, // 1|4|8|16
};

const settings = {
  // lookahead: 25.0, // How frequently to call scheduling function (in milliseconds)
  noteLength: 0.05, // length of "beep" (in seconds)
  // scheduleAheadTime: 0.1, // How far ahead to schedule audio (sec). This is calculated from settings.lookahead, and overlaps with next interval (in case the timer is late)
  startBuffer: 0.5, // time before 1st note is scheduled.
};

function getPercentage(diff, range) {
  const positiveDiff = diff < 0 ? diff * -1 : diff;
  const percentage = (positiveDiff / range) * 100;
  const inversePercentage = 100 - percentage;
  const finalPercentage = inversePercentage < 0 ? 0 : inversePercentage;
  return finalPercentage;
}

export function captureTap() {
  const base_tap_time = state.audioContext.currentTime;
  const latencyOffset = state.audioContext.outputLatency;
  // const latencyOffset = 0;
  if (!state.performanceMap) {
    // should throw here.
    return console.error('No map!');
  }
  // if (!state.isPlaying) {
  //   return false;
  // }
  const tap_time = base_tap_time - latencyOffset;
  // const bounds = 60 / (state.tempo * 4);
  const barAfter = state.performanceMap.bars.find(
    (bar) => bar && bar.time > tap_time,
  );
  const barBefore = barAfter
    ? state.performanceMap.bars[barAfter.number]
    : state.performanceMap.bars[state.performanceMap.bars.length - 1];
  const nearestBeat = barBefore.beats.reduce((prev, curr) =>
    Math.abs(curr.time - tap_time) < Math.abs(prev.time - tap_time)
      ? curr
      : prev,
  );
  const nearestSub = nearestBeat.subs.reduce((prev, curr) =>
    Math.abs(curr.time - tap_time) < Math.abs(prev.time - tap_time)
      ? curr
      : prev,
  );
  // const beatRange = barBefore.beats.find(beat => beat.time => )
  // const noteBefore = tapRange = 16
  // const nearest_note_time =
  //   state.nextNoteTime - tap_time < tap_time - state.lastNoteTime
  //     ? state.nextNoteTime
  //     : state.lastNoteTime;
  // const diff = tap_time - nearest_note_time;
  // const diff = tap_time - nearestSub.time;
  const earlyFirstBeatOfBar = barAfter
    ? nearestBeat.number == barBefore.beats.length &&
      barAfter.time - tap_time < tap_time - nearestBeat.time
      ? true
      : false
    : false;
  const bar = earlyFirstBeatOfBar ? barAfter.number : barBefore.number;
  const beat = earlyFirstBeatOfBar ? 1 : nearestBeat.number;
  const diff =
    tap_time - (earlyFirstBeatOfBar ? barAfter.time : nearestBeat.time);
  console.log(tap_time);
  state.performanceMap.tappedNotes.push({
    tap_time,
    bar,
    beat,
    diff,
    accuracy: getPercentage(diff, state.performanceMap.accuracyRange),
  });
}

export function setTempo(newTempo) {
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
export function setPerformanceLength(newPerformanceLength) {
  if (!Number.isInteger(newPerformanceLength)) {
    return console.log(
      `The performance length cannot be set to a non integer. Value trying to be set is: ${newPerformanceLength}`,
    );
  }
  if (newPerformanceLength < 10 || newPerformanceLength > 60) {
    return console.log(
      `The performance length must be of an integer between 10 and 60. Value trying to be set is: ${newPerformanceLength}`,
    );
  }
  return (performance_length = newPerformanceLength);
}

function scheduleNoteToBePlayed({
  beatType, // bar/beat/sub
  time,
}) {
  // should perhaps only create 3 oscillators and store them in state?
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

function createPerformanceMap({
  onComplete,
  tempo,
  click_resolution,
  performance_length,
}) {
  // const outputLatency = state.audioContext.outputLatency;
  // console.log(outputLatency);
  // console.log(state.audioContext.baseLatency);
  const secondsPerBeat = 60.0 / tempo;
  const beatResolution = 4; // crotchet / 1/4 note
  const accuracyResolution = 4; //
  const beatsPerBar = 4;
  const subDivisionPerBeat = 4;
  const totalBars = Math.round(
    performance_length / (secondsPerBeat * beatsPerBar),
  );
  const performanceMap = {
    accuracyRange: secondsPerBeat / accuracyResolution,
    duration: performance_length,
    tempo: tempo,
    beatsPerBar,
    beatResolution,
    bars: [],
    tappedNotes: [],
  };
  let nextNoteTime = state.audioContext.currentTime + settings.startBuffer;
  for (let bar = -1; bar < totalBars + 1; bar++) {
    scheduleNoteToBePlayed({
      beatType: 'bar',
      time: nextNoteTime,
    });
    performanceMap.bars.push({
      number: bar,
      time: nextNoteTime,
      beats: [],
    });
    if (click_resolution < 5) {
      for (let beat = 1; beat < beatsPerBar + 1; beat++) {
        if (beat != 1) {
          scheduleNoteToBePlayed({
            beatType: 'beat',
            time: nextNoteTime,
          });
        }
        performanceMap.bars[bar + 1].beats.push({
          number: beat,
          time: nextNoteTime,
          subs: [],
        });
        if (click_resolution > 5 && subDivisionPerBeat > 1) {
          for (let sub = 1; sub < subDivisionPerBeat + 1; sub++) {
            if (sub != 1) {
              scheduleNoteToBePlayed({
                beatType: 'sub',
                time: nextNoteTime,
              });
            }
            performanceMap.bars[bar + 1].beats[beat - 1].subs.push({
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
  }
  state.performanceMap = performanceMap;
  // return the timeout, so it can be cancelled
  return setTimeout(() => {
    if (onComplete) {
      state.isPlaying = false;
      onComplete(state.performanceMap);
    }
    console.log(state.performanceMap);
  }, (nextNoteTime - state.audioContext.currentTime) * 1000);
}

export function start_recording({
  onComplete = null,
  tempo = 120,
  click_resolution = 4,
  performance_length = 14,
} = {}) {
  // should validate params first
  // if (state.isPlaying) {
  //   return true;
  // }
  // console.log(`State unlocked: ${state.unlocked}`);
  if (!state.unlocked) {
    state.audioContext = new AudioContext();
    // play silent buffer to unlock the audio
    // let buffer = state.audioContext.createBuffer(1, 1, 22050);
    // let node = state.audioContext.createBufferSource();
    // node.buffer = buffer;
    // node.start(0);
    state.unlocked = true;
  }
  // state.isPlaying = true;
  // returns the timeout, so it can be cancelled
  return createPerformanceMap({
    onComplete,
    tempo,
    click_resolution,
    performance_length,
  });
}

// export function init({ initialTempo = 120 } = {}) {
//   if (state.initialised) {
//     console.warn('Scheduler is already initialised.');
//     return true;
//   }
//   // state.tempo = initialTempo;
//   // console.log(state.audioContext.outputLatency);
//   state.initialised = true;
//   // console.info('Audio context enabled');
// }

export function stop_recording() {
  const stopTime = state.audioContext.currentTime;
  state.audioContext.suspend();
  state.isPlaying = false;
  console.log(state.performanceMap);
  console.log(state.audioContext.currentTime);
  const filteredMap = state.performanceMap.bars.filter(
    (bar) => bar.time < stopTime,
  );
  state.performanceMap = filteredMap;
  // const lastBar = filteredMap[filteredMap.length -1]).beats ? filter(bar => {
  //   if(bar.beats.length) {
  //     return bar.beats.filter(beat => beat.time < stopTime)
  //   }
  //   return true;
  // });
  // console.log(filteredMap);
}

export function updateClickResolution(resolution) {
  const validResolutions = [1, 4, 8, 16];
  if (validResolutions.includes(resolution)) {
    click_resolution = resolution;
  } else {
    console.log(`${resolution} is not a valid resolution`);
  }
  console.log(click_resolution);
  return true;
}
