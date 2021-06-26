import React, { useState } from 'react';
import Controls from './Controls';
import TapPanel from './TapPanel';
import TappedResults from './TappedResults';
import './App.css';

function App() {
  const [resultsArray, setResultsArray] = useState([]);
  const [resultsTempo, setResultsTempo] = useState(0);
  const [latestPerformanceMap, setLatestPerformanceMap] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  function startCallback() {
    console.log('Playing');
    setIsPlaying(true);
  }
  function completedCallback({ performanceMap }) {
    // setResultsArray(results);
    setIsPlaying(true);
    setLatestPerformanceMap(performanceMap);
    // setResultsTempo(tempo);
  }
  return (
    <div className="app">
      <header className="app__header">
        <h1>Get in time 🕰️</h1>
      </header>
      <main className="app__main">
        <Controls
          onStopCallback={completedCallback}
          onStartCallback={startCallback}
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
