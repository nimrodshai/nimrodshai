// Physics in normalized units: the arena center is (0,0), a radius of 1 reaches the
// edge of the stage, and y points down. The renderer scales this to pixels.
window.MB = window.MB || {};
(function (MB) {
  'use strict';
  const DEG = Math.PI / 180;
  const mod = (a, m) => ((a % m) + m) % m;
  const HUES = [48, 160, 195, 230, 280, 330, 20, 100];
  const DEBOUNCE = 0.06; // seconds between triggers of the same ring by the same ball

  function segmentAt(ring, local) {
    const n = ring.sel.length;
    const w = (360 - ring.gap) / n;
    return Math.min(n - 1, Math.max(0, Math.floor((local - ring.gap) / w)));
  }

  class World {
    constructor() {
      this.rings = [];
      this.balls = [];
      this.gravity = 2.2;   // arena radii per second squared
      this.energy = 0.9;    // how high balls bounce: 1 = top of the arena
      this.size = 0.5;      // radius of the innermost ring, as a share of the stage
      this.ballR = 0.022;
      this.jitter = 3;      // random degrees added to each bounce, keeps things chaotic
      this.thickness = 0.024;
      this.spacing = 'gap'; // 'gap' spreads rings over the arena, 'none' packs them together
      this.time = 0;
      this.onHit = null;
      this.nextBallId = 1;
    }

    reach() { return this.thickness / 2 + this.ballR; }

    // Distance between the center lines of neighbouring rings when they are packed together.
    tightStep() { return this.thickness + 0.003; }

    wallR() { return this.rings.length ? this.rings[0].r : 1; }

    // Place rings from the inside out. The innermost ring has radius `size` and every
    // extra ring is added outside it, so more rings make the set larger. Ring 0 is the
    // closed outer wall. With spacing 'gap' each ring adds one more `size`, keeping them
    // evenly spaced all the way to the center. With spacing 'none' they sit right against
    // each other. If the wall would leave the stage, the set is pulled back to fit.
    layoutRings() {
      const n = this.rings.length;
      const tight = this.spacing === 'none';
      const step = tight ? this.tightStep() : this.size;
      let inner = this.size;
      let wall = inner + (n - 1) * step;
      let scale = 1;
      if (wall > 1) {
        if (tight) { inner -= wall - 1; wall = 1; } // slide the whole stack inward
        else { scale = 1 / wall; wall = 1; }         // shrink evenly instead
      }
      this.rings.forEach((r, i) => {
        r.r = (inner + (n - 1 - i) * step) * scale;
        if (i === 0) r.gap = 0;
      });
      this.balls.forEach((b) => this.resolve(b));
    }

    // Balls never lose energy. Speed is fixed by height: 0.5v² = g·(y − apex).
    speedAt(y) {
      const apex = this.wallR() * (1 - 2 * this.energy);
      return Math.sqrt(Math.max(0.15, 2 * this.gravity * (y - apex)));
    }

    addBall(x, y, vx = 0, vy = 0) {
      const id = this.nextBallId++;
      const b = { id, x, y, vx, vy, prevD: 0, lastHit: {}, trail: [], flash: 0, hue: HUES[(id - 1) % HUES.length] };
      this.resolve(b);
      this.balls.push(b);
      return b;
    }

    // Move a ball out of any ring it overlaps and keep it inside the wall.
    resolve(b) {
      const reach = this.reach();
      let d = Math.hypot(b.x, b.y);
      if (d < 1e-4) { b.x = 1e-3; d = 1e-3; }
      const setD = (t) => { b.x *= t / d; b.y *= t / d; d = t; };
      const wall = this.wallR();
      if (d > wall - reach - 1e-3) setD(wall - reach - 1e-3);
      for (const ring of this.rings) {
        if (Math.abs(d - ring.r) < reach) setD(d < ring.r ? ring.r - reach - 1e-3 : ring.r + reach + 1e-3);
      }
      b.prevD = d;
    }

    step(dt) {
      this.time += dt;
      for (const ring of this.rings) ring.angle = mod(ring.angle + ring.speed * dt, 360);
      const g = this.gravity;
      for (const b of this.balls) {
        b.prevD = Math.hypot(b.x, b.y);
        b.vy += g * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        this.collide(b);
      }
    }

    collide(b) {
      const reach = this.reach();
      let d = Math.hypot(b.x, b.y);
      for (let i = 0; i < this.rings.length; i++) {
        const ring = this.rings[i];
        const r = ring.r;
        if (Math.abs(d - r) >= reach || d < 1e-6) continue;
        const local = mod(Math.atan2(b.y, b.x) / DEG - ring.angle, 360);

        if (local >= ring.gap) {
          // Ball touches the solid arc. Which side did it come from? When the next ring
          // out is so close that no ball fits between them, the ball is always inside.
          const trapped = i > 0 && this.rings[i - 1].r - r < 2 * reach;
          const inside = i === 0 || trapped || b.prevD < r;
          const nx = b.x / d, ny = b.y / d;
          const s = inside ? -1 : 1; // normal points from the ring toward the ball
          const target = inside ? r - reach - 1e-4 : r + reach + 1e-4;
          b.x = nx * target; b.y = ny * target; d = target;
          const vn = b.vx * nx * s + b.vy * ny * s;
          if (vn < 0) {
            this.bounce(b, nx * s, ny * s, vn);
            this.hit(ring, segmentAt(ring, local), b, nx * r, ny * r, -vn);
          }
        } else if (ring.gap > 0) {
          // Ball is in the gap. It can still clip the rounded ends of the arc.
          for (const capLocal of [ring.gap, 0]) {
            const a = (capLocal + ring.angle) * DEG;
            const cx = Math.cos(a) * r, cy = Math.sin(a) * r;
            const dx = b.x - cx, dy = b.y - cy;
            const dist = Math.hypot(dx, dy);
            if (dist >= reach || dist < 1e-6) continue;
            const nx = dx / dist, ny = dy / dist;
            b.x = cx + nx * reach; b.y = cy + ny * reach;
            d = Math.hypot(b.x, b.y);
            const vn = b.vx * nx + b.vy * ny;
            if (vn < 0) {
              this.bounce(b, nx, ny, vn);
              this.hit(ring, capLocal === 0 ? ring.sel.length - 1 : 0, b, cx, cy, -vn);
            }
          }
        }
      }
    }

    bounce(b, nx, ny, vn) {
      b.vx -= 2 * vn * nx;
      b.vy -= 2 * vn * ny;
      if (this.jitter > 0) {
        const a = (Math.random() * 2 - 1) * this.jitter * DEG;
        const c = Math.cos(a), s = Math.sin(a);
        const vx = b.vx * c - b.vy * s, vy = b.vx * s + b.vy * c;
        // Only keep the nudge if the ball still leaves the surface.
        if (vx * nx + vy * ny > 0.1 * Math.hypot(vx, vy)) { b.vx = vx; b.vy = vy; }
      }
      const cur = Math.hypot(b.vx, b.vy) || 1;
      const want = this.speedAt(b.y);
      b.vx *= want / cur;
      b.vy *= want / cur;
    }

    hit(ring, seg, b, x, y, impact) {
      const last = b.lastHit[ring.id];
      if (last !== undefined && this.time - last < DEBOUNCE) return;
      b.lastHit[ring.id] = this.time;
      if (this.onHit) this.onHit(ring, seg, b, x, y, impact);
    }
  }

  MB.World = World;
  MB.segmentAt = segmentAt;
})(window.MB);
