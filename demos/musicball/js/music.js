// Music theory tables and helpers. Everything here is pure data or pure functions.
window.MB = window.MB || {};
(function (MB) {
  'use strict';

  const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

  // Segment colors. Part 1 of a ring is always yellow, part 2 green, and so on.
  const PALETTE = ['#FFD23F', '#3DDC97', '#2EC4F1', '#6E7BFF', '#B66DFF', '#FF5DA2', '#FF8A3D', '#FF5A5F'];
  const COLOR_NAMES = ['Yellow', 'Green', 'Cyan', 'Blue', 'Purple', 'Pink', 'Orange', 'Red'];

  const MAJOR = [0, 2, 4, 5, 7, 9, 11];
  const MINOR = [0, 2, 3, 5, 7, 8, 10];
  const DORIAN = [0, 2, 3, 5, 7, 9, 10];
  const LYDIAN = [0, 2, 4, 6, 7, 9, 11];
  const PHRYGIAN = [0, 1, 3, 5, 7, 8, 10];
  const WHOLE = [0, 2, 4, 6, 8, 10];

  // `steps` is what melodies use. `parent` is the 7-note scale chords are built from.
  const SCALES = [
    { name: 'Major pentatonic', steps: [0, 2, 4, 7, 9], parent: MAJOR },
    { name: 'Minor pentatonic', steps: [0, 3, 5, 7, 10], parent: MINOR },
    { name: 'Major', steps: MAJOR, parent: MAJOR },
    { name: 'Minor', steps: MINOR, parent: MINOR },
    { name: 'Dorian', steps: DORIAN, parent: DORIAN },
    { name: 'Lydian', steps: LYDIAN, parent: LYDIAN },
    { name: 'Japanese', steps: [0, 1, 5, 7, 8], parent: PHRYGIAN },
    { name: 'Blues', steps: [0, 3, 5, 6, 7, 10], parent: DORIAN },
    { name: 'Whole tone', steps: WHOLE, parent: WHOLE },
  ];

  const DRUMS = [
    { id: 'kick', name: 'Kick' },
    { id: 'snare', name: 'Snare' },
    { id: 'hat', name: 'Hi-hat' },
    { id: 'clap', name: 'Clap' },
    { id: 'tomLow', name: 'Low tom' },
    { id: 'tomHigh', name: 'High tom' },
    { id: 'rim', name: 'Rim' },
  ];

  const TEMPOS = [60, 75, 90, 105, 120, 140];

  // 16-step patterns for the background pulse. k=kick s=snare h=hat b=bass.
  const PATTERNS = [
    { name: 'Steady', k: [0, 4, 8, 12], s: [4, 12], h: [2, 6, 10, 14], b: [0, 8] },
    { name: 'Half-time', k: [0, 10], s: [8], h: [0, 2, 4, 6, 8, 10, 12, 14], b: [0, 10] },
    { name: 'Breakbeat', k: [0, 7, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14, 15], b: [0, 7, 10] },
    { name: 'Shuffle', k: [0, 8], s: [4, 12], h: [0, 3, 4, 7, 8, 11, 12, 15], b: [0, 3, 8, 11] },
    { name: 'Sparse', k: [0], s: [], h: [8], b: [0] },
    { name: 'Ambient', k: [], s: [], h: [], b: [0] },
  ];

  const INSTRUMENTS = [
    { id: 'soft', name: 'Soft' },
    { id: 'glass', name: 'Glass' },
    { id: 'pluck', name: 'Pluck' },
    { id: 'chip', name: 'Chip' },
    { id: 'pad', name: 'Pad' },
  ];

  const FILTERS = [
    { name: 'Dark', freq: 500 },
    { name: 'Muffled', freq: 1100 },
    { name: 'Warm', freq: 2400 },
    { name: 'Bright', freq: 6500 },
    { name: 'Open', freq: 18000 },
  ];

  // Echo time is either fixed seconds or a number of beats synced to the tempo.
  const ECHOES = [
    { name: 'Dry', time: 0.05, fb: 0, wet: 0 },
    { name: 'Slap', time: 0.12, fb: 0.2, wet: 0.18 },
    { name: 'Dotted', beats: 0.75, fb: 0.38, wet: 0.26 },
    { name: 'Long', beats: 1, fb: 0.5, wet: 0.32 },
    { name: 'Huge', beats: 1.5, fb: 0.62, wet: 0.4 },
  ];

  const mod = (a, m) => ((a % m) + m) % m;
  // Keep keys within a tritone of C so the register stays similar.
  const keyOffset = (key) => (key > 6 ? key - 12 : key);

  function stepsToMidi(steps, degree, octave, key) {
    const L = steps.length;
    return 12 * (octave + 1) + keyOffset(key) + steps[mod(degree, L)] + 12 * Math.floor(degree / L);
  }
  const degreeToMidi = (degree, octave, key, scaleIdx) => stepsToMidi(SCALES[scaleIdx].steps, degree, octave, key);
  const chordMidis = (degree, octave, key, scaleIdx) =>
    [0, 2, 4].map((x) => stepsToMidi(SCALES[scaleIdx].parent, degree + x, octave, key));

  function chordName(degree, key, scaleIdx) {
    const [a, b, c] = chordMidis(degree, 4, key, scaleIdx);
    const t = b - a, f = c - a;
    let q = '~';
    if (t === 4 && f === 7) q = '';
    else if (t === 3 && f === 7) q = 'm';
    else if (t === 3 && f === 6) q = '°';
    else if (t === 4 && f === 8) q = '+';
    return NOTE_NAMES[mod(a, 12)] + q;
  }

  const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const midiName = (m) => NOTE_NAMES[mod(m, 12)] + (Math.floor(m / 12) - 1);
  const echoTime = (e, bpm) => (e.beats ? (e.beats * 60) / bpm : e.time);

  MB.music = {
    NOTE_NAMES, PALETTE, COLOR_NAMES, SCALES, DRUMS, TEMPOS, PATTERNS, INSTRUMENTS, FILTERS, ECHOES,
    mod, degreeToMidi, chordMidis, chordName, midiToFreq, midiName, echoTime,
  };
})(window.MB);
