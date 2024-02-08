// import React, { useState, useEffect } from 'react';
// import {
//   getResultsArray,
//   init,
//   startPlaying,
//   stopPlaying,
//   setNoteResolution,
//   setTempo,
// } from './metronome';

// import { init, startRecording, stopRecording, setTempo, setPerformanceLength, updateClickResolution } from './engine';

import React from 'react';

export default function Controls({
  onStopCallback,
  onStartCallback,
  tempo,
  setTempo,
  isPlaying,
  clickResolution,
  setClickResolution,
  performanceLength,
  setPerformanceLength,
}) {
  // useEffect(() => {
  //   setTempo(parseInt(tempo));
  // }, [tempo]);
  // useEffect(() => {
  //   setPerformanceLength(parseInt(performanceLength));
  // }, [performanceLength]);
  // useEffect(() => {
  //   updateClickResolution(parseInt(clickResolution))
  // }, [clickResolution]);

  // function onComplete(performanceMap) {
  //   setIsPlaying(false);
  //   onStopCallback({
  //     performanceMap,
  //   });
  // }

  // function start() {
  //   setIsPlaying(true);
  //   startRecording({
  //     onComplete,
  //   });
  //   // tapPanel.focus();
  //   onStartCallback();
  // }

  // function stop() {
  //   setIsPlaying(false);
  //   // stopPlaying();
  //   stopRecording();
  //   onStopCallback({
  //     // results: getResultsArray(),
  //     // tempo,
  //   });
  // }
  // const play = () => console.log('Play');
  // const changeResolution = (event) => {
  //   setClickResolution(parseInt(event.target.value, 10));
  //   // return true;
  //   // setNoteResolution(parseInt(event.target.value, 10));
  // };
  const onTempoChange = (event) => setTempo(parseInt(event.target.value, 10));
  const onPerformanceLengthChange = (event) =>
    setPerformanceLength(parseInt(event.target.value, 10));
  const onClickResolutionChange = (event) =>
    setClickResolution(parseInt(event.target.value, 10));
  const handleSubmit = (event) => event.preventDefault();
  return (
    <form id="controls" className="controls" onSubmit={handleSubmit}>
      <div id="tempoBox">
        <label htmlFor="tempo" style={{ width: '130px' }}>
          Tempo: <span id="showTempo">{tempo}</span>BPM{' '}
        </label>
        <input
          id="tempo"
          type="range"
          min="30.0"
          max="160.0"
          step="1"
          style={{ height: '20px', width: '200px' }}
          onInput={onTempoChange}
          value={tempo}
          disabled={isPlaying}
        />
      </div>
      <div>
        <label htmlFor="playback-resolution">Playback resolution:</label>
        <select
          value={clickResolution}
          id="playback-resolution"
          onChange={onClickResolutionChange}
        >
          <option value={16}>&#9836; 16th notes</option>
          <option value={8}>&#9834; 8th notes</option>
          <option value={4}>&#9833; Quarter notes</option>
        </select>
      </div>
      <div>
        <label htmlFor="performance-length">
          Performance length: <span>{performanceLength}</span>
        </label>
        <input
          id="performance-length"
          type="range"
          min="10.0"
          max="60.0"
          step="1"
          style={{ height: '20px', width: '180px' }}
          onInput={onPerformanceLengthChange}
          value={performanceLength}
          disabled={isPlaying}
        />
      </div>
      <div className="controls__play-button">
        <button onClick={onStartCallback} disabled={isPlaying}>
          &#9658; Play
        </button>
        <button onClick={onStopCallback}>&#9726; Stop</button>
      </div>
    </form>
  );
}
