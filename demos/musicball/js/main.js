// App wiring: config, hit -> music actions, game loop, input.
window.MB = window.MB || {};
(function (MB) {
  'use strict';
  const M = MB.music;
  const RG = MB.rings;
  const DEG = Math.PI / 180;
  const STEP = 1 / 480; // fixed physics timestep
  const $ = (s) => document.querySelector(s);
  const clamp = (v, lo, hi, d) => (Number.isFinite(+v) ? Math.min(hi, Math.max(lo, +v)) : d);

  const world = new MB.World();
  const audio = new MB.AudioEngine();

  const app = (MB.app = {
    world, audio,
    MAX_BALLS: 20, MAX_RINGS: 8,
    music: null,
    settings: null,
    started: false,
    paused: false,
  });
  app.pulse = new MB.Pulse(audio, app);

  // ---- config ------------------------------------------------------------
  function defaultMusic() {
    return { key: 0, scale: 0, chord: 0, tempo: 2, pattern: 0, instrument: 2, filter: 2, echo: 2 };
  }

  function defaultConfig() {
    return {
      // Start simple: a closed drum wall and one note ring with a gap.
      rings: [
        { type: 'drum', speed: 10, gap: 0, sel: [0, 1, 2, 3] },
        { type: 'note', speed: -30, gap: 70, sel: [0, 1, 2, 3, 4, 5, 6, 7], octave: 4 },
      ],
      world: { gravity: 2.2, energy: 0.9, ballR: 0.022, jitter: 3, size: 0.5, spacing: 'gap' },
      settings: { master: 0.8, pulseVol: 0.55, pulseOn: true, snap: false, labels: true },
    };
  }

  function applyConfig(cfg) {
    const d = defaultConfig();
    const rings = Array.isArray(cfg.rings) && cfg.rings.length ? cfg.rings.slice(0, app.MAX_RINGS) : d.rings;
    world.rings = rings.map((r) => RG.makeRing(r && r.type, r || {}));
    const w = cfg.world || {};
    world.gravity = clamp(w.gravity, 0.5, 6, d.world.gravity);
    world.energy = clamp(w.energy, 0.2, 1, d.world.energy);
    world.ballR = clamp(w.ballR, 0.012, 0.04, d.world.ballR);
    world.jitter = clamp(w.jitter, 0, 15, d.world.jitter);
    world.size = clamp(w.size, 0.12, 1, d.world.size);
    world.spacing = w.spacing === 'none' ? 'none' : 'gap';
    const s = cfg.settings || {};
    app.settings = {
      master: clamp(s.master, 0, 1, d.settings.master),
      pulseVol: clamp(s.pulseVol, 0, 1, d.settings.pulseVol),
      pulseOn: typeof s.pulseOn === 'boolean' ? s.pulseOn : d.settings.pulseOn,
      snap: typeof s.snap === 'boolean' ? s.snap : d.settings.snap,
      labels: typeof s.labels === 'boolean' ? s.labels : d.settings.labels,
    };
    app.music = defaultMusic();
    world.layoutRings();
  }

  function serialize() {
    return {
      rings: world.rings.map((r) => ({ type: r.type, speed: r.speed, gap: r.gap, sel: r.sel, octave: r.octave })),
      world: { gravity: world.gravity, energy: world.energy, ballR: world.ballR, jitter: world.jitter, size: world.size, spacing: world.spacing },
      settings: { ...app.settings },
    };
  }

  function readHash() {
    try {
      const s = location.hash.slice(1);
      return s ? JSON.parse(atob(decodeURIComponent(s))) : null;
    } catch (e) {
      return null;
    }
  }

  function writeHash() {
    clearTimeout(app._hashTimer);
    history.replaceState(null, '', '#' + encodeURIComponent(btoa(JSON.stringify(serialize()))));
  }

  app.changed = () => {
    clearTimeout(app._hashTimer);
    app._hashTimer = setTimeout(writeHash, 400);
  };

  // ---- music state -------------------------------------------------------
  app.describeMusic = () => {
    const m = app.music;
    return {
      key: M.NOTE_NAMES[m.key],
      scale: M.SCALES[m.scale].name,
      chord: M.chordName(m.chord, m.key, m.scale),
      tempo: M.TEMPOS[m.tempo] + ' BPM',
      pattern: M.PATTERNS[m.pattern].name,
      instrument: M.INSTRUMENTS[m.instrument].name,
      filter: M.FILTERS[m.filter].name,
      echo: M.ECHOES[m.echo].name,
    };
  };

  function applyEcho() {
    const e = M.ECHOES[app.music.echo];
    audio.setEcho(M.echoTime(e, M.TEMPOS[app.music.tempo]), e.fb, e.wet);
  }

  app.applyAudioSettings = () => {
    const s = app.settings;
    audio.setMaster(s.master);
    audio.setPulseVolume(s.pulseOn ? s.pulseVol : 0);
    audio.setFilter(M.FILTERS[app.music.filter].freq);
    applyEcho();
  };

  // Change a piece of global music state. Returns true when it actually changed.
  function setMusic(key, v) {
    if (app.music[key] === v) return false;
    app.music[key] = v;
    if (key === 'filter') audio.setFilter(M.FILTERS[v].freq);
    if (key === 'echo' || key === 'tempo') applyEcho();
    if (key === 'key' || key === 'scale') app.ui.refreshChips();
    app.ui.updateHud(key);
    return true;
  }

  function doAction(ring, seg, impact) {
    const v = ring.sel[seg];
    const m = app.music;
    const vel = Math.min(1, 0.3 + impact * 0.22);
    const t = app.settings.snap && app.pulse.running ? app.pulse.nextGrid(audio.now()) : audio.now();
    const inst = M.INSTRUMENTS[m.instrument].id;
    const MAP = { tempo: 'tempo', rhythm: 'pattern', scale: 'scale', key: 'key', instrument: 'instrument', filter: 'filter', echo: 'echo' };

    switch (ring.type) {
      case 'note':
        audio.playNote(M.degreeToMidi(v, ring.octave, m.key, m.scale), inst, vel, t);
        break;
      case 'chord':
        setMusic('chord', v);
        audio.strum(M.chordMidis(v, ring.octave, m.key, m.scale), inst, vel, t);
        break;
      case 'drum':
        audio.drum(M.DRUMS[v].id, vel, t);
        break;
      default:
        // Control rings (tempo, rhythm, scale, ...) only change their setting.
        // They make no sound of their own.
        setMusic(MAP[ring.type], v);
    }
  }

  world.onHit = (ring, seg, ball, x, y, impact) => {
    ring.flash[seg] = 1;
    ball.flash = 1;
    app.renderer.ripple(x, y, M.PALETTE[seg]);
    app.ui.flashChip(ring, seg);
    if (audio.ready && !app.paused) doAction(ring, seg, impact);
  };

  // ---- balls and rings ------------------------------------------------------
  function spawnPoint() {
    const rs = world.rings;
    const r = rs.length > 1 ? (rs[0].r + rs[1].r) / 2 : 0.5;
    const a = (-150 + Math.random() * 120) * DEG;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r };
  }

  app.addBall = (x, y, vx = 0, vy = 0) => {
    if (world.balls.length >= app.MAX_BALLS) return;
    if (x === undefined) {
      const p = spawnPoint();
      x = p.x; y = p.y;
      vx = (Math.random() - 0.5) * 1.5;
    }
    world.addBall(x, y, vx, vy);
    app.ui.updateBallCount();
  };

  // The first ball drops from the middle of the arena with a tiny sideways drift.
  app.addCenterBall = () => app.addBall(0, 0, (Math.random() - 0.5) * 0.4, 0);

  app.clearBalls = () => {
    world.balls = [];
    app.ui.updateBallCount();
  };

  app.setRingType = (ring, type) => {
    const T = RG.TYPES[type];
    ring.type = type;
    ring.sel = [...T.def];
    ring.octave = T.octave || 4;
    ring.flash.fill(0);
    app.ui.renderRings();
    app.changed();
  };

  app.toggleOption = (ring, v) => {
    const i = ring.sel.indexOf(v);
    if (i >= 0) {
      if (ring.sel.length <= 1) return;
      ring.sel.splice(i, 1);
    } else {
      if (ring.sel.length >= RG.MAX_PARTS) return;
      ring.sel.push(v);
      ring.sel.sort((a, b) => a - b);
    }
    ring.flash.fill(0);
    app.ui.renderChips(ring);
    app.changed();
  };

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function randomSel(T) {
    const all = [...Array(T.count).keys()].sort(() => Math.random() - 0.5);
    const n = Math.min(T.count, Math.round(rand(3, 6)));
    return all.slice(0, n).sort((a, b) => a - b);
  }

  function randomRing(i) {
    const pool = i === 0
      ? ['note', 'note', 'drum', 'chord']
      : ['note', 'note', 'note', 'drum', 'drum', 'chord', 'tempo', 'rhythm', 'scale', 'key', 'instrument', 'filter', 'echo'];
    const type = pick(pool);
    const T = RG.TYPES[type];
    return RG.makeRing(type, {
      speed: Math.round((Math.random() < 0.5 ? -1 : 1) * rand(10, 90)),
      gap: Math.round(rand(50, 140)),
      sel: type === 'note' ? [...Array(Math.round(rand(4, 8))).keys()] : randomSel(T),
      octave: type === 'note' ? (i === 0 ? 3 : Math.round(rand(4, 5))) : T.octave,
    });
  }

  app.addRing = () => {
    if (world.rings.length >= app.MAX_RINGS) return;
    world.rings.push(randomRing(world.rings.length));
    world.layoutRings();
    app.ui.renderRings();
    app.changed();
  };

  app.setSize = (v) => {
    world.size = v;
    world.layoutRings();
    app.changed();
  };

  app.setSpacing = (mode) => {
    world.spacing = mode === 'none' ? 'none' : 'gap';
    world.layoutRings();
    app.changed();
  };

  app.removeRing = (ring) => {
    if (world.rings.length <= 1) return;
    world.rings = world.rings.filter((r) => r !== ring);
    world.layoutRings();
    app.renderer.highlightId = null;
    app.ui.renderRings();
    app.changed();
  };

  app.randomize = () => {
    const n = Math.round(rand(4, 7));
    const rings = [];
    for (let i = 0; i < n; i++) rings.push(randomRing(i));
    if (!rings.some((r) => r.type === 'note')) rings[1].type = 'note', rings[1].sel = [0, 1, 2, 3, 4], rings[1].octave = 5;
    world.rings = rings;
    world.layoutRings();
    app.ui.renderRings();
    app.changed();
  };

  app.reset = () => {
    applyConfig(defaultConfig());
    world.balls = [];
    app.ui.build();
    app.ui.updateHud();
    app.applyAudioSettings();
    history.replaceState(null, '', location.pathname + location.search);
    if (app.started) app.addCenterBall();
  };

  app.share = (btn) => {
    writeHash();
    const done = (msg) => {
      const old = 'Copy share link';
      btn.textContent = msg;
      setTimeout(() => { btn.textContent = old; }, 1600);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(location.href).then(() => done('Link copied'), () => done('Copy the address bar'));
    } else {
      done('Copy the address bar');
    }
  };

  app.togglePause = () => {
    if (!app.started) return;
    app.paused = !app.paused;
    if (app.paused) app.pulse.stop();
    else app.pulse.start();
    app.ui.setPaused(app.paused);
  };

  function start() {
    if (app.started) return;
    audio.start();
    app.applyAudioSettings();
    app.started = true;
    $('#start').classList.add('gone');
    app.pulse.start();
    if (!world.balls.length) app.addCenterBall();
  }

  // ---- input --------------------------------------------------------------
  function ringUnder(p, slack = 12) {
    const d = Math.hypot(p.x, p.y);
    // About `slack` px of room, but never more than half the space between rings.
    const rs = world.rings;
    const minStep = rs.length > 1 ? Math.min(...rs.slice(1).map((r, i) => rs[i].r - r.r)) : 1;
    const reach = Math.min(world.thickness / 2 + slack / app.renderer.R, minStep / 2);
    for (let i = 0; i < world.rings.length; i++) {
      const ring = world.rings[i];
      if (Math.abs(d - ring.r) > reach) continue;
      const local = M.mod(Math.atan2(p.y, p.x) / DEG - ring.angle, 360);
      return { ring, index: i, seg: local < ring.gap ? -1 : MB.segmentAt(ring, local) };
    }
    return null;
  }

  function bindInput() {
    const canvas = $('#scene');
    let drag = null;
    let hover = null;
    let tipTimer = 0;
    // Pointer position in CSS pixels relative to the canvas. offsetX is unreliable under page zoom.
    const pos = (e) => { const r = canvas.getBoundingClientRect(); return { px: e.clientX - r.left, py: e.clientY - r.top }; };

    canvas.addEventListener('pointerdown', (e) => {
      if (!app.started) return;
      const { px, py } = pos(e);
      const p = app.renderer.toWorld(px, py);
      // Touch has no hover: tapping a ring explains it and opens its settings instead of dropping a ball.
      if (e.pointerType === 'touch') {
        const hit = ringUnder(p, 16);
        if (hit) {
          app.renderer.highlightId = hit.ring.id;
          // Phones: open the Rings sheet right at this ring's card.
          if (app.ui.openSheet('rings')) { app.ui.pickRing(hit.ring, false); return; }
          app.ui.showTip(px, py, hit);
          app.ui.pickRing(hit.ring);
          clearTimeout(tipTimer);
          tipTimer = setTimeout(() => {
            app.ui.showTip(0, 0, null);
            if (app.renderer.highlightId === hit.ring.id) app.renderer.highlightId = null;
          }, 2600);
          return;
        }
      }
      if (Math.hypot(p.x, p.y) > (world.rings[0] ? world.rings[0].r : 1)) return;
      drag = { sx: p.x, sy: p.y, x: p.x, y: p.y };
      app.renderer.drag = drag;
      canvas.setPointerCapture(e.pointerId);
      app.ui.showTip(0, 0, null);
    });

    canvas.addEventListener('pointermove', (e) => {
      const { px, py } = pos(e);
      const p = app.renderer.toWorld(px, py);
      if (drag) { drag.x = p.x; drag.y = p.y; return; }
      if (e.pointerType !== 'touch') hover = { px, py, p };
    });

    const end = () => {
      if (!drag) return;
      const dx = drag.x - drag.sx, dy = drag.y - drag.sy;
      const len = Math.hypot(dx, dy);
      if (len < 0.03) {
        app.addBall(drag.sx, drag.sy, 0, 0);
      } else {
        const k = Math.min(4, len * 4) / len;
        app.addBall(drag.sx, drag.sy, dx * k, dy * k);
      }
      drag = null;
      app.renderer.drag = null;
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', () => { drag = null; app.renderer.drag = null; });
    canvas.addEventListener('pointerleave', () => { hover = null; app.ui.showTip(0, 0, null); });

    // Rings keep spinning under a still pointer, so refresh the tooltip a few times a second.
    setInterval(() => {
      if (hover && !drag) app.ui.showTip(hover.px, hover.py, ringUnder(hover.p));
    }, 120);

    $('#startBtn').addEventListener('click', start);

    document.addEventListener('keydown', (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA' || e.metaKey || e.ctrlKey) return;
      if (e.code === 'Space') {
        if (tag === 'BUTTON') return;
        e.preventDefault();
        if (!app.started) start();
        else app.togglePause();
      } else if (e.key === 'b' || e.key === 'B') {
        if (app.started) app.addBall();
      }
    });
  }

  // ---- loop ---------------------------------------------------------------
  let last = performance.now();
  let acc = 0;
  function frame(ts) {
    const dt = Math.min(0.05, Math.max(0, (ts - last) / 1000));
    last = ts;
    if (!app.paused) {
      acc += dt;
      while (acc >= STEP) { world.step(STEP); acc -= STEP; }
      for (const b of world.balls) {
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 16) b.trail.shift();
      }
    }
    for (const ring of world.rings) {
      for (let k = 0; k < ring.flash.length; k++) ring.flash[k] = Math.max(0, ring.flash[k] - dt * 2.2);
    }
    for (const b of world.balls) b.flash = Math.max(0, b.flash - dt * 4);
    const beat = app.pulse.running && app.settings.pulseOn ? app.pulse.beatLevel(audio.now()) : 0;
    app.renderer.draw(dt, beat);
    requestAnimationFrame(frame);
  }

  // ---- boot ---------------------------------------------------------------
  applyConfig(readHash() || defaultConfig());
  app.renderer = new MB.Renderer($('#scene'), world, app);
  app.ui = new MB.UI(app);
  bindInput();
  requestAnimationFrame(frame);
})(window.MB);
