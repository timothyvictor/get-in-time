import React from 'react';

export default function TappedResults({
  performanceMap = null,
  resultsArray = [],
} = {}) {
  // const bounds = 60 / (resultsTempo * 4);
  // const averageAccuracy = resultsArray.length
  //   ? resultsArray.reduce(
  //       (accumulator, result) => result.accuracy + accumulator,
  //       0,
  //     ) / resultsArray.length
  //   : 0;
  function getBeatData(bar, beat) {
    // console.log(bar, beat);
    const tap = performanceMap.tappedNotes.find(
      (note) => note.bar == bar && note.beat == beat,
    );
    // console.log(tap);
    if (tap) {
      return `accuracy: ${tap.accuracy.toFixed(2)}% (${
        tap.diff < 0 ? 'early' : 'late'
      })`;
    }
  }
  function averageAccuracy(resultsArray) {
    return resultsArray.length
      ? resultsArray.reduce(
          (accumulator, result) => result.accuracy + accumulator,
          0,
        ) / resultsArray.length
      : 0;
  }
  return performanceMap ? (
    <div>
      <h4>Tempo: {performanceMap.tempo}</h4>
      <h4>
        {/* Accuracy bounds (nearest 16th note): +/- {bounds.toFixed(4)} seconds */}
      </h4>
      <h4>
        Average accuracy{' '}
        {averageAccuracy(performanceMap.tappedNotes).toFixed(2)}&#37;
      </h4>
      <ul>
        {performanceMap.bars.map((bar) => {
          return bar.number > 0 ? (
            <li key={bar.number}>
              <h4>
                Bar {bar.number} Average:{' '}
                {averageAccuracy(
                  performanceMap.tappedNotes.filter(
                    (note) => note.bar == bar.number,
                  ),
                ).toFixed(2)}
                &#37;
              </h4>
              <ul>
                {bar.beats.map((beat) => {
                  return (
                    <li key={beat.number}>
                      <h4>
                        {beat.number} - {getBeatData(bar.number, beat.number)}
                      </h4>
                    </li>
                  );
                })}
              </ul>
            </li>
          ) : null;
        })}
      </ul>
      {/* <ul>
        {performanceMap.map((result, index) => {
          return (
            <li key={index}>
              <strong>
                Accuracy: {Math.round(result.accuracy)} &#37; -{' '}
                {result.diff < 0 ? 'early' : 'late'}
              </strong>
              (
              <small>
                Actual Tap: {result.tap_time.toFixed(4)} Expected Tap:{' '}
                {result.nearest_note_time.toFixed(4)} Diff:{' '}
                {(result.tap_time - result.nearest_note_time).toFixed(4)}
              </small>
              )
            </li>
          );
        })}
      </ul> */}
    </div>
  ) : null;
}
