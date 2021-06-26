import React, { useEffect, useRef } from 'react';
import { captureTap } from './engine';

export default function TapPanel({ isPlaying }) {
  const tapButton = useRef();
  function handleSubmit(event) {
    console.log('clicking');
    event.preventDefault();
    captureTap();
  }
  useEffect(() => {
    if (isPlaying) {
      tapButton.current.focus();
    }
  }, [isPlaying]);
  return (
    <form onSubmit={handleSubmit}>
      <button
        ref={tapButton}
        id="tap-panel"
        onTouchStart={handleSubmit}
        style={{ width: '300px', height: '300px' }}
        onFocus={() => console.log('Has focus')}
      >
        Tap here
      </button>
    </form>
  );
}
