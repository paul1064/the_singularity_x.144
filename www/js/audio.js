// ─────────────────────────────────────────────────────────────
//  Der wachsende Soundtrack — 8 Schichten, eine pro Epoche.
//  Prozedural (Web Audio). Eigene Stems: www/audio/layer1.mp3 … layer8.mp3
//  (gleiches Tempo & gleiche Länge) ersetzen die jeweilige Synth-Schicht.
// ─────────────────────────────────────────────────────────────

const BPM = 84;
const STEP = 60 / BPM / 4;           // Sechzehntel
// D-Dorisch, MIDI-Noten
const CHORDS = [
  [50, 53, 57],  // Dm
  [48, 52, 55],  // C
  [55, 59, 62],  // G
  [57, 60, 64],  // Am
];
const MELODY = [ // Stufen relativ zu D5 (74), -1 = Pause, je Achtel (2 Takte = 16)
  0, -1, 3, 2, 0, -1, -2, -1,   5, -1, 3, -1, 2, 0, -1, -1,
  7, -1, 5, 3, 2, -1, 0, -1,    -2, -1, 0, 2, 3, -1, -1, -1,
];
const DORIAN = [0, 2, 3, 5, 7, 9, 10];
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const deg = (d) => { // Stufe → MIDI ab D5
  const o = Math.floor(d / 7), i = ((d % 7) + 7) % 7;
  return 74 + o * 12 + DORIAN[i];
};

export class Soundtrack {
  constructor() {
    this.ctx = null;
    this.level = 0;           // wie viele Schichten aktiv (0–8)
    this.musicOn = true;
    this.sfxOn = true;
    this.stems = [];
    this.step = 0;
    this.nextTime = 0;
  }

  // V6.2: f = 0 (klar) … 1 (Entropie am Anschlag, dumpf)
  setEntropy(f) { if (this.lp) this.lp.frequency.setTargetAtTime(20000 * Math.pow(1 - 0.94 * Math.min(1, Math.max(0, f)), 3) + 600, this.ctx.currentTime, 0.8); }

