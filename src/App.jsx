import React, { useState } from 'react';
import Controls from './Controls';
import TapPanel from './TapPanel';
import TappedResults from './TappedResults';
import './App.css';

import { start_recording, stop_recording } from './engine';

function App() {
  const [tempo, setTempo] = useState(120)
  const [clickResolution, setClickResolution] = useState(4);
  const [performanceLength, setPerformanceLength] = useState(16);
  const [resultsArray, setResultsArray] = useState([]);
  const [resultsTempo, setResultsTempo] = useState(0);
  const [latestPerformanceMap, setLatestPerformanceMap] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  function startCallback() {
    console.log('Playing');
    setIsPlaying(true);
    start_recording({onComplete: () => {}, tempo, cick_resolution: clickResolution, performance_length: performanceLength})
  }
  function completedCallback({ performanceMap }) {
    console.log(performanceMap);
    // setResultsArray(results);
    setIsPlaying(false);
    // setLatestPerformanceMap(performanceMap);
    // setResultsTempo(tempo);
  }
  return (
    <div className="app">
      <header className="app__header">
        <h1>Get in time 🕰️</h1>
      </header>
      <main className="app__main">
        <Controls
          onStartCallback={startCallback}
          onStopCallback={completedCallback}
          tempo={tempo}
          setTempo={setTempo}
          clickResolution={clickResolution}
          setClickResolution={setClickResolution}
          performanceLength={performanceLength}
          setPerformanceLength={setPerformanceLength}
          isPlaying={isPlaying}
        />
        <TapPanel isPlaying={isPlaying} />
        <div>
          <TappedResults performanceMap={latestPerformanceMap} />
        </div>
      </main>
    </div>
  );
}

export default App;
