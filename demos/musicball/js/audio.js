// Web Audio synth: hit voices, drums, and the background pulse sequencer.
// Signal flow: voices -> input -> filter -> (dry + echo + reverb) -> master -> compressor.
window.MB = window.MB || {};
(function (MB) {
  'use strict';
  const M = MB.music;

  class AudioEngine {
    constructor() {
      this.ctx = null;
      this.voices = 0;
      this.maxVoices = 90;
      this.want = { master: 0.8, pulse: 0.55, filter: 2400, echo: [0.12, 0.2, 0.18] };
    }

    get ready() { return !!this.ctx; }
    now() { return this.ctx ? this.ctx.currentTime : 0; }

    start() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = (this.ctx = new AC({ latencyHint: 'interactive' }));
      const gain = (v) => { const n = ctx.createGain(); n.gain.value = v; return n; };

      this.master = gain(this.want.master);
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4;
      comp.attack.value = 0.004; comp.release.value = 0.25;
      this.master.connect(comp); comp.connect(ctx.destination);

      this.filter = ctx.createBiquadFilter();
      this.filter.type = 'lowpass'; this.filter.Q.value = 0.6;
      this.filter.frequency.value = this.want.filter;
      this.input = gain(1); this.input.connect(this.filter);
      const dry = gain(1); this.filter.connect(dry); dry.connect(this.master);

      this.delay = ctx.createDelay(2);
      this.feedback = gain(0); this.delayWet = gain(0);
      const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 2800;
      this.filter.connect(this.delay); this.delay.connect(tone);
      tone.connect(this.feedback); this.feedback.connect(this.delay);
      tone.connect(this.delayWet); this.delayWet.connect(this.master);

      const reverb = ctx.createConvolver(); reverb.buffer = this.impulse(2.6, 2.8);
      const revWet = gain(0.22);
      this.filter.connect(reverb); reverb.connect(revWet); revWet.connect(this.master);

      this.hitBus = gain(1); this.hitBus.connect(this.input);
      this.pulseBus = gain(this.want.pulse); this.pulseBus.connect(this.input);

      const len = ctx.sampleRate;
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

      this.setEcho(...this.want.echo);
    }

    impulse(dur, decay) {
      const rate = this.ctx.sampleRate, len = Math.floor(rate * dur);
      const buf = this.ctx.createBuffer(2, len, rate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
      return buf;
    }

    // ---- settings -------------------------------------------------------
    glide(param, v, tc = 0.08) { param.setTargetAtTime(v, this.ctx.currentTime, tc); }
    setMaster(v) { this.want.master = v; if (this.ctx) this.glide(this.master.gain, v); }
    setPulseVolume(v) { this.want.pulse = v; if (this.ctx) this.glide(this.pulseBus.gain, v); }
    setFilter(freq) { this.want.filter = freq; if (this.ctx) this.glide(this.filter.frequency, freq, 0.25); }
    setEcho(time, fb, wet) {
      this.want.echo = [time, fb, wet];
      if (!this.ctx) return;
      this.glide(this.delay.delayTime, Math.min(1.9, Math.max(0.01, time)), 0.05);
      this.glide(this.feedback.gain, fb);
      this.glide(this.delayWet.gain, wet);
    }

    // ---- building blocks -----------------------------------------------
    // A voice is an output gain node that is disconnected when it is done.
    voice(t, dur, bus) {
      const out = this.ctx.createGain();
      out.connect(bus);
      this.voices++;
      const ms = (t - this.ctx.currentTime + dur + 0.3) * 1000;
      setTimeout(() => { this.voices--; out.disconnect(); }, ms);
      return out;
    }

    env(param, t, a, peak, d) {
      param.setValueAtTime(0, t);
      param.linearRampToValueAtTime(Math.max(peak, 0.0002), t + a);
      param.exponentialRampToValueAtTime(0.0001, t + a + d);
    }

    partial(out, type, freq, t, a, peak, d, detune = 0) {
      const o = this.ctx.createOscillator();
      o.type = type; o.frequency.value = freq; o.detune.value = detune;
      const g = this.ctx.createGain();
      this.env(g.gain, t, a, peak, d);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + a + d + 0.05);
      return o;
    }

    noise(out, t, dur) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      src.connect(out);
      src.start(t, Math.random() * 0.5);
      src.stop(t + dur);
    }

    biquad(type, freq, q, out) {
      const f = this.ctx.createBiquadFilter();
      f.type = type; f.frequency.value = freq; f.Q.value = q;
      f.connect(out);
      return f;
    }

    // ---- instruments ---------------------------------------------------
    playNote(midi, inst, vel, t, bus) {
      if (!this.ctx) return;
      bus = bus || this.hitBus;
      // Ball hits are capped so many balls cannot overload the CPU. The beat is never dropped.
      if (bus === this.hitBus && this.voices > this.maxVoices) return;
      t = Math.max(t, this.ctx.currentTime);
      const f = M.midiToFreq(midi);
      const v = vel;
      switch (inst) {
        case 'glass': {
          const out = this.voice(t, 2.4, bus);
          this.partial(out, 'sine', f, t, 0.004, 0.22 * v, 2.2);
          this.partial(out, 'sine', f * 2.76, t, 0.002, 0.07 * v, 0.7);
          this.partial(out, 'sine', f * 5.4, t, 0.002, 0.035 * v, 0.3);
          break;
        }
        case 'pluck': {
          const out = this.voice(t, 1, bus);
          const lp = this.biquad('lowpass', Math.min(f * 10, 12000), 3, out);
          lp.frequency.setValueAtTime(Math.min(f * 10, 12000), t);
          lp.frequency.exponentialRampToValueAtTime(Math.max(f * 1.2, 200), t + 0.3);
          this.partial(lp, 'sawtooth', f, t, 0.002, 0.22 * v, 0.9);
          break;
        }
        case 'chip': {
          const out = this.voice(t, 0.4, bus);
          this.partial(out, 'square', f, t, 0.003, 0.08 * v, 0.28);
          this.partial(out, 'square', f * 2, t, 0.003, 0.025 * v, 0.12);
          break;
        }
        case 'pad': {
          const out = this.voice(t, 2.8, bus);
          const lp = this.biquad('lowpass', 1600, 0.5, out);
          this.partial(lp, 'sawtooth', f, t, 0.25, 0.07 * v, 2.4, -9);
          this.partial(lp, 'sawtooth', f, t, 0.25, 0.07 * v, 2.4, 9);
          this.partial(lp, 'triangle', f / 2, t, 0.25, 0.05 * v, 2.4);
          break;
        }
        default: { // soft
          const out = this.voice(t, 1.6, bus);
          this.partial(out, 'sine', f, t, 0.006, 0.3 * v, 1.5);
          this.partial(out, 'triangle', f * 2, t, 0.006, 0.05 * v, 0.6);
        }
      }
    }

    strum(midis, inst, vel, t) {
      midis.forEach((m, i) => this.playNote(m, inst, vel * 0.75, t + i * 0.028));
    }

    drum(id, vel, t, bus) {
      if (!this.ctx) return;
      bus = bus || this.hitBus;
      // Ball hits are capped so many balls cannot overload the CPU. The beat is never dropped.
      if (bus === this.hitBus && this.voices > this.maxVoices) return;
      t = Math.max(t, this.ctx.currentTime);
      const v = vel;
      const sweep = (out, f0, f1, time, peak, d) => {
        const o = this.partial(out, 'sine', f0, t, 0.002, peak, d);
        o.frequency.setValueAtTime(f0, t);
        o.frequency.exponentialRampToValueAtTime(f1, t + time);
      };
      switch (id) {
        case 'kick': { const out = this.voice(t, 0.5, bus); sweep(out, 150, 45, 0.13, 0.9 * v, 0.42); break; }
        case 'tomLow': { const out = this.voice(t, 0.4, bus); sweep(out, 150, 85, 0.25, 0.6 * v, 0.35); break; }
        case 'tomHigh': { const out = this.voice(t, 0.3, bus); sweep(out, 260, 160, 0.2, 0.5 * v, 0.25); break; }
        case 'snare': {
          const out = this.voice(t, 0.25, bus);
          const g = this.ctx.createGain(); this.env(g.gain, t, 0.002, 0.45 * v, 0.16); g.connect(out);
          this.noise(this.biquad('bandpass', 1900, 0.7, g), t, 0.2);
          this.partial(out, 'triangle', 185, t, 0.002, 0.25 * v, 0.09);
          break;
        }
        case 'hat': {
          const out = this.voice(t, 0.08, bus);
          const g = this.ctx.createGain(); this.env(g.gain, t, 0.001, 0.18 * v, 0.045); g.connect(out);
          this.noise(this.biquad('highpass', 7000, 0.7, g), t, 0.06);
          break;
        }
        case 'clap': {
          const out = this.voice(t, 0.3, bus);
          const g = this.ctx.createGain(); g.connect(out);
          const p = g.gain;
          p.setValueAtTime(0, t);
          for (let i = 0; i < 3; i++) {
            p.linearRampToValueAtTime(0.5 * v, t + i * 0.011 + 0.001);
            p.linearRampToValueAtTime(0.08 * v, t + i * 0.011 + 0.01);
          }
          p.linearRampToValueAtTime(0.45 * v, t + 0.036);
          p.exponentialRampToValueAtTime(0.0001, t + 0.22);
          this.noise(this.biquad('bandpass', 1200, 1.4, g), t, 0.25);
          break;
        }
        case 'rim': {
          const out = this.voice(t, 0.08, bus);
          this.partial(out, 'square', 820, t, 0.001, 0.1 * v, 0.035);
          const g = this.ctx.createGain(); this.env(g.gain, t, 0.001, 0.12 * v, 0.02); g.connect(out);
          this.noise(this.biquad('highpass', 3000, 0.7, g), t, 0.04);
          break;
        }
      }
    }

    bass(midi, t, dur, vel) {
      if (!this.ctx) return;
      const f = M.midiToFreq(midi);
      const out = this.voice(t, dur, this.pulseBus);
      const lp = this.biquad('lowpass', 520, 0.8, out);
      this.partial(lp, 'sine', f, t, 0.008, 0.32 * vel, dur);
      this.partial(lp, 'triangle', f, t, 0.008, 0.12 * vel, dur * 0.7);
    }

    pad(midis, t, dur) {
      if (!this.ctx) return;
      const out = this.voice(t, dur, this.pulseBus);
      const lp = this.biquad('lowpass', 1200, 0.5, out);
      for (const m of midis) {
        const f = M.midiToFreq(m);
        this.partial(lp, 'triangle', f, t, 0.45, 0.035, dur, -6);
        this.partial(lp, 'sine', f, t, 0.45, 0.03, dur, 6);
      }
    }
  }

  // Background pulse: a 16-step sequencer scheduled ahead of time on the audio clock.
  class Pulse {
    constructor(audio, app) {
      this.audio = audio;
      this.app = app;
      this.running = false;
      this.step = 0;
      this.nextTime = 0;
      this.beats = [];
    }

    stepDur() { return 60 / M.TEMPOS[this.app.music.tempo] / 4; }

    start() {
      if (this.running || !this.audio.ready) return;
      this.running = true;
      this.step = 0;
      this.nextTime = this.audio.now() + 0.06;
      this.timer = setInterval(() => this.tick(), 25);
      this.tick();
    }

    stop() {
      this.running = false;
      clearInterval(this.timer);
      this.beats = [];
    }

    tick() {
      const ahead = this.audio.now() + 0.12;
      while (this.nextTime < ahead) {
        this.schedule(this.step, this.nextTime);
        this.nextTime += this.stepDur();
        this.step = (this.step + 1) % 16;
      }
    }

    schedule(step, t) {
      if (!this.app.settings.pulseOn) return;
      const m = this.app.music, a = this.audio;
      const p = M.PATTERNS[m.pattern];
      if (p.k.includes(step)) a.drum('kick', 0.85, t, a.pulseBus);
      if (p.s.includes(step)) a.drum('snare', 0.55, t, a.pulseBus);
      if (p.h.includes(step)) a.drum('hat', step % 4 === 0 ? 0.6 : 0.4, t, a.pulseBus);
      if (p.b.includes(step)) {
        a.bass(M.chordMidis(m.chord, 2, m.key, m.scale)[0], t, this.stepDur() * 3, 0.9);
      }
      if (step === 0) a.pad(M.chordMidis(m.chord, 3, m.key, m.scale), t, this.stepDur() * 16);
      if (step % 4 === 0) this.beats.push({ t, strong: step === 0 });
    }

    // 0..1 glow level for visuals, peaking on each quarter-note beat.
    beatLevel(now) {
      while (this.beats.length > 1 && this.beats[1].t <= now) this.beats.shift();
      const b = this.beats[0];
      if (!b || b.t > now) return 0;
      return Math.exp(-(now - b.t) * 7) * (b.strong ? 1 : 0.6);
    }

    // The next sixteenth-note grid time at or after `now`, for "snap to beat".
    nextGrid(now) {
      const sd = this.stepDur();
      let t = this.nextTime;
      while (t - sd >= now) t -= sd;
      return t;
    }
  }

  MB.AudioEngine = AudioEngine;
  MB.Pulse = Pulse;
})(window.MB);
