// All sound is synthesized with WebAudio — no audio files, no network.
// Each effect is one short function so the kitchen answers every action at once.
export class Sfx {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.sizzleNodes = null;
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) this.stopSizzle();
    return this.muted;
  }

  tone(freq, seconds, type, gainValue, slideTo) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + seconds);
    gain.gain.setValueAtTime(gainValue, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.02);
  }

  noise(seconds, filterFreq, gainValue) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * seconds));
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainValue, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start(t0);
  }

  pickup() { this.tone(520, 0.07, 'triangle', 0.12, 760); }
  place() { this.tone(300, 0.06, 'triangle', 0.1, 220); }
  chop() { this.noise(0.09, 900, 0.25); this.tone(140, 0.06, 'square', 0.08, 90); }
  chopDone() { this.tone(660, 0.08, 'triangle', 0.14, 880); this.tone(990, 0.1, 'triangle', 0.1, 990); }
  cookDone() { this.tone(740, 0.09, 'sine', 0.14); this.tone(1108, 0.12, 'sine', 0.12); }
  serve() {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => this.tone(f, 0.16, 'triangle', 0.14), i * 70);
    });
  }
  wrong() { this.tone(220, 0.18, 'sawtooth', 0.1, 160); }
  alarm() { this.tone(880, 0.12, 'square', 0.07, 880); this.tone(660, 0.12, 'square', 0.07, 660); }
  burn() { this.noise(0.25, 400, 0.2); this.tone(180, 0.2, 'sawtooth', 0.08, 120); }
  tick() { this.tone(1200, 0.04, 'sine', 0.06); }
  startSizzle() {
    if (!this.ctx || this.muted || this.sizzleNodes) return;
    const len = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2500;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.035;
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start();
    this.sizzleNodes = { src, gain };
  }
  stopSizzle() {
    if (!this.sizzleNodes) return;
    try { this.sizzleNodes.src.stop(); } catch { /* already stopped */ }
    this.sizzleNodes = null;
  }
}
