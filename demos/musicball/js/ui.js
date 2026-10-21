// Side panel, status bar, info dialog and canvas tooltip.
window.MB = window.MB || {};
(function (MB) {
  'use strict';
  const M = MB.music;
  const RG = MB.rings;
  const $ = (s) => document.querySelector(s);
  // Phones and tablets: no hover, so wording says "tap" and the tooltip opens on tap.
  const TOUCH = matchMedia('(hover: none)').matches;
  const CLICK = TOUCH ? 'Tap' : 'Click';
  // Phones: the panel opens as a sheet from the bottom bar. Keep in sync with css/style.css.
  const SHEET_MQ = matchMedia('(max-width: 860px) and (orientation: portrait), (max-height: 520px) and (orientation: landscape)');
  const SHEETS = { rings: 'Rings', world: 'World', sound: 'Background sound' };

  // Tiny element builder: h('div', {class: 'x', onclick: fn}, child, ...)
  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v == null) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  }

  let uid = 0;
  function slider({ label, min, max, step, value, fmt, onInput }) {
    const id = 'sl' + ++uid;
    const out = h('output', { for: id }, fmt(value));
    const input = h('input', { type: 'range', id, min, max, step });
    input.value = value;
    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      out.textContent = fmt(v);
      onInput(v);
    });
    return h('div', { class: 'slider' }, h('label', { for: id }, label), out, input);
  }

  function toggle({ label, value, onChange }) {
    const input = h('input', { type: 'checkbox', role: 'switch' });
    input.checked = value;
    input.addEventListener('change', () => onChange(input.checked));
    return h('label', { class: 'toggle' }, h('span', {}, label), input, h('i', { class: 'switch', 'aria-hidden': 'true' }));
  }

  // A row of buttons where exactly one is active: segmented({ label, value, options: [[value, text], ...], onChange })
  function segmented({ label, value, options, onChange }) {
    const group = h('div', { class: 'seg', role: 'radiogroup', 'aria-label': label });
    const btns = options.map(([v, text]) => {
      const b = h('button', { type: 'button', role: 'radio', 'aria-checked': String(v === value), class: v === value ? 'on' : null }, text);
      b.onclick = () => {
        for (const o of btns) { o.classList.toggle('on', o === b); o.setAttribute('aria-checked', String(o === b)); }
        onChange(v);
      };
      return b;
    });
    group.append(...btns);
    return h('div', { class: 'seg-row' }, h('span', {}, label), group);
  }

  const spinText = (v) => (v === 0 ? 'Still' : `${v > 0 ? '↻' : '↺'} ${Math.abs(v)}°/s`);

  class UI {
    constructor(app) {
      this.app = app;
      this.cards = new Map();
      this.buildHud();
      this.build();
      this.bind();
    }

    // ---- status bar over the canvas -----------------------------------
    buildHud() {
      const items = [
        ['key', 'Key'], ['scale', 'Scale'], ['chord', 'Chord'], ['tempo', 'Tempo'],
        ['pattern', 'Rhythm'], ['instrument', 'Instrument'], ['filter', 'Filter'], ['echo', 'Echo'],
      ];
      const hud = $('#hud');
      hud.innerHTML = '';
      this.hud = {};
      for (const [k, label] of items) {
        const b = h('b');
        const el = h('div', { class: 'hud-item' }, h('span', {}, label), b);
        hud.append(el);
        this.hud[k] = { el, b };
      }
      this.updateHud();
    }

    updateHud(flashKey) {
      const d = this.app.describeMusic();
      for (const k in this.hud) this.hud[k].b.textContent = d[k];
      const item = flashKey && this.hud[flashKey];
      if (item) {
        item.el.classList.remove('flash');
        void item.el.offsetWidth; // restart the animation
        item.el.classList.add('flash');
      }
    }

    // ---- panel ---------------------------------------------------------
    build() {
      const { app } = this;
      const w = app.world, s = app.settings;

      const world = $('#worldGroup');
      world.replaceChildren(h('h2', {}, 'World'),
        slider({ label: 'Gravity', min: 0.5, max: 6, step: 0.1, value: w.gravity, fmt: (v) => v.toFixed(1),
          onInput: (v) => { w.gravity = v; app.changed(); } }),
        slider({ label: 'Bounce height', min: 0.2, max: 1, step: 0.01, value: w.energy, fmt: (v) => Math.round(v * 100) + '%',
          onInput: (v) => { w.energy = v; app.changed(); } }),
        slider({ label: 'Ball size', min: 0.012, max: 0.04, step: 0.001, value: w.ballR, fmt: (v) => Math.round(v * 1000) / 10 + '%',
          onInput: (v) => { w.ballR = v; w.balls.forEach((b) => w.resolve(b)); app.changed(); } }),
        slider({ label: 'Randomness', min: 0, max: 15, step: 0.5, value: w.jitter, fmt: (v) => v + '°',
          onInput: (v) => { w.jitter = v; app.changed(); } }),
        slider({ label: 'Ring size', min: 0.12, max: 1, step: 0.01, value: w.size, fmt: (v) => Math.round(v * 100) + '%',
          onInput: (v) => app.setSize(v) }),
        segmented({ label: 'Space between rings', value: w.spacing, options: [['gap', 'Gap'], ['none', 'No gap']],
          onChange: (v) => app.setSpacing(v) }),
        toggle({ label: 'Show ring names', value: s.labels, onChange: (v) => { s.labels = v; app.changed(); } }),
      );

      const sound = $('#soundGroup');
      sound.replaceChildren(h('h2', {}, 'Sound'),
        slider({ label: 'Volume', min: 0, max: 1, step: 0.01, value: s.master, fmt: (v) => Math.round(v * 100) + '%',
          onInput: (v) => { s.master = v; app.applyAudioSettings(); app.changed(); } }),
        toggle({ label: 'Background beat', value: s.pulseOn, onChange: (v) => { s.pulseOn = v; app.applyAudioSettings(); app.changed(); } }),
        slider({ label: 'Beat volume', min: 0, max: 1, step: 0.01, value: s.pulseVol, fmt: (v) => Math.round(v * 100) + '%',
          onInput: (v) => { s.pulseVol = v; app.applyAudioSettings(); app.changed(); } }),
        toggle({ label: 'Snap hits to the beat', value: s.snap, onChange: (v) => { s.snap = v; app.changed(); } }),
      );

      this.renderRings();
      this.updateBallCount();
    }

    bind() {
      const { app } = this;
      $('#addBall').onclick = () => app.addBall();
      $('#clearBalls').onclick = () => app.clearBalls();
      $('#addRing').onclick = () => app.addRing();
      $('#randomize').onclick = () => app.randomize();
      $('#playBtn').onclick = () => app.togglePause();
      $('#infoBtn').onclick = () => this.openInfo();
      $('#reset').onclick = () => app.reset();
      $('#share').onclick = () => app.share($('#share'));
      $('#info').addEventListener('click', (e) => { if (e.target.id === 'info') e.target.close(); });

      // Phone bottom bar and sheet
      $('#tabPlay').onclick = () => app.togglePause();
      $('#tabInfo').onclick = () => this.openInfo();
      for (const tab of document.querySelectorAll('.tab[data-sheet]')) {
        tab.onclick = () => (this.sheet === tab.dataset.sheet ? this.closeSheet() : this.openSheet(tab.dataset.sheet));
      }
      $('#sheetClose').onclick = () => this.closeSheet();
      $('#sheetBackdrop').onclick = () => this.closeSheet();
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.sheet) this.closeSheet(); });
      SHEET_MQ.addEventListener('change', () => this.closeSheet());
      this.bindSheetDrag();
    }

    // ---- phone sheet ---------------------------------------------------
    // Opens one part of the panel as a sheet. Returns false on wide screens, where the panel is always shown.
    openSheet(name) {
      if (!SHEET_MQ.matches) return false;
      const panel = $('#panel');
      if (this.sheet !== name) panel.scrollTop = 0;
      this.sheet = name;
      panel.dataset.sheet = name;
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-modal', 'true');
      panel.setAttribute('aria-label', SHEETS[name]);
      $('#sheetTitle').textContent = SHEETS[name];
      panel.classList.add('open');
      $('#sheetBackdrop').classList.add('open');
      for (const tab of document.querySelectorAll('.tab[data-sheet]')) {
        const on = tab.dataset.sheet === name;
        tab.classList.toggle('on', on);
        tab.setAttribute('aria-expanded', String(on));
      }
      return true;
    }

    closeSheet() {
      if (!this.sheet) return;
      const panel = $('#panel');
      const tab = document.querySelector(`.tab[data-sheet="${this.sheet}"]`);
      this.sheet = null;
      panel.classList.remove('open');
      for (const a of ['role', 'aria-modal', 'aria-label']) panel.removeAttribute(a);
      $('#sheetBackdrop').classList.remove('open');
      for (const t of document.querySelectorAll('.tab[data-sheet]')) {
        t.classList.remove('on');
        t.setAttribute('aria-expanded', 'false');
      }
      this.app.renderer.highlightId = null;
      if (panel.contains(document.activeElement) && tab) tab.focus({ preventScroll: true });
    }

    // Drag the sheet's header down to close it.
    bindSheetDrag() {
      const panel = $('#panel'), head = panel.querySelector('.panel-head');
      let drag = null;
      head.addEventListener('pointerdown', (e) => {
        if (!this.sheet || e.target.closest('button')) return;
        drag = { y: e.clientY, t: performance.now(), dy: 0 };
        head.setPointerCapture(e.pointerId);
        panel.classList.add('dragging');
      });
      head.addEventListener('pointermove', (e) => {
        if (!drag) return;
        drag.dy = Math.max(0, e.clientY - drag.y);
        panel.style.transform = `translateY(${drag.dy}px)`;
      });
      const end = () => {
        if (!drag) return;
        const fast = drag.dy / Math.max(1, performance.now() - drag.t) > 0.5;
        panel.classList.remove('dragging');
        panel.style.transform = '';
        if (drag.dy > 90 || (fast && drag.dy > 24)) this.closeSheet();
        drag = null;
      };
      head.addEventListener('pointerup', end);
      head.addEventListener('pointercancel', end);
    }

    updateBallCount() {
      const n = this.app.world.balls.length;
      $('#ballCount').textContent = n;
      $('#addBall').disabled = n >= this.app.MAX_BALLS;
    }

    setPaused(p) {
      const b = $('#playBtn');
      b.textContent = p ? '▶' : '❚❚';
      b.title = p ? 'Play (Space)' : 'Pause (Space)';
      b.setAttribute('aria-label', b.title);
      const tab = $('#tabPlay');
      tab.classList.toggle('paused', p);
      tab.setAttribute('aria-label', p ? 'Play' : 'Pause');
      tab.querySelector('span').textContent = p ? 'Play' : 'Pause';
    }

    // ---- ring cards ----------------------------------------------------
    renderRings() {
      const { app } = this;
      const list = $('#rings');
      list.replaceChildren();
      this.cards.clear();
      app.world.rings.forEach((ring, i) => list.append(this.ringCard(ring, i)));
      $('#addRing').disabled = app.world.rings.length >= app.MAX_RINGS;
    }

    ringCard(ring, i) {
      const { app } = this;
      const T = RG.TYPES[ring.type];
      const count = app.world.rings.length;

      const select = h('select', { class: 'ring-type', 'aria-label': `Ring ${i + 1} action` },
        RG.ORDER.map((t) => {
          const o = h('option', { value: t }, `${RG.TYPES[t].icon}  ${RG.TYPES[t].name}`);
          o.selected = t === ring.type;
          return o;
        }));
      select.onchange = () => app.setRingType(ring, select.value);

      const desc = h('p', { class: 'ring-desc' }, T.desc);
      desc.hidden = true;
      const infoBtn = h('button', { class: 'icon-btn sm', title: 'What does this ring do?', 'aria-label': 'What does this ring do?' }, 'i');
      infoBtn.onclick = () => { desc.hidden = !desc.hidden; infoBtn.classList.toggle('on', !desc.hidden); };
      const removeBtn = h('button', { class: 'icon-btn sm', title: 'Remove ring', 'aria-label': 'Remove ring', disabled: count <= 1 }, '×');
      removeBtn.onclick = () => app.removeRing(ring);

      const parts = [];
      parts.push(slider({ label: 'Spin', min: -180, max: 180, step: 1, value: ring.speed, fmt: spinText,
        onInput: (v) => { ring.speed = v; app.changed(); } }));
      if (i === 0) {
        parts.push(h('div', { class: 'wall-note' }, 'Outer wall. It has no gap, so balls can never escape.'));
      } else {
        parts.push(slider({ label: 'Gap', min: 0, max: 300, step: 1, value: ring.gap, fmt: (v) => (v === 0 ? 'Closed' : v + '°'),
          onInput: (v) => { ring.gap = v; app.changed(); } }));
      }
      if (T.octave) {
        parts.push(slider({ label: 'Octave', min: 2, max: 6, step: 1, value: ring.octave, fmt: (v) => String(v),
          onInput: (v) => { ring.octave = v; this.renderChips(ring); app.changed(); } }));
      }

      const chipsWrap = h('div', { class: 'chips' });
      const card = h('div', { class: 'ring-card' },
        h('div', { class: 'ring-head' }, h('span', { class: 'ring-num' }, i + 1), select, infoBtn, removeBtn),
        desc,
        ...parts,
        h('div', { class: 'chips-label' }, `Colored parts. ${CLICK} to add or remove.`),
        chipsWrap);
      card.addEventListener('mouseenter', () => { app.renderer.highlightId = ring.id; });
      card.addEventListener('mouseleave', () => { app.renderer.highlightId = null; });
      // Touch has no hover: light up the ring while one of its controls is in use.
      card.addEventListener('focusin', () => { app.renderer.highlightId = ring.id; });
      card.addEventListener('focusout', (e) => {
        if (!card.contains(e.relatedTarget) && app.renderer.highlightId === ring.id) app.renderer.highlightId = null;
      });

      this.cards.set(ring.id, { card, chipsWrap, chips: [] });
      this.renderChips(ring);
      return card;
    }

    renderChips(ring) {
      const c = this.cards.get(ring.id);
      if (!c) return;
      const T = RG.TYPES[ring.type];
      const full = ring.sel.length >= RG.MAX_PARTS;
      c.chipsWrap.replaceChildren();
      c.chips = [];
      for (let v = 0; v < T.count; v++) {
        const seg = ring.sel.indexOf(v);
        const on = seg >= 0;
        const chip = h('button', {
          class: 'chip' + (on ? ' on' : ''),
          style: on ? `--c:${M.PALETTE[seg]}` : '',
          title: on ? `${M.COLOR_NAMES[seg]} part. ${CLICK} to remove.` : full ? 'A ring can have at most 8 parts' : `${CLICK} to add`,
          'aria-pressed': on ? 'true' : 'false',
          disabled: !on && full,
        }, h('i', { class: 'dot' }), T.label(v, this.app.music, ring));
        chip.onclick = () => this.app.toggleOption(ring, v);
        if (on) c.chips[seg] = chip;
        c.chipsWrap.append(chip);
      }
    }

    // Note and Chord labels depend on the key and scale.
    refreshChips() {
      for (const ring of this.app.world.rings) {
        if (ring.type === 'note' || ring.type === 'chord') this.renderChips(ring);
      }
    }

    // Scroll a ring's card into view and light it up, after the ring was tapped in the arena.
    pickRing(ring, smooth = true) {
      const c = this.cards.get(ring.id);
      if (!c) return;
      c.card.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
      c.card.classList.remove('picked');
      void c.card.offsetWidth; // restart the animation
      c.card.classList.add('picked');
    }

    flashChip(ring, seg) {
      const chip = this.cards.get(ring.id)?.chips[seg];
      if (!chip || !chip.animate) return;
      const col = M.PALETTE[seg];
      chip.animate(
        [{ transform: 'scale(1.12)', boxShadow: `0 0 16px ${col}` }, { transform: 'scale(1)', boxShadow: '0 0 0 transparent' }],
        { duration: 380, easing: 'ease-out' });
    }

    // ---- info dialog ---------------------------------------------------
    legend(ring) {
      const T = RG.TYPES[ring.type];
      return h('ul', { class: 'legend' }, ring.sel.map((v, k) =>
        h('li', {}, h('i', { class: 'dot', style: `background:${M.PALETTE[k]}` }),
          h('span', { class: 'cname' }, M.COLOR_NAMES[k]), T.label(v, this.app.music, ring))));
    }

    openInfo() {
      const { app } = this;
      const body = $('#infoBody');
      body.replaceChildren(
        h('div', { class: 'info-head' },
          h('h2', {}, 'How MusicBall works'),
          h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: () => $('#info').close() }, '×')),
        h('ol', { class: 'how' },
          h('li', {}, 'Balls bounce around under gravity and never lose energy.'),
          h('li', {}, 'Rings spin. Inner rings have a gap that lets balls pass through. The outer wall is closed.'),
          h('li', {}, 'Ring size sets how big the innermost ring is. Extra rings are added outside it, so the set grows until it reaches the edge.'),
          h('li', {}, 'Space between rings sets whether rings are spread out or packed together. Packed rings only let a ball through when their gaps line up.'),
          h('li', {}, 'When a ball hits a ring, the colored part it touches decides what happens. Part 1 is always yellow, part 2 green, and so on.'),
          h('li', {}, 'A background beat keeps time. Some rings change it, like its tempo, rhythm or chord.')),
        h('h3', {}, 'Your rings, from the outside in'),
        h('div', { class: 'ring-legends' }, app.world.rings.map((ring, i) => {
          const T = RG.TYPES[ring.type];
          return h('div', { class: 'legend-card' },
            h('div', { class: 'legend-title' }, h('span', { class: 'ring-num' }, i + 1), `${T.icon} ${T.name}`),
            h('p', {}, T.desc),
            this.legend(ring));
        })),
        h('h3', {}, 'Every ring type'),
        h('dl', { class: 'types' }, RG.ORDER.flatMap((t) => [
          h('dt', {}, `${RG.TYPES[t].icon} ${RG.TYPES[t].name}`),
          h('dd', {}, RG.TYPES[t].desc)])),
        h('h3', {}, 'Controls'),
        h('ul', { class: 'how' },
          h('li', {}, `${CLICK} inside the circle to drop a ball. Drag to throw one.`),
          TOUCH
            ? h('li', {}, 'Tap a ring to open its settings. The buttons along the bottom open Rings, World and Sound.')
            : h('li', {}, 'Hover a ring to see what the part under your pointer does.'),
          !TOUCH && h('li', {}, 'Press Space to pause and B to add a ball.'),
          h('li', {}, 'Copy share link saves your rings and settings in the address.')),
      );
      $('#info').showModal();
    }

    // ---- canvas tooltip --------------------------------------------------
    showTip(px, py, info) {
      const tip = $('#tip');
      if (!info) { tip.hidden = true; return; }
      const { ring, index, seg } = info;
      const T = RG.TYPES[ring.type];
      const kids = [h('b', {}, `Ring ${index + 1} · ${T.icon} ${T.name}`)];
      if (seg < 0) {
        kids.push(h('div', {}, 'Gap. Balls pass through here.'));
      } else {
        kids.push(h('div', { class: 'tip-part' },
          h('i', { class: 'dot', style: `background:${M.PALETTE[seg]}` }),
          `${M.COLOR_NAMES[seg]}: ${T.label(ring.sel[seg], this.app.music, ring)}`));
      }
      kids.push(h('small', {}, T.desc));
      tip.replaceChildren(...kids);
      tip.hidden = false;
      const stage = tip.parentElement.getBoundingClientRect();
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      if (TOUCH) {
        // Above the finger, so the finger does not cover it.
        tip.style.left = Math.max(8, Math.min(stage.width - tw - 8, px - tw / 2)) + 'px';
        tip.style.top = (py - th - 28 > 8 ? py - th - 28 : Math.min(stage.height - th - 8, py + 28)) + 'px';
      } else {
        tip.style.left = Math.min(stage.width - tw - 8, px + 14) + 'px';
        tip.style.top = Math.min(stage.height - th - 8, py + 14) + 'px';
      }
    }
  }

  MB.UI = UI;
})(window.MB);
