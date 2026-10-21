// Ring action types. Each ring owns exactly one type. Its colored parts are a
// subset of that type's options, in order: part 1 yellow, part 2 green, ...
window.MB = window.MB || {};
(function (MB) {
  'use strict';
  const M = MB.music;
  const MAX_PARTS = M.PALETTE.length;

  const TYPES = {
    note: {
      name: 'Note', icon: '♪', count: 8, def: [0, 1, 2, 3, 4], octave: 4,
      desc: 'Plays a note when a ball hits it. Each colored part is a different note of the current scale, rising from yellow onward.',
      label: (v, m, ring) => M.midiName(M.degreeToMidi(v, ring.octave, m.key, m.scale)),
    },
    chord: {
      name: 'Chord', icon: '♫', count: 7, def: [0, 3, 4, 5], octave: 4,
      desc: 'Changes the harmony. Each colored part is a chord. The ring strums it, and the background bass and pad follow it.',
      label: (v, m) => M.chordName(v, m.key, m.scale),
    },
    drum: {
      name: 'Drum', icon: '◉', count: M.DRUMS.length, def: [0, 1, 2, 3],
      desc: 'Plays a drum when a ball hits it. Each colored part is a different drum.',
      label: (v) => M.DRUMS[v].name,
    },
    tempo: {
      name: 'Tempo', icon: '♩', count: M.TEMPOS.length, def: [1, 2, 3, 4],
      desc: 'Sets how fast the background beat plays.',
      label: (v) => M.TEMPOS[v] + ' BPM',
    },
    rhythm: {
      name: 'Rhythm', icon: '∷', count: M.PATTERNS.length, def: [0, 1, 2, 3],
      desc: 'Switches the pattern the background beat plays.',
      label: (v) => M.PATTERNS[v].name,
    },
    scale: {
      name: 'Scale', icon: '♮', count: M.SCALES.length, def: [0, 1, 4, 6],
      desc: 'Changes the scale, which is the mood every note and chord uses.',
      label: (v) => M.SCALES[v].name,
    },
    key: {
      name: 'Key', icon: '♯', count: 12, def: [0, 2, 5, 7, 9],
      desc: 'Moves all the music to a new key, meaning a new home note.',
      label: (v) => M.NOTE_NAMES[v],
    },
    instrument: {
      name: 'Instrument', icon: '∿', count: M.INSTRUMENTS.length, def: [0, 1, 2, 3, 4],
      desc: 'Changes the instrument that Note and Chord rings play.',
      label: (v) => M.INSTRUMENTS[v].name,
    },
    filter: {
      name: 'Filter', icon: '◐', count: M.FILTERS.length, def: [0, 2, 3, 4],
      desc: 'Makes everything darker or brighter by filtering high frequencies.',
      label: (v) => M.FILTERS[v].name,
    },
    echo: {
      name: 'Echo', icon: '◎', count: M.ECHOES.length, def: [0, 1, 2, 3],
      desc: 'Sets how much echo trails behind every sound.',
      label: (v) => M.ECHOES[v].name,
    },
  };
  const ORDER = Object.keys(TYPES);

  const clamp = (v, lo, hi, d) => (Number.isFinite(+v) ? Math.min(hi, Math.max(lo, +v)) : d);
  let nextId = 1;

  function cleanSel(sel, T) {
    if (!Array.isArray(sel)) return [...T.def];
    const s = [...new Set(sel.map((v) => Math.round(+v)).filter((v) => v >= 0 && v < T.count))].sort((a, b) => a - b);
    return s.length ? s.slice(0, MAX_PARTS) : [...T.def];
  }

  function makeRing(type, o = {}) {
    if (!TYPES[type]) type = 'note';
    const T = TYPES[type];
    return {
      id: nextId++,
      type,
      speed: Math.round(clamp(o.speed, -180, 180, 30)),
      gap: Math.round(clamp(o.gap, 0, 300, 90)),
      sel: cleanSel(o.sel, T),
      octave: Math.round(clamp(o.octave, 2, 6, T.octave || 4)),
      angle: Math.random() * 360,
      r: 1,
      flash: new Array(MAX_PARTS).fill(0),
    };
  }

  MB.rings = { TYPES, ORDER, MAX_PARTS, makeRing, cleanSel };
})(window.MB);