  // Muss aus einer Nutzergeste heraus aufgerufen werden
  start() {
    if (this.ctx) { this.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = this.ctx = new AC();
    this.master = ctx.createGain(); this.master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 3;
    this.master.connect(comp).connect(ctx.destination);

    this.music = ctx.createGain(); this.music.gain.value = this.musicOn ? 1 : 0;
    this.sfx = ctx.createGain(); this.sfx.gain.value = this.sfxOn ? 0.7 : 0;
    this.lp = ctx.createBiquadFilter(); this.lp.type = 'lowpass'; this.lp.frequency.value = 20000; this.lp.Q.value = 0.5;   // V6.2: Entropie dämpft die Musik
    this.music.connect(this.lp).connect(this.master); this.sfx.connect(this.master);

    // Hall (generierte Impulsantwort) & Echo
    this.reverb = ctx.createConvolver();
    this.reverb.buffer = this._impulse(3.2);
    const rv = ctx.createGain(); rv.gain.value = 0.55;
    this.reverb.connect(rv).connect(this.master);
    this.delay = ctx.createDelay(1); this.delay.delayTime.value = STEP * 3;
    const fb = ctx.createGain(); fb.gain.value = 0.38;
    const dl = ctx.createGain(); dl.gain.value = 0.4;
    this.delay.connect(fb).connect(this.delay);
    this.delay.connect(dl).connect(this.music);

    this.layers = [];
    for (let i = 0; i < 8; i++) {
      const g = ctx.createGain(); g.gain.value = 0;
      g.connect(this.music);
      const send = ctx.createGain(); send.gain.value = [0.5, 0.15, 0.45, 0.1, 0.12, 0.6, 0.4, 0.8][i];
      g.connect(send).connect(this.reverb);
      this.layers.push(g);
    }
    this.noise = this._noiseBuffer();
    this._startDrone();
    this.t0 = ctx.currentTime + 0.1;
    this.nextTime = this.t0;
    this._loadStems();
    this.setLevel(this.level, true);
    this.timer = setInterval(() => this._schedule(), 50);
  }

  resume() { if (this.ctx && this.ctx.state !== 'running') this.ctx.resume(); }
  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); }

  setMusic(on) { this.musicOn = on; if (this.music) this.music.gain.setTargetAtTime(on ? 1 : 0, this.ctx.currentTime, 0.3); }
  setSfx(on) { this.sfxOn = on; if (this.sfx) this.sfx.gain.value = on ? 0.7 : 0; }

  // Anzahl aktiver Schichten, mit sanftem Einblenden
  setLevel(n, instant = false) {
    this.level = Math.max(0, Math.min(8, n));
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const vols = [0.55, 0.9, 0.5, 0.55, 0.35, 0.3, 0.32, 0.42];
    this.layers.forEach((g, i) => {
      const target = i < this.level ? vols[i] : 0;
      g.gain.cancelScheduledValues(now);
      g.gain.setTargetAtTime(target, now, instant ? 0.05 : 2.5);
    });
  }

  // ── Stems ──────────────────────────────────────────────────
  async _loadStems() {
    let list = [];
    try { list = (await (await fetch('audio/stems.json')).json()).layers || []; } catch { return; }
    for (let i = 0; i < 8; i++) {
      if (!list.includes(i + 1)) continue;
      try {
        const res = await fetch(`audio/layer${i + 1}.mp3`);
        if (!res.ok) continue;
        const buf = await this.ctx.decodeAudioData(await res.arrayBuffer());
        const src = this.ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        src.connect(this.layers[i]);
        const off = Math.max(0, this.ctx.currentTime - this.t0) % buf.duration;
        src.start(this.ctx.currentTime + 0.05, off);
        this.stems[i] = src;
        if (i === 0) this._stopDrone();
      } catch { /* keine Datei → Synth bleibt */ }
    }
  }

  // ── Takt-Planung ───────────────────────────────────────────
  _schedule() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    while (this.nextTime < this.ctx.currentTime + 0.15) {
      this._playStep(this.step, this.nextTime);
      this.nextTime += STEP;
      this.step++;
    }
  }

  _playStep(step, t) {
    const L = this.level, has = (i) => L > i && !this.stems[i];
    const inBar = step % 16, bar = Math.floor(step / 16);
    const chord = CHORDS[bar % 4];
    // 2 Herzschlag: lub-dub auf 1 und 3
    if (has(1) && (inBar === 0 || inBar === 8)) { this._kick(t, 1); this._kick(t + STEP * 1.2, 0.6); }
    // 3 Arpeggio in Achteln
    if (has(2) && inBar % 2 === 0) {
      const n = chord[(inBar / 2) % 3] + 12 + ((inBar / 2) % 4 === 3 ? 12 : 0);
      this._pluck(t, mtof(n), 2);
    }
    // 4 Bass
    if (has(3) && (inBar === 0 || inBar === 6 || inBar === 10)) this._bass(t, mtof(chord[0] - 12), inBar === 0 ? STEP * 5 : STEP * 3);
    // 5 Percussion
    if (has(4)) {
      if (inBar % 4 === 2) this._hat(t, 0.25);
      if (inBar % 2 === 1 && Math.random() < 0.35) this._hat(t, 0.1);
      if (inBar === 4 || inBar === 12) this._snare(t);
    }
    // 6 Pad (pro Takt)
    if (has(5) && inBar === 0) this._pad(t, chord.map((n) => mtof(n)), STEP * 16, 5, 'sawtooth', 900);
    // 7 Lead-Melodie (Achtel, 4-Takt-Phrase)
    if (has(6) && inBar % 2 === 0) {
      const d = MELODY[((bar % 4) * 8 + inBar / 2) % MELODY.length];
      if (d >= 0 && bar % 8 < 6) this._lead(t, mtof(deg(d)));
    }
    // 8 Chor (alle 2 Takte)
    if (has(7) && inBar === 0 && bar % 2 === 0) this._choir(t, chord.map((n) => mtof(n + 12)), STEP * 32);
  }

  // ── Instrumente ────────────────────────────────────────────
  _env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  _startDrone() {
    const c = this.ctx;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400; lp.Q.value = 4;
    const lfo = c.createOscillator(); lfo.frequency.value = 0.07;
    const lfoG = c.createGain(); lfoG.gain.value = 220;
    lfo.connect(lfoG).connect(lp.frequency); lfo.start();
    this.drone = [lfo];
    [[38, -6], [38, 6], [45, 0], [50, 3]].forEach(([m, det]) => {
      const o = c.createOscillator(); o.type = m === 50 ? 'triangle' : 'sawtooth';
      o.frequency.value = mtof(m); o.detune.value = det;
      const g = c.createGain(); g.gain.value = m === 50 ? 0.12 : 0.18;
      o.connect(g).connect(lp); o.start(); this.drone.push(o);
    });
    lp.connect(this.layers[0]);
  }
  _stopDrone() { (this.drone || []).forEach((o) => o.stop()); this.drone = []; }

  _kick(t, v) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.18);
    this._env(g, t, 0.005, 0.9 * v, 0.28);
    o.connect(g).connect(this.layers[1]); o.start(t); o.stop(t + 0.35);
  }
  _pluck(t, f, layer) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = 'triangle'; o.frequency.value = f;
    this._env(g, t, 0.004, 0.35, 0.35);
    o.connect(g); g.connect(this.layers[layer]); g.connect(this.delay);
    o.start(t); o.stop(t + 0.45);
  }
  _bass(t, f, dur) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = f;
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(700, t); lp.frequency.exponentialRampToValueAtTime(160, t + dur);
    this._env(g, t, 0.01, 0.6, dur);
    o.connect(lp).connect(g).connect(this.layers[3]); o.start(t); o.stop(t + dur + 0.1);
  }
  _hat(t, v) {
    const c = this.ctx, s = c.createBufferSource(), g = c.createGain(), hp = c.createBiquadFilter();
    s.buffer = this.noise; hp.type = 'highpass'; hp.frequency.value = 7000;
    this._env(g, t, 0.002, v, 0.05);
    s.connect(hp).connect(g).connect(this.layers[4]); s.start(t); s.stop(t + 0.1);
  }
  _snare(t) {
    const c = this.ctx, s = c.createBufferSource(), g = c.createGain(), bp = c.createBiquadFilter();
    s.buffer = this.noise; bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.8;
    this._env(g, t, 0.003, 0.45, 0.18);
    s.connect(bp).connect(g).connect(this.layers[4]); s.start(t); s.stop(t + 0.25);
  }
  _pad(t, freqs, dur, layer, type, cut) {
    const c = this.ctx, lp = c.createBiquadFilter(), g = c.createGain();
    lp.type = 'lowpass'; lp.frequency.value = cut;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.16, t + dur * 0.35);
    g.gain.linearRampToValueAtTime(0.0001, t + dur * 1.05);
    freqs.forEach((f, i) => [-7, 7].forEach((det) => {
      const o = c.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det + i;
      o.connect(lp); o.start(t); o.stop(t + dur * 1.1);
    }));
    lp.connect(g).connect(this.layers[layer]);
  }
  _lead(t, f) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
    const vib = c.createOscillator(), vg = c.createGain();
    o.type = 'square'; o.frequency.value = f;
    vib.frequency.value = 5.5; vg.gain.value = 4; vib.connect(vg).connect(o.detune);
    lp.type = 'lowpass'; lp.frequency.value = 2200;
    this._env(g, t, 0.02, 0.18, STEP * 3);
    o.connect(lp).connect(g); g.connect(this.layers[6]); g.connect(this.delay);
    o.start(t); vib.start(t); o.stop(t + STEP * 4); vib.stop(t + STEP * 4);
  }
  _choir(t, freqs, dur) {
    const c = this.ctx, g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.12, t + dur * 0.4);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    [800, 1150].forEach((fq) => {
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fq; bp.Q.value = 3;
      freqs.forEach((f) => {
        const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f;
        const v = c.createOscillator(), vg = c.createGain();
        v.frequency.value = 4.5 + Math.random(); vg.gain.value = 6; v.connect(vg).connect(o.detune);
        o.connect(bp); o.start(t); v.start(t); o.stop(t + dur); v.stop(t + dur);
      });
      bp.connect(g);
    });
    g.connect(this.layers[7]);
  }

  // ── Soundeffekte ───────────────────────────────────────────
  _blip(f, dur, type = 'sine', vol = 0.3, dest = this.sfx) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f;
    this._env(g, t, 0.005, vol, dur);
    o.connect(g); g.connect(dest); g.connect(this.reverb);
    o.start(t); o.stop(t + dur + 0.05);
  }
  tap() {
    const n = CHORDS[Math.floor(this.step / 16) % 4];
    this._blip(mtof(n[Math.floor(Math.random() * 3)] + 24), 0.18, 'sine', 0.12);
  }
  buy() { this._blip(mtof(74), 0.15, 'triangle', 0.2); setTimeout(() => this._blip(mtof(81), 0.3, 'triangle', 0.2), 70); }
  fragment() { [86, 90, 93, 98].forEach((m, i) => setTimeout(() => this._blip(mtof(m), 0.6, 'sine', 0.15), i * 90)); }
  boom(big = false) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime;
    const o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(big ? 120 : 80, t); o.frequency.exponentialRampToValueAtTime(25, t + (big ? 3 : 1.5));
    this._env(g, t, 0.01, big ? 1 : 0.7, big ? 4 : 2);
    o.connect(g).connect(this.sfx); o.start(t); o.stop(t + 5);
    const s = c.createBufferSource(), ng = c.createGain(), lp = c.createBiquadFilter();
    s.buffer = this.noise; s.loop = true; lp.type = 'lowpass';
    lp.frequency.setValueAtTime(big ? 6000 : 2500, t); lp.frequency.exponentialRampToValueAtTime(80, t + (big ? 5 : 2));
    this._env(ng, t, 0.01, big ? 0.8 : 0.4, big ? 5 : 2);
    s.connect(lp).connect(ng); ng.connect(this.sfx); ng.connect(this.reverb);
    s.start(t); s.stop(t + 6);
  }
  riser(dur = 3) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime, s = c.createBufferSource(), g = c.createGain(), bp = c.createBiquadFilter();
    s.buffer = this.noise; s.loop = true; bp.type = 'bandpass'; bp.Q.value = 6;
    bp.frequency.setValueAtTime(200, t); bp.frequency.exponentialRampToValueAtTime(5000, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + dur);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.2);
    s.connect(bp).connect(g); g.connect(this.sfx); g.connect(this.reverb);
    s.start(t); s.stop(t + dur + 0.3);
    return { stop: () => { try { g.gain.cancelScheduledValues(c.currentTime); g.gain.setTargetAtTime(0.0001, c.currentTime, 0.1); } catch {} } };
  }

  // ── Hilfen ─────────────────────────────────────────────────
  _noiseBuffer() {
    const b = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  _impulse(sec) {
    const c = this.ctx, len = c.sampleRate * sec, b = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    return b;
  }
}
