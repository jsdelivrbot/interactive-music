const SAMPLE_LIBRARY = {
  'Grand Piano': [
    { note: 'A',  octave: 4, file: 'SFZ-Samples/Sonatina Symphonic Orchestra/Samples/Grand Piano/piano-f-a4.wav' },
    { note: 'A',  octave: 5, file: 'SFZ-Samples/Sonatina Symphonic Orchestra/Samples/Grand Piano/piano-f-a5.wav' },
    { note: 'A',  octave: 6, file: 'SFZ-Samples/Sonatina Symphonic Orchestra/Samples/Grand Piano/piano-f-a6.wav' },
    { note: 'C',  octave: 4, file: 'SFZ-Samples/Sonatina Symphonic Orchestra/Samples/Grand Piano/piano-f-c4.wav' },
    { note: 'C',  octave: 5, file: 'SFZ-Samples/Sonatina Symphonic Orchestra/Samples/Grand Piano/piano-f-c5.wav' },
    { note: 'C',  octave: 6, file: 'SFZ-Samples/Sonatina Symphonic Orchestra/Samples/Grand Piano/piano-f-c6.wav' },
    { note: 'D#',  octave: 4, file: 'SFZ-Samples/Sonatina Symphonic Orchestra/Samples/Grand Piano/piano-f-d#4.wav' },
    { note: 'D#',  octave: 5, file: 'SFZ-Samples/Sonatina Symphonic Orchestra/Samples/Grand Piano/piano-f-d#5.wav' },
    { note: 'D#',  octave: 6, file: 'SFZ-Samples/Sonatina Symphonic Orchestra/Samples/Grand Piano/piano-f-d#6.wav' },
    { note: 'F#',  octave: 4, file: 'SFZ-Samples/Sonatina Symphonic Orchestra/Samples/Grand Piano/piano-f-f#4.wav' },
    { note: 'F#',  octave: 5, file: 'SFZ-Samples/Sonatina Symphonic Orchestra/Samples/Grand Piano/piano-f-f#5.wav' },
    { note: 'F#',  octave: 6, file: 'SFZ-Samples/Sonatina Symphonic Orchestra/Samples/Grand Piano/piano-f-f#6.wav' }
  ]
};

const OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// load sample file from server using audioContext
let audioContext = new AudioContext();

function fetchSample(path) {
  //encodeURIComponent cleans file path before giving to fetch
  return fetch(encodeURIComponent(path))
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
}

function noteValue(note, octave) {
  // multiple octave by 12 and add position of note within that octave
  return octave * 12 + OCTAVE.indexOf(note);
}

function getNoteDistance(note1, octave1, note2, octave2) {
  return noteValue(note1, octave1) - noteValue(note2, octave2);
}

function getNearestSample(sampleBank, note, octave) {
  let sortedBank = sampleBank.slice().sort((sampleA, sampleB) => {
    let distanceToA =
      Math.abs(getNoteDistance(note, octave, sampleA.note, sampleA.octave));
    let distanceToB =
      Math.abs(getNoteDistance(note, octave, sampleB.note, sampleB.octave));
    return distanceToA - distanceToB;
  });
  return sortedBank[0];
}

function flatToSharp(note) {
  // converts any flats inputted to their equivalent sharps
  switch (note) {
    case 'Bb': return 'A#';
    case 'Db': return 'C#';
    case 'Eb': return 'D#';
    case 'Gb': return 'F#';
    case 'Ab': return 'G#';
    default:   return note;
  }
}

function getSample(instrument, noteAndOctave) {
// gets sample that matches note requested, by finding the nearest note in the SAMPLE_LIBRARY
  //split e.g. B#4 into B#, 4
  let [, requestedNote, requestedOctave] = /^(\w[b#]?)(\d)$/.exec(noteAndOctave);
  //octave from string to integer
  requestedOctave = parseInt(requestedOctave, 10);
  requestedNote = flatToSharp(requestedNote);

  let sampleBank = SAMPLE_LIBRARY[instrument];
  let sample = getNearestSample(sampleBank, requestedNote, requestedOctave);
  let distance =
    getNoteDistance(requestedNote, requestedOctave, sample.note, sample.octave);
  return fetchSample(sample.file).then(audioBuffer => ({
    audioBuffer: audioBuffer,
    distance: distance
  }));
}


function playSample(instrument, note, destination, delaySeconds = 0) {
  getSample(instrument, note).then(({audioBuffer, distance}) => {
    // play sample at different rates to distort pitch
    let playbackRate = Math.pow(2, distance / 12);

    let bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.playbackRate.value = playbackRate;

    bufferSource.connect(destination);
    bufferSource.start(audioContext.currentTime + delaySeconds);
  });
}

// set up loops - setInterval function executes given callback function with regular time interval
// SEE MORE ABOUT PRECISE SCHEDULING:
// https://www.html5rocks.com/en/tutorials/audio/scheduling/
// https://github.com/sebpiq/WAAClock
function startLoop(instrument, note, destination, loopLengthSeconds, delaySeconds) {
  // start the loop and then set up the interval, so you don't have to wait the first time round
  playSample(instrument, note, destination, delaySeconds);
  setInterval(
    () => playSample(instrument, note, destination, delaySeconds),
    loopLengthSeconds * 1000
  );
}

fetchSample('AirportTerminal.wav').then(convolverBuffer => {
  // convolution reverb
  let convolver = audioContext.createConvolver();
  convolver.buffer = convolverBuffer;
  convolver.connect(audioContext.destination);

  // start different loops at different times, with different lengths
  startLoop('Grand Piano', 'F4',  convolver, 19.7/3, 4.0);
  startLoop('Grand Piano', 'Ab4', convolver, 17.8/3, 8.1);
  startLoop('Grand Piano', 'C5',  convolver, 21.3/3, 5.6);
  startLoop('Grand Piano', 'Db5', convolver, 22.1/3, 12.6);
  startLoop('Grand Piano', 'Eb5', convolver, 18.4/3, 9.2);
  startLoop('Grand Piano', 'F5',  convolver, 20.0/3, 14.1);
  startLoop('Grand Piano', 'Ab5', convolver, 17.7/3, 3.1);
});
