// ─────────────────────────────────────────────────────────────
//  Akt II — Klangwelt des Ordens
//  Pythagoreische Stimmung (nur Quinten, Verhältnisse 3:2): Jede Sephira hat ihren Ton.
//  Malkuth ist der Grundton, Kether die Duodezime, Daath die harmonische Septime 7:4 („das Ungehörte").
//  Der Klang wächst mit dem Baum: Je mehr Sephiroth, desto mehr Stimmen; die Melodie wandert über die Pfade.
//  Nutzt die Audiobusse des Soundtracks (Musik-/Effekte-Schalter gelten weiter).
// ─────────────────────────────────────────────────────────────
import { ALL_PATHS } from './akt2econ.js';
import { gi } from './akt2data.js';

// Index = Generator-Nr. (0 Malkuth … 9 Kether, 10 Daath)
export const RATIOS = [1, 9 / 8, 81 / 64, 4 / 3, 3 / 2, 27 / 16, 243 / 128, 2, 9 / 4, 3, 7 / 4];
export const BASE = 146.83;                         // D3
export const freq = (i, oct = 0) => BASE * RATIOS[i] * Math.pow(2, oct);

export class OrdenKlang {
  constructor(music) {
    this.m = music; this.running = false; this.prevLevel = 8;
    this.pads = []; this.timer = null; this.cur = 0; this.nextAt = 0; this.state = null;
  }
  get ok() { return !!(this.m && this.m.ctx); }

  start() {
    if (this.running || !this.ok) return false;
    const m = this.m, c = m.ctx;
    this.running = true; this.prevLevel = m.level || 8;
    m.setLevel(0);                                   // die Evolutions-Schichten schweigen
    this.bus = c.createGain(); this.bus.gain.value = 0.0001;
    this.bus.connect(m.music);
    const send = c.createGain(); send.gain.value = 0.55; this.bus.connect(send).connect(m.reverb);
    this.bus.gain.setTargetAtTime(1, c.currentTime, 1.6);
    // Grundton: Quinte und Oktave, langsam atmend
    this.drone = [];
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 1.2;
    const dg = c.createGain(); dg.gain.value = 0.11; lp.connect(dg).connect(this.bus);
    const lfo = c.createOscillator(); lfo.frequency.value = 0.06; const lg = c.createGain(); lg.gain.value = 0.04;
    lfo.connect(lg).connect(dg.gain); lfo.start(); this.drone.push(lfo);
    [[0.5, 'sine', 1], [0.75, 'triangle', 0.6], [1, 'sine', 0.5]].forEach(([mult, type, v]) => {
      const o = c.createOscillator(); o.type = type; o.frequency.value = BASE * mult;
      const g = c.createGain(); g.gain.value = v; o.connect(g).connect(lp); o.start(); this.drone.push(o);
    });
    // Eine Stimme je Sephira (leise, wächst mit dem Besitz)
    this.pads = [];
    for (let i = 0; i < 11; i++) {
      const g = c.createGain(); g.gain.value = 0; g.connect(this.bus);
      const o1 = c.createOscillator(); o1.type = 'sine'; o1.frequency.value = freq(i, 0);
      const o2 = c.createOscillator(); o2.type = 'triangle'; o2.frequency.value = freq(i, 0); o2.detune.value = 4;
      const g2 = c.createGain(); g2.gain.value = 0.25;
      o1.connect(g); o2.connect(g2).connect(g); o1.start(); o2.start();
      this.pads.push({ g, o: [o1, o2] });
    }
    // Daath: ein Ton, der erst hörbar wird, wenn der Orden transzendiert hat
    this.daath = c.createGain(); this.daath.gain.value = 0;
    const od = c.createOscillator(); od.type = 'sine'; od.frequency.value = freq(10, 1);
    od.connect(this.daath).connect(this.bus); od.start(); this.drone.push(od);
    this.nextAt = c.currentTime + 2.5;
    this.timer = setInterval(() => this._tick(), 250);
    if (this.state) this.setState(this.state);
    return true;
  }

  stop() {
    if (!this.running) return;
    this.running = false; clearInterval(this.timer);
    const c = this.m.ctx, bus = this.bus, nodes = [...this.drone, ...this.pads.flatMap((p) => p.o)];
    bus.gain.setTargetAtTime(0.0001, c.currentTime, 0.4);
    setTimeout(() => { nodes.forEach((o) => { try { o.stop(); } catch { /* schon gestoppt */ } }); try { bus.disconnect(); } catch { /* */ } }, 2200);
    this.pads = []; this.drone = [];
    this.m.setLevel(this.prevLevel);
  }

