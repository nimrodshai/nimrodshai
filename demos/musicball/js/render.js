// Canvas renderer: arena, rings with colored parts, ripples, balls and labels.
window.MB = window.MB || {};
(function (MB) {
  'use strict';
  const M = MB.music;
  const DEG = Math.PI / 180;
  const TAU = Math.PI * 2;

  const rgbCache = {};
  function rgb(hex) {
    if (!rgbCache[hex]) {
      const n = parseInt(hex.slice(1), 16);
      rgbCache[hex] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    return rgbCache[hex];
  }
  // Color with alpha, optionally mixed toward white by `white` (0..1).
  function rgba(hex, a, white = 0) {
    const m = (c) => Math.round(c + (255 - c) * white);
    const [r, g, b] = rgb(hex);
    return `rgba(${m(r)},${m(g)},${m(b)},${Math.min(1, a)})`;
  }

  class Renderer {
    constructor(canvas, world, app) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.world = world;
      this.app = app;
      this.ripples = [];
      this.highlightId = null;
      this.drag = null;
      this.resize();
      // The status bar and hint can change height (wrapping, rotation), so watch them too.
      const ro = new ResizeObserver(() => this.resize());
      ro.observe(canvas);
      for (const id of ['hud', 'hint']) { const el = document.getElementById(id); if (el) ro.observe(el); }
      // Rotating a phone can settle the layout after the observers fire, so measure once more.
      addEventListener('resize', () => this.resize());
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
      this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
      this.w = rect.width; this.h = rect.height; this.dpr = dpr;
      // Leave room for the status bar above and the hint below the arena.
      const hud = document.getElementById('hud'), hint = document.getElementById('hint');
      const top = hud && hud.offsetHeight ? hud.offsetTop + hud.offsetHeight + 6 : 64;
      const bottom = hint && hint.offsetHeight ? rect.height - hint.offsetTop + 4 : 12;
      const avail = Math.min(this.w - 32, this.h - top - bottom);
      this.R = Math.max(60, avail / 2 - 4);
      this.cx = this.w / 2;
      this.cy = top + (this.h - top - bottom) / 2;
    }

    toWorld(px, py) { return { x: (px - this.cx) / this.R, y: (py - this.cy) / this.R }; }
    ripple(x, y, color) {
      this.ripples.push({ x, y, color, t: 0 });
      if (this.ripples.length > 80) this.ripples.shift();
    }

    draw(dt, beat) {
      const { ctx, R, cx, cy, world } = this;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, this.w, this.h);

      // Arena floor, breathing with the beat.
      const wall = world.rings.length ? world.rings[0].r : 1;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * wall);
      g.addColorStop(0, `rgba(140,123,255,${0.06 + beat * 0.12})`);
      g.addColorStop(0.65, 'rgba(90,100,200,0.03)');
      g.addColorStop(1, 'rgba(255,255,255,0.02)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R * wall, 0, TAU); ctx.fill();

      const lw = world.thickness * R;
      world.rings.forEach((ring) => this.drawRing(ring, lw));

      // Ripples
      for (const rp of this.ripples) rp.t += dt;
      this.ripples = this.ripples.filter((rp) => rp.t < 0.55);
      for (const rp of this.ripples) {
        const k = rp.t / 0.55;
        ctx.strokeStyle = rgba(rp.color, (1 - k) * 0.7);
        ctx.lineWidth = 2 * (1 - k) + 0.5;
        ctx.beginPath();
        ctx.arc(cx + rp.x * R, cy + rp.y * R, R * (world.ballR + k * 0.08), 0, TAU);
        ctx.stroke();
      }

      this.drawDrag();
      for (const b of world.balls) this.drawBall(b);
      if (this.app.settings.labels) world.rings.forEach((ring, i) => this.drawLabel(ring, i));
    }

    drawRing(ring, lw) {
      const { ctx, R, cx, cy } = this;
      const n = ring.sel.length, gap = ring.gap;
      const segW = (360 - gap) / n;
      const sep = n > 1 ? Math.min(2, segW * 0.12) : 0;
      const rr = ring.r * R;

      if (this.highlightId === ring.id) {
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 5]);
        for (const off of [-1.6, 1.6]) {
          ctx.beginPath(); ctx.arc(cx, cy, rr + off * lw, 0, TAU); ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      ctx.lineCap = 'butt';
      for (let k = 0; k < n; k++) {
        const startPad = k > 0 || gap === 0 ? sep / 2 : 0;
        const endPad = k < n - 1 || gap === 0 ? sep / 2 : 0;
        const a0 = (ring.angle + gap + k * segW + startPad) * DEG;
        const a1 = (ring.angle + gap + (k + 1) * segW - endPad) * DEG;
        const col = M.PALETTE[k];
        const f = ring.flash[k];
        ctx.beginPath(); ctx.arc(cx, cy, rr, a0, a1);
        ctx.strokeStyle = rgba(col, 0.1 + f * 0.3);
        ctx.lineWidth = lw * (2.4 + f * 2);
        ctx.stroke();
        ctx.strokeStyle = rgba(col, 0.8 + f * 0.2, f * 0.55);
        ctx.lineWidth = lw * (1 + f * 0.4);
        ctx.stroke();
      }

      // Rounded ends of the arc, which balls can also bounce off.
      if (gap > 0) {
        for (const [ang, k] of [[ring.angle + gap, 0], [ring.angle + 360, n - 1]]) {
          const f = ring.flash[k];
          ctx.fillStyle = rgba(M.PALETTE[k], 0.85 + f * 0.15, f * 0.55);
          ctx.beginPath();
          ctx.arc(cx + Math.cos(ang * DEG) * rr, cy + Math.sin(ang * DEG) * rr, (lw * (1 + f * 0.4)) / 2, 0, TAU);
          ctx.fill();
        }
      }
    }

    // A small name tag that rides in the middle of the ring's gap.
    drawLabel(ring, i) {
      const { ctx, R, cx, cy } = this;
      const T = MB.rings.TYPES[ring.type];
      const a = (ring.angle + ring.gap / 2) * DEG;
      // The wall has no gap, so its tag sits just inside it to stay on screen. When the
      // rings are packed together it moves inside the innermost ring, where there is room.
      const rings = this.world.rings;
      const packed = rings.length > 1 && rings[0].r - rings[1].r < this.world.thickness * 2;
      const innerR = packed ? rings[rings.length - 1].r : ring.r;
      const rr = i === 0 ? innerR * R - this.world.thickness * R - 16 : ring.r * R;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      const text = `${i + 1}  ${T.icon} ${T.name}`;
      ctx.font = '600 11px Inter, system-ui, sans-serif';
      const w = ctx.measureText(text).width + 14, h = 20;
      ctx.fillStyle = this.highlightId === ring.id ? 'rgba(40,44,80,0.95)' : 'rgba(10,12,26,0.82)';
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 1;
      roundRect(ctx, x - w / 2, y - h / 2, w, h, 10);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y + 0.5);
    }

    drawBall(b) {
      const { ctx, R, cx, cy } = this;
      const br = this.world.ballR * R;
      const tr = b.trail;
      ctx.lineCap = 'round';
      for (let j = 1; j < tr.length; j++) {
        const k = j / tr.length;
        ctx.strokeStyle = `hsla(${b.hue},90%,70%,${k * 0.35})`;
        ctx.lineWidth = br * 1.6 * k;
        ctx.beginPath();
        ctx.moveTo(cx + tr[j - 1].x * R, cy + tr[j - 1].y * R);
        ctx.lineTo(cx + tr[j].x * R, cy + tr[j].y * R);
        ctx.stroke();
      }
      const x = cx + b.x * R, y = cy + b.y * R;
      const gr = br * 4 * (1 + b.flash * 0.6);
      const g = ctx.createRadialGradient(x, y, 0, x, y, gr);
      g.addColorStop(0, `hsla(${b.hue},95%,72%,${0.45 + b.flash * 0.3})`);
      g.addColorStop(1, `hsla(${b.hue},95%,72%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, gr, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x, y, br * (1 + b.flash * 0.25), 0, TAU); ctx.fill();
    }

    drawDrag() {
      const d = this.drag;
      if (!d) return;
      const { ctx, R, cx, cy } = this;
      const x0 = cx + d.sx * R, y0 = cy + d.sy * R;
      const x1 = cx + d.x * R, y1 = cy + d.y * R;
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.setLineDash([]);
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len > 8) {
        const a = Math.atan2(y1 - y0, x1 - x0);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 - Math.cos(a - 0.4) * 10, y1 - Math.sin(a - 0.4) * 10);
        ctx.lineTo(x1 - Math.cos(a + 0.4) * 10, y1 - Math.sin(a + 0.4) * 10);
        ctx.closePath(); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(x0, y0, this.world.ballR * R, 0, TAU);
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.stroke();
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  MB.Renderer = Renderer;
})(window.MB);
