// ─────────────────────────────────────────────────────────────
//  Akt III — Klang des Spiegeluniversums
//  Licht = hohes D-Dur (Terz-Quinte), Schatten = tiefes d-Moll; im Gleichgewicht verschmelzen beide.
//  Der Einklang bringt einen schwebenden Oberton. Nutzt die Audiobusse des Soundtracks.
// ─────────────────────────────────────────────────────────────
const D = 146.83;                                            // D3
const LICHT = [D * 2, D * 2 * 5 / 4, D * 2 * 3 / 2];         // D4, Fis4, A4 (rein)
const SCHATTEN = [D / 2, D / 2 * 6 / 5, D / 2 * 3 / 2];      // D2, F2, A2
const SCALE = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2];            // Dur-Pentatonik für die Glocken

export class SpiegelKlang {
  constructor(music) { this.m = music; this.running = false; this.prev = 8; this.nodes = []; }
  get ok() { return !!(this.m && this.m.ctx); }
  start() {
    if (this.running || !this.ok) return false;
    const m = this.m, c = m.ctx; this.running = true; this.prev = m.level || 8; m.setLevel(0);
    this.bus = c.createGain(); this.bus.gain.value = 0.0001; this.bus.connect(m.music);
    const send = c.createGain(); send.gain.value = 0.6; this.bus.connect(send).connect(m.reverb);
    this.bus.gain.setTargetAtTime(1, c.currentTime, 1.6);
    const pad = (freqs, type) => { const g = c.createGain(); g.gain.value = 0; g.connect(this.bus);
      for (const f of freqs) { const o = c.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 8; o.connect(g); o.start(); this.nodes.push(o); } return g; };
    this.gL = pad(LICHT, 'sine'); this.gS = pad(SCHATTEN, 'triangle');
    this.gE = pad([D * 4, D * 4 * 3 / 2], 'sine');                      // Einklang: D5, A5 schwebend
    const dr = c.createOscillator(); dr.type = 'sine'; dr.frequency.value = D; const dg = c.createGain(); dg.gain.value = 0.05; dr.connect(dg).connect(this.bus); dr.start(); this.nodes.push(dr);
    if (this.state) this.setState(this.state.share, this.state.e);
    return true;
  }
  stop() {
    if (!this.running) return; this.running = false;
    const c = this.m.ctx, bus = this.bus, nodes = this.nodes; this.nodes = [];
    bus.gain.setTargetAtTime(0.0001, c.currentTime, 0.4);
    setTimeout(() => { nodes.forEach((o) => { try { o.stop(); } catch { /* */ } }); try { bus.disconnect(); } catch { /* */ } }, 2200);
    this.m.setLevel(this.prev);
  }
  // share = Licht-Anteil 0–1, e = Einklang 0–100
  setState(share, e) {
    this.state = { share, e };
    if (!this.running) return;
    const c = this.m.ctx, now = c.currentTime;
    this.gL.gain.setTargetAtTime(0.02 + 0.07 * share, now, 1.2);
    this.gS.gain.setTargetAtTime(0.02 + 0.07 * (1 - share), now, 1.2);
    this.gE.gain.setTargetAtTime(0.045 * (e / 100), now, 1.5);
  }
  _bell(f, vol = 0.16, dur = 2, delay = 0, type = 'sine') {
    if (!this.ok) return; const c = this.m.ctx, t = c.currentTime + delay;
    [[1, 1], [2, 0.3]].forEach(([mult, v]) => {
      const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f * mult;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur / mult);
      o.connect(g); g.connect(this.m.sfx); g.connect(this.m.reverb); o.start(t); o.stop(t + dur / mult + 0.1);
    });
  }
  buy(side, k) { side === 'licht' ? this._bell(D * 2 * SCALE[k % 6] * (k >= 6 ? 2 : 1), 0.18, 1.6) : this._bell(D / 2 * SCALE[k % 6], 0.26, 2.6, 0, 'triangle'); }
  tap() { this._bell(D * 4 * SCALE[Math.floor(Math.random() * 6)], 0.05, 0.5); }
  leap() { for (let i = 0; i < 6; i++) { this._bell(D * 2 * SCALE[i], 0.13, 2.4, i * 0.1); this._bell(D / 2 * SCALE[i], 0.16, 2.8, i * 0.1 + 0.05, 'triangle'); } }
  letter() { this._bell(D * 4, 0.12, 3); this._bell(D * 6, 0.07, 3.4, 0.2); }
  harmony() { [0, 2, 3, 5].forEach((i, n) => this._bell(D * 4 * SCALE[i], 0.09, 2.4, n * 0.12)); }
  power(side) { side === 'licht' ? [3, 4, 5].forEach((i, n) => this._bell(D * 4 * SCALE[i], 0.12, 1.8, n * 0.08)) : this._bell(D / 2, 0.3, 3.4, 0, 'triangle'); }
  finale() { [0, 2, 3, 5].forEach((i, n) => this._bell(D * SCALE[i], 0.2, 8, n * 0.5)); [0, 2, 3].forEach((i, n) => this._bell(D * 4 * SCALE[i], 0.1, 7, 2.5 + n * 0.5, 'triangle')); }
}