  // Zustand des Baums → Stimmen: owned[0..10], age, dim
  setState(a2) {
    this.state = { owned: [...a2.owned], age: a2.age, dim: a2.dim };
    if (!this.running) return;
    const c = this.m.ctx;
    this.pads.forEach((p, i) => {
      const n = a2.owned[i] || 0;
      p.g.gain.setTargetAtTime(n > 0 ? 0.012 + 0.012 * Math.min(4, Math.log10(n + 1) * 2.2) : 0, c.currentTime, 1.2);
    });
    this.daath.gain.setTargetAtTime(a2.dim >= 1 ? 0.03 + Math.min(0.04, a2.dim * 0.006) : 0, c.currentTime, 2);
  }

  // Melodie: wandert von Sephira zu Sephira über leuchtende Pfade
  _tick() {
    if (!this.running || this.m.ctx.state !== 'running' || !this.state) return;
    const c = this.m.ctx;
    if (c.currentTime < this.nextAt) return;
    const own = this.state.owned, have = [];
    for (let i = 0; i < 11; i++) if (own[i] > 0) have.push(i);
    const gap = Math.max(1.4, 4.8 - this.state.age * 0.45) * (0.7 + Math.random() * 0.8);
    this.nextAt = c.currentTime + gap;
    if (!have.length || Math.random() < 0.22) return;      // Pausen gehören dazu
    const nb = [];
    for (const p of ALL_PATHS) { const a = gi(p.a), b = gi(p.b); if (a === this.cur && own[b] > 0) nb.push(b); if (b === this.cur && own[a] > 0) nb.push(a); }
    const next = nb.length && Math.random() < 0.85 ? nb[Math.floor(Math.random() * nb.length)] : have[Math.floor(Math.random() * have.length)];
    const oct = Math.random() < 0.5 ? 1 : 2;
    this._bell(freq(next, oct), 0.1, 3.2, this.bus);
    if (nb.includes(next) && Math.random() < 0.3) this._bell(freq(this.cur, oct), 0.06, 2.6, this.bus, 0.35);   // der Pfad klingt als Intervall
    this.cur = next;
  }

  // Glocke: Grundton plus Oktave und Duodezime (alles konsonant)
  _bell(f, vol = 0.14, dur = 2, dest = this.m.sfx, delay = 0) {
    if (!this.ok) return;
    const c = this.m.ctx, t = c.currentTime + delay;
    [[1, 1], [2, 0.3], [3, 0.12]].forEach(([mult, v]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = f * mult;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur / mult);
      o.connect(g); g.connect(dest); g.connect(this.m.reverb);
      o.start(t); o.stop(t + dur / mult + 0.1);
    });
  }
  _tone(f, dur = 0.5, vol = 0.2, type = 'triangle', delay = 0) {
    if (!this.ok) return;
    const c = this.m.ctx, t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.m.sfx); g.connect(this.m.reverb); o.start(t); o.stop(t + dur + 0.05);
  }

  // ── Effekte ─────────────────────────────────────────────────
  buy(i) { this._bell(freq(i, 1), 0.2, 1.5); }
  tap() {
    const own = this.state ? this.state.owned : [];
    const have = []; for (let i = 0; i < 11; i++) if (own[i] > 0) have.push(i);
    const i = have.length ? have[Math.floor(Math.random() * have.length)] : 0;
    this._bell(freq(i, 2), 0.06, 0.55);
  }
  path(i, j) { this._bell(freq(i, 1), 0.2, 2.4); this._bell(freq(j, 1), 0.2, 2.4, this.m.sfx, 0.14); this._bell(freq(i, 2), 0.1, 3, this.m.sfx, 0.28); }
  ritualNote(i) { this._tone(freq(i, 1), 0.55, 0.22, 'triangle'); this._tone(freq(i, 2), 0.35, 0.07, 'sine'); }
  ritualWin() { [0, 4, 7, 9].forEach((n, k) => this._bell(freq(n, 1), 0.18, 2.4, this.m.sfx, k * 0.12)); }
  ritualFail() { this._tone(freq(0, -1), 0.7, 0.22, 'sawtooth'); this._tone(freq(0, -1) * 45 / 32, 0.7, 0.14, 'sawtooth', 0.04); }   // Tritonus
  leap() { for (let i = 0; i < 10; i++) this._bell(freq(i, 1), 0.14, 2.6 - i * 0.12, this.m.sfx, i * 0.09); }
  finale() {
    [0, 4, 7, 9, 8].forEach((n, k) => this._bell(freq(n, 0), 0.22, 7, this.m.sfx, k * 0.4));
    [10, 4, 8].forEach((n, k) => this._bell(freq(n, 2), 0.1, 6, this.m.sfx, 2 + k * 0.5));
  }
  orakel() { [9, 8, 10].forEach((n, k) => this._bell(freq(n, 1), 0.12, 3, this.m.sfx, k * 0.25)); }
}
