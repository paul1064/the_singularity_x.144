// ─────────────────────────────────────────────────────────────
//  Der Endlos-Zoom — 8 verschachtelte Größenordnungen.
//  Ebene k wird mit Maßstab 10^(k − z) gezeichnet: Jede Ebene
//  liegt als winziges Detail im Zentrum der nächsten.
// ─────────────────────────────────────────────────────────────
import { EPOCHS } from './data.js';

const TAU = Math.PI * 2;
const rng = (seed) => () => {
  seed |= 0; seed = seed + 0x6D2B79F5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hexA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
};
const lerpHex = (h1, h2, t) => {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const c = (s) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
};

// Hintergrund-Tönung pro Ebene (sehr dunkel)
const BG = ['#03141a', '#041a0e', '#030d24', '#0b1606', '#1a0f05', '#12060a', '#0c0418', '#0a0a12'];

export class World {
  constructor(canvas) {
    this.cv = canvas;
    this.g = canvas.getContext('2d');
    this.z = 0; this.zTarget = 0; this.zMax = 0; this.zRate = 2.2;
    this.userZoom = false;
    this.t = 0;
    this.density = new Array(8).fill(0);
    this.parts = []; this.floaters = [];
    this.flash = 0; this.flashColor = '#ffffff';
    this.shake = 0;
    this.glitch = null;
    this.mutation = null;   // V2: leuchtender Mutations-Glimmer
    this.relics = [];       // V3: Relikte {id, e, x, y}, sichtbar nur auf ihrer Zoom-Ebene
    this.moment = null;     // V3: aktiver Epochen-Moment
    this.touches = [];      // aktuelle Fingerpositionen (von main.js gesetzt)
    this.mode = 'play';   // play | void | converge | bang
    this.converge = 0;
    this.bang = null;
    this.alt = false;     // Saurier-Zeitlinie
    this.accent = EPOCHS[0].color;
    this._makeStars();
    this._makeLayers();
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.dpr = dpr;
    this.w = this.cv.clientWidth; this.h = this.cv.clientHeight;
    this.cv.width = Math.round(this.w * dpr); this.cv.height = Math.round(this.h * dpr);
    const land = this.w > this.h;
    const vw = land ? this.w - 400 : this.w;   // im Querformat liegt das Panel rechts
    this.cx = vw / 2;
    this.cy = this.h * this.centerY();
    this.R = land ? Math.min(vw, this.h) * 0.36 : Math.min(this.w, this.h * 0.62) * 0.44;
  }
  centerY() { return this.w > this.h ? 0.5 : 0.36; }

  _makeStars() {
    const r = rng(7);
    this.stars = Array.from({ length: 160 }, () => ({
      x: r(), y: r(), s: r() * 1.4 + 0.3, tw: r() * TAU, sp: 0.5 + r() * 2, d: 0.2 + r() * 0.8,
    }));
  }

  // Vorab erzeugte Objekte je Ebene (normierte Koordinaten, Einheitsradius)
  _makeLayers() {
    const L = [];
    // 0 Moleküle
    { const r = rng(11); const cols = ['#e8fbff', '#ff6b6b', '#5ea8ff', '#9fffe0'];
      L[0] = Array.from({ length: 70 }, () => { const a = r() * TAU, d = 0.25 + Math.sqrt(r()) * 1.05;
        return { x: Math.cos(a) * d, y: Math.sin(a) * d, vx: (r() - .5) * .05, vy: (r() - .5) * .05, c: cols[Math.floor(r() * 4)], s: 0.018 + r() * 0.02 }; }); }
    // 1 Zellen
    { const r = rng(22);
      L[1] = Array.from({ length: 34 }, () => { const a = r() * TAU, d = 0.35 + Math.sqrt(r()) * 0.95;
        return { x: Math.cos(a) * d, y: Math.sin(a) * d, s: 0.05 + r() * 0.06, ph: r() * TAU, sp: 0.4 + r(), dx: (r() - .5) * .02, dy: (r() - .5) * .02, chl: r() < .5 }; }); }
    // 2 Meer
    { const r = rng(33);
      L[2] = Array.from({ length: 30 }, (_, i) => ({ kind: i % 3 === 0 ? 'jelly' : 'fish', x: r() * 2.6 - 1.3, y: (r() * 2 - 1) * 0.95, s: 0.04 + r() * 0.06, sp: (0.04 + r() * 0.08) * (r() < .5 ? 1 : -1), ph: r() * TAU })); }
    // 3 Land
    { const r = rng(44);
      L[3] = { plants: Array.from({ length: 50 }, () => { const a = r() * TAU, d = 0.22 + Math.sqrt(r()) * 0.6; return { x: Math.cos(a) * d * 1.25, y: Math.sin(a) * d * 0.5 + 0.08, h: 0.04 + r() * 0.07, hue: r() }; }),
        crit: Array.from({ length: 24 }, () => ({ a: r() * TAU, d: 0.3 + r() * 0.5, sp: (r() - .5) * 0.2, s: 0.012 + r() * 0.02 })) }; }
    // 4 Kontinent
    { const r = rng(55);
      const shape = Array.from({ length: 28 }, (_, i) => 0.85 + r() * 0.35);
      L[4] = { shape, fires: Array.from({ length: 60 }, () => { const a = r() * TAU, d = 0.2 + Math.sqrt(r()) * 0.7; return { x: Math.cos(a) * d, y: Math.sin(a) * d, ph: r() * TAU }; }) }; }
    // 5 Planet
    { const r = rng(66);
      L[5] = { conts: Array.from({ length: 7 }, () => ({ lon: r() * TAU, lat: (r() - .5) * 2.2, s: 0.25 + r() * 0.35, pts: Array.from({ length: 12 }, () => 0.7 + r() * 0.5) })),
        lights: Array.from({ length: 140 }, () => ({ lon: r() * TAU, lat: (r() - .5) * 2.6 })) }; }
    // 6 Orbit
    { const r = rng(77);
      L[6] = { sats: Array.from({ length: 60 }, () => ({ rad: 0.18 + r() * 0.5, ph: r() * TAU, sp: (0.2 + r() * 0.6) * (r() < .8 ? 1 : -1), tilt: 0.3 + r() * 0.5 })),
        ships: Array.from({ length: 8 }, () => ({ a: r() * TAU, ph: r() })) }; }
    // 7 Galaxie
    { const r = rng(88);
      L[7] = Array.from({ length: 420 }, () => { const arm = Math.floor(r() * 3), t = Math.pow(r(), 0.7);
        return { arm, t, off: (r() - .5) * 0.18 * (1 - t * 0.5), s: 0.6 + r() * 1.6, c: r() < 0.15 ? '#ffd6a0' : r() < .5 ? '#cfe3ff' : '#ffffff', net: r() < 0.12 }; }); }
    this.L = L;
  }

  setDensity(owned) {
    for (let e = 0; e < 8; e++) {
      const n = owned[e * 3] + owned[e * 3 + 1] + owned[e * 3 + 2];
      this.density[e] = clamp(Math.log2(1 + n) / 7.5, 0, 1);
    }
  }

  setEpoch(e, cinematic = false) {
    this.zMax = e;
    this.zTarget = e;
    this.zRate = cinematic ? 0.45 : 2.2;
    this.userZoom = false;
    this.accent = EPOCHS[e].color;
  }

  zoomBy(dz) {
    this.userZoom = true;
    this.zTarget = clamp(this.zTarget + dz, 0, this.zMax);
    this.zRate = 6;
  }
  resetZoom() { this.zTarget = this.zMax; this.userZoom = false; this.zRate = 2.2; }

  // ── Effekte ──────────────────────────────────────────────────
  burst(x, y, color, n = 10, power = 1) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, v = (40 + Math.random() * 140) * power;
      this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0.6 + Math.random() * 0.6, max: 1.2, c: color, s: 1 + Math.random() * 2.2 });
    }
    if (this.parts.length > 400) this.parts.splice(0, this.parts.length - 400);
  }
  floater(x, y, text, color) {
    this.floaters.push({ x, y, text, c: color, life: 1.1 });
    if (this.floaters.length > 24) this.floaters.shift();
  }
  doFlash(color = '#ffffff', amt = 1) { this.flash = amt; this.flashColor = color; }

  spawnGlitch() {
    const m = 50;
    this.glitch = { x: m + Math.random() * (this.w - 2 * m), y: 90 + Math.random() * (this.h * 0.5 - 90), life: 9 };
  }
  hitGlitch(x, y) {
    if (!this.glitch) return false;
    const hit = Math.hypot(x - this.glitch.x, y - this.glitch.y) < 44;
    if (hit) { this.burst(this.glitch.x, this.glitch.y, '#ffffff', 40, 1.6); this.glitch = null; }
    return hit;
  }

  spawnMutation(life = 9) {
    const m = 56;
    this.mutation = { x: m + Math.random() * (this.w - 2 * m - 30), y: 250 + Math.random() * Math.max(40, this.h * 0.52 - 250), life, max: life };
  }
  hitMutation(x, y) {
    const m = this.mutation;
    if (!m || Math.hypot(x - m.x, y - m.y) > 52) return false;
    this.burst(m.x, m.y, '#7cf29c', 36, 1.5);
    this.mutation = null;
    return true;
  }

  addRelic(id, e) {
    const m = 60;
    this.relics.push({ id, e, x: m + Math.random() * (this.w - 2 * m - 40), y: 260 + Math.random() * Math.max(40, this.h * 0.5 - 260) });
  }
  relicVis(r) { return Math.max(0, 1 - Math.abs(this.z - r.e) / 0.3); }
  hitRelic(x, y) {
    for (const r of this.relics) if (this.relicVis(r) > 0.5 && Math.hypot(x - r.x, y - r.y) < 50) return r;
    return null;
  }

  // ── Epochen-Momente ──────────────────────────────────────────
  startMoment(def) {
    const { w, h } = this, items = [];
    if (def.kind === 'collect') {
      for (let i = 0; i < def.n; i++) {
        const sp = def.moving ? 38 + Math.random() * 40 : 0, a = Math.random() * TAU;
        items.push({ x: 60 + Math.random() * (w - 120), y: 190 + Math.random() * (h - 420), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 30, alive: true, ph: Math.random() * 6 });
      }
    } else {
      const R = Math.min(w * 0.24, 100), cy = h * 0.44;   // kompakt: mit einer Hand bequem erreichbar
      for (let i = 0; i < def.n; i++) {
        const a = -Math.PI / 2 + i / def.n * TAU;
        items.push(def.n === 1 ? { x: w / 2, y: cy, r: 40 } : { x: w / 2 + Math.cos(a) * R, y: cy + Math.sin(a) * R, r: 42 });
      }
    }
    this.moment = { ...def, items, t: 0, prog: 0, left: def.n, done: false, failed: false };
  }
  hitMoment(x, y) {
    const m = this.moment; if (!m || m.done || m.failed) return false;
    for (const it of m.items) {
      if (m.kind === 'collect' && it.alive && Math.hypot(x - it.x, y - it.y) < it.r + 16) {
        it.alive = false; m.left--; this.burst(it.x, it.y, m.color, 26, 1.3);
        if (m.left <= 0) m.done = true;
        return true;
      }
      if (m.kind === 'hold' && Math.hypot(x - it.x, y - it.y) < it.r + 30) return true;
    }
    return false;
  }
  _updateMoment(dt) {
    const m = this.moment; if (!m || m.done || m.failed) return;
    m.t += dt;
    if (m.kind === 'collect') {
      for (const it of m.items) if (it.alive && m.moving) {
        it.x += it.vx * dt; it.y += it.vy * dt;
        if (it.x < 40 || it.x > this.w - 40) it.vx *= -1;
        if (it.y < 170 || it.y > this.h - 200) it.vy *= -1;
      }
    } else {
      let all = true;
      for (const it of m.items) { it.cov = this.touches.some((p) => Math.hypot(p.x - it.x, p.y - it.y) < it.r + 30); if (!it.cov) all = false; }
      m.prog = all ? Math.min(m.hold, m.prog + dt) : Math.max(0, m.prog - dt * 1.2);
      if (m.prog >= m.hold) m.done = true;
    }
    if (!m.done && m.t >= m.dur) m.failed = true;
  }
  _drawMoment() {
    const g = this.g, m = this.moment, t = this.t, c = m.color;
    g.save(); g.globalCompositeOperation = 'lighter';
    for (const it of m.items) {
      if (m.kind === 'collect') {
        if (!it.alive) continue;
        const p = 1 + Math.sin(t * 6 + it.ph) * 0.15;
        this._halo(g, it.x, it.y, 46 * p, c, 0.5);
        g.fillStyle = '#ffffff'; g.beginPath(); g.arc(it.x, it.y, 7 * p, 0, TAU); g.fill();
        g.strokeStyle = hexA(c, 0.7); g.lineWidth = 2; g.beginPath(); g.arc(it.x, it.y, 18 * p, 0, TAU); g.stroke();
      } else {
        const cov = !!it.cov, p = m.prog / m.hold;
        if (cov) this._halo(g, it.x, it.y, it.r * 2.4, c, 0.45);
        g.lineWidth = 3; g.strokeStyle = hexA(c, cov ? 0.95 : 0.45 + Math.sin(t * 4) * 0.15);
        g.beginPath(); g.arc(it.x, it.y, it.r, 0, TAU); g.stroke();
        g.strokeStyle = '#ffffff'; g.lineWidth = 5;
        g.beginPath(); g.arc(it.x, it.y, it.r + 8, -Math.PI / 2, -Math.PI / 2 + TAU * p); g.stroke();
      }
    }
    g.restore();
  }

  // ── Schleife ─────────────────────────────────────────────────
  update(dt) {
    this.t += dt;
    this.z += (this.zTarget - this.z) * (1 - Math.exp(-dt * this.zRate));
    if (Math.abs(this.zTarget - this.z) < 0.001) { this.z = this.zTarget; if (!this.userZoom) this.zRate = 2.2; }
    for (const p of this.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.94; p.vy *= 0.94; p.life -= dt; }
    this.parts = this.parts.filter((p) => p.life > 0);
    for (const f of this.floaters) { f.y -= 38 * dt; f.life -= dt; }
    this.floaters = this.floaters.filter((f) => f.life > 0);
    this.flash = Math.max(0, this.flash - dt * 0.9);
    this.shake = Math.max(0, this.shake - dt * 2);
    if (this.glitch) { this.glitch.life -= dt; if (this.glitch.life <= 0) this.glitch = null; }
    if (this.mutation) { this.mutation.life -= dt; if (this.mutation.life <= 0) this.mutation = null; }
    this._updateMoment(dt);
    if (this.bang) this.bang.t += dt;
  }

  draw() {
    const g = this.g, d = this.dpr;
    g.setTransform(d, 0, 0, d, 0, 0);
    // Hintergrund: Tönung zwischen den Epochen
    const zi = clamp(Math.floor(this.z), 0, 7), zf = this.z - zi;
    g.fillStyle = lerpHex(BG[zi], BG[Math.min(7, zi + 1)], zf);
    g.fillRect(0, 0, this.w, this.h);
    if (this.shake > 0) g.translate((Math.random() - .5) * 14 * this.shake, (Math.random() - .5) * 14 * this.shake);
    this._drawStars();

    if (this.mode === 'void') this._drawVoid();
    else if (this.mode === 'bang') this._drawBang();
    else {
      // Ebenen von außen (groß) nach innen (klein) zeichnen
      for (let k = Math.min(7, this.zMax); k >= 0; k--) {
        const dd = k - this.z;
        let a = dd <= 0.3 ? 1 : dd >= 0.9 ? 0 : 1 - (dd - 0.3) / 0.6;
        if (dd < -1.1) a *= clamp(1 - (-1.1 - dd) / 0.45, 0, 1);
        if (a <= 0.01) continue;
        const r = this.R * Math.pow(10, dd);
        g.save(); g.globalAlpha = a;
        this['_L' + k](g, this.cx, this.cy, r, this.density[k]);
        g.restore();
      }
      if (this.mode === 'converge') this._drawConverge();
    }

    // Partikel, Zahlen, Glitch
    g.globalCompositeOperation = 'lighter';
    for (const p of this.parts) {
      g.globalAlpha = clamp(p.life / p.max * 1.6, 0, 1);
      g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.s, 0, TAU); g.fill();
    }
    g.globalCompositeOperation = 'source-over';
    g.textAlign = 'center'; g.font = '600 17px "Space Grotesk", system-ui, sans-serif';
    for (const f of this.floaters) {
      g.globalAlpha = clamp(f.life * 1.4, 0, 1);
      g.fillStyle = f.c; g.fillText(f.text, f.x, f.y);
    }
    g.globalAlpha = 1;
    if (this.glitch) this._drawGlitch();
    if (this.mutation) this._drawMutation();
    if (this.relics.length) this._drawRelics();
    if (this.moment && !this.moment.done && !this.moment.failed) this._drawMoment();
    if (this.flash > 0) {
      g.setTransform(d, 0, 0, d, 0, 0);
      g.globalAlpha = clamp(this.flash, 0, 1); g.fillStyle = this.flashColor;
      g.fillRect(0, 0, this.w, this.h); g.globalAlpha = 1;
    }
  }

  _drawStars() {
    const g = this.g;
    for (const s of this.stars) {
      const tw = 0.5 + 0.5 * Math.sin(this.t * s.sp + s.tw);
      g.globalAlpha = 0.25 + tw * 0.6 * s.d;
      g.fillStyle = '#ffffff';
      const px = ((s.x * this.w + this.z * 12 * s.d) % this.w + this.w) % this.w;
      g.fillRect(px, s.y * this.h, s.s, s.s);
    }
    g.globalAlpha = 1;
  }

  _halo(g, x, y, r, color, a = 0.35) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, hexA(color, a)); gr.addColorStop(1, hexA(color, 0));
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  // weicher runder Ausschnitt einer Ebene
  _lens(g, x, y, r, inner, outer) {
    const gr = g.createRadialGradient(x, y, r * 0.2, x, y, r * 1.45);
    gr.addColorStop(0, inner); gr.addColorStop(0.7, outer); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * 1.45, 0, TAU); g.fill();
  }
  _fadeFor(x, y, R) { return clamp(1.35 - Math.hypot(x, y) / R * 0.9, 0, 1); }

  // ── Ebene 0: Moleküle ───────────────────────────────────────
  _L0(g, cx, cy, r, den) {
    this._lens(g, cx, cy, r, 'rgba(20,90,100,0.55)', 'rgba(8,40,50,0.35)');
    const n = Math.floor(16 + den * 54), P = this.L[0], t = this.t;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const p = P[i];
      const x = p.x + Math.sin(t * 0.3 + i) * 0.04, y = p.y + Math.cos(t * 0.27 + i * 1.3) * 0.04;
      pts.push([cx + x * r, cy + y * r, p]);
    }
    g.lineWidth = Math.max(0.5, r * 0.006); g.strokeStyle = 'rgba(160,255,240,0.25)';
    g.beginPath();
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1];
      if (dx * dx + dy * dy < (r * 0.22) ** 2) { g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[j][0], pts[j][1]); }
    }
    g.stroke();
    for (const [x, y, p] of pts) {
      const s = p.s * r;
      this._halo(g, x, y, s * 3, p.c, 0.25);
      g.fillStyle = p.c; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
    }
    // Blitze in der Ursuppe
    if (den > 0 && Math.sin(t * 1.7) > 0.985) {
      g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = Math.max(1, r * 0.01);
      g.beginPath(); let x = cx + (Math.random() - .5) * r, y = cy - r;
      g.moveTo(x, y); for (let i = 0; i < 6; i++) { x += (Math.random() - .5) * r * 0.3; y += r * 0.3; g.lineTo(x, y); } g.stroke();
    }
  }

  _blob(g, x, y, s, ph, wob = 0.08) {
    g.beginPath();
    for (let i = 0; i <= 14; i++) {
      const a = i / 14 * TAU, rr = s * (1 + Math.sin(a * 3 + ph) * wob + Math.sin(a * 5 - ph * 1.3) * wob * 0.5);
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      i ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.closePath();
  }

  // ── Ebene 1: Zellen ─────────────────────────────────────────
  _L1(g, cx, cy, r, den) {
    this._lens(g, cx, cy, r, 'rgba(30,110,50,0.5)', 'rgba(10,50,25,0.35)');
    const t = this.t, n = Math.floor(6 + den * 28);
    for (let i = 0; i < n; i++) {
      const c = this.L[1][i];
      const x = cx + (c.x + Math.sin(t * c.sp * 0.2 + c.ph) * 0.05) * r, y = cy + (c.y + Math.cos(t * c.sp * 0.17 + c.ph) * 0.05) * r;
      const s = c.s * r, ph = t * c.sp + c.ph;
      g.globalAlpha *= 1;
      this._blob(g, x, y, s, ph);
      g.fillStyle = 'rgba(120,255,160,0.12)'; g.fill();
      g.strokeStyle = 'rgba(150,255,180,0.7)'; g.lineWidth = Math.max(0.6, s * 0.08); g.stroke();
      g.fillStyle = 'rgba(200,255,150,0.75)'; g.beginPath(); g.arc(x + s * 0.2, y - s * 0.1, s * 0.28, 0, TAU); g.fill();
      if (c.chl && den > 0.25) { g.fillStyle = '#3ddc84'; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x + Math.cos(ph + k * 2) * s * 0.55, y + Math.sin(ph + k * 2) * s * 0.55, s * 0.1, 0, TAU); g.fill(); } }
    }
    // Wirtszelle in der Mitte (enthält die Moleküle)
    const hs = r * 0.16;
    this._blob(g, cx, cy, hs, t * 0.8, 0.05);
    g.fillStyle = 'rgba(20,90,100,0.35)'; g.fill();
    g.strokeStyle = 'rgba(170,255,200,0.9)'; g.lineWidth = Math.max(1, hs * 0.05); g.stroke();
  }

  _fish(g, x, y, s, dir, ph, col) {
    g.save(); g.translate(x, y); g.scale(dir, 1);
    g.fillStyle = col;
    g.beginPath(); g.ellipse(0, 0, s, s * 0.4, 0, 0, TAU); g.fill();
    const tw = Math.sin(ph) * s * 0.25;
    g.beginPath(); g.moveTo(-s * 0.85, 0); g.lineTo(-s * 1.5, -s * 0.45 + tw); g.lineTo(-s * 1.5, s * 0.45 + tw); g.closePath(); g.fill();
    g.fillStyle = 'rgba(0,0,0,0.6)'; g.beginPath(); g.arc(s * 0.55, -s * 0.08, s * 0.08, 0, TAU); g.fill();
    g.restore();
  }
  _jelly(g, x, y, s, ph, col) {
    g.fillStyle = col; g.strokeStyle = col; g.lineWidth = Math.max(0.5, s * 0.06);
    g.beginPath(); g.arc(x, y, s, Math.PI, 0); g.quadraticCurveTo(x, y + s * 0.3, x - s, y); g.fill();
    for (let k = -2; k <= 2; k++) {
      g.beginPath(); g.moveTo(x + k * s * 0.35, y + s * 0.1);
      for (let j = 1; j <= 5; j++) g.lineTo(x + k * s * 0.35 + Math.sin(ph + j + k) * s * 0.15, y + s * 0.1 + j * s * 0.35);
      g.stroke();
    }
  }

  // ── Ebene 2: Meer ───────────────────────────────────────────
  _L2(g, cx, cy, r, den) {
    this._lens(g, cx, cy, r, 'rgba(20,70,160,0.6)', 'rgba(5,20,70,0.45)');
    const t = this.t;
    // Lichtstrahlen
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const x = cx + (i - 2) * r * 0.35 + Math.sin(t * 0.2 + i) * r * 0.05;
      const gr = g.createLinearGradient(x, cy - r * 1.3, x, cy + r);
      gr.addColorStop(0, 'rgba(140,200,255,0.16)'); gr.addColorStop(1, 'rgba(140,200,255,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x - r * 0.05, cy - r * 1.3); g.lineTo(x + r * 0.05, cy - r * 1.3); g.lineTo(x + r * 0.2, cy + r); g.lineTo(x - r * 0.1, cy + r); g.fill();
    }
    g.restore();
    const n = Math.floor(6 + den * 24);
    for (let i = 0; i < n; i++) {
      const f = this.L[2][i];
      let x = ((f.x + t * f.sp + 1.3) % 2.6 + 2.6) % 2.6 - 1.3, y = f.y + Math.sin(t * 0.5 + f.ph) * 0.03;
      const fade = this._fadeFor(x, y, 1);
      if (fade <= 0) continue;
      g.save(); g.globalAlpha *= fade;
      if (f.kind === 'jelly') this._jelly(g, cx + x * r * 0.9, cy + (y + Math.sin(t * 0.8 + f.ph) * 0.05) * r, f.s * r * 0.8, t * 2 + f.ph, 'rgba(255,150,230,0.55)');
      else this._fish(g, cx + x * r, cy + y * r, f.s * r, Math.sign(f.sp), t * 6 + f.ph, 'rgba(120,220,255,0.8)');
      g.restore();
    }
    // Wirts-Qualle in der Mitte (enthält die Zellen)
    const hs = r * 0.17;
    g.save(); g.globalCompositeOperation = 'lighter';
    this._halo(g, cx, cy, hs * 1.8, '#ff9ee6', 0.25); g.restore();
    g.strokeStyle = 'rgba(255,180,240,0.8)'; g.lineWidth = Math.max(1, hs * 0.04);
    g.beginPath(); g.arc(cx, cy, hs, 0, TAU); g.stroke();
    for (let k = 0; k < 7; k++) {
      const a = Math.PI * 0.2 + k / 6 * Math.PI * 0.6;
      g.beginPath(); g.moveTo(cx + Math.cos(a) * hs, cy + Math.sin(a) * hs);
      for (let j = 1; j < 6; j++) g.lineTo(cx + Math.cos(a) * hs + Math.sin(t * 2 + j + k) * hs * 0.08, cy + Math.sin(a) * hs + j * hs * 0.22);
      g.stroke();
    }
  }

  // ── Ebene 3: Landgang (Insel) ───────────────────────────────
  _L3(g, cx, cy, r, den) {
    this._lens(g, cx, cy, r, 'rgba(40,120,150,0.55)', 'rgba(15,50,60,0.4)');
    const t = this.t, D = this.L[3];
    // Insel
    g.fillStyle = 'rgba(70,120,40,0.95)';
    g.beginPath(); g.ellipse(cx, cy + r * 0.05, r * 0.95, r * 0.5, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(200,180,110,0.7)'; g.lineWidth = r * 0.03; g.strokeStyle = 'rgba(230,210,140,0.6)'; g.stroke();
    g.fillStyle = 'rgba(95,150,50,1)';
    g.beginPath(); g.ellipse(cx, cy + r * 0.03, r * 0.8, r * 0.4, 0, 0, TAU); g.fill();
    // Pflanzen
    const np = Math.floor(8 + den * 42);
    for (let i = 0; i < np; i++) {
      const p = D.plants[i];
      if (Math.hypot(p.x, (p.y - 0.05) * 2) < 0.24) continue;
      const x = cx + p.x * r * 0.7, y = cy + p.y * r, h = p.h * r, sw = Math.sin(t * 1.2 + i) * h * 0.1;
      g.fillStyle = p.hue < 0.5 ? '#2f7d32' : '#4caf50';
      g.beginPath(); g.moveTo(x - h * 0.3, y); g.lineTo(x + sw, y - h); g.lineTo(x + h * 0.3, y); g.fill();
    }
    // Tiere
    const nc = Math.floor(den * 24);
    for (let i = 0; i < nc; i++) {
      const c = D.crit[i], a = c.a + t * c.sp;
      const x = cx + Math.cos(a) * c.d * r * 0.8, y = cy + Math.sin(a) * c.d * r * 0.36 + r * 0.03;
      g.fillStyle = '#3b2a18'; g.beginPath(); g.ellipse(x, y - c.s * r * 0.5, c.s * r * 1.2, c.s * r * 0.6, 0, 0, TAU); g.fill();
    }
    // Gezeitentümpel in der Mitte (enthält das Meer)
    const hs = r * 0.16;
    g.fillStyle = 'rgba(20,70,160,0.9)'; g.beginPath(); g.arc(cx, cy, hs, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(160,220,255,0.6)'; g.lineWidth = Math.max(1, hs * 0.05); g.stroke();
  }

  // ── Ebene 4: Kontinent mit Feuern ───────────────────────────
  _L4(g, cx, cy, r, den) {
    this._lens(g, cx, cy, r, 'rgba(25,60,110,0.6)', 'rgba(10,25,50,0.45)');
    const t = this.t, D = this.L[4];
    // weiche Küstenlinie (Kurven durch die Mittelpunkte)
    const P = D.shape.map((v, i) => { const a = i / D.shape.length * TAU; return [cx + Math.cos(a) * r * v, cy + Math.sin(a) * r * v * 0.85]; });
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    g.beginPath();
    let m0 = mid(P[P.length - 1], P[0]); g.moveTo(m0[0], m0[1]);
    for (let i = 0; i < P.length; i++) { const m = mid(P[i], P[(i + 1) % P.length]); g.quadraticCurveTo(P[i][0], P[i][1], m[0], m[1]); }
    g.closePath();
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    gr.addColorStop(0, this.alt ? '#4b6a2a' : '#56702d'); gr.addColorStop(0.7, '#6b5a34'); gr.addColorStop(1, '#8a7a50');
    g.fillStyle = gr; g.fill();
    // Wege zwischen Feuern
    const nf = Math.floor(den * 60);
    g.strokeStyle = 'rgba(255,190,110,0.18)'; g.lineWidth = Math.max(0.5, r * 0.004);
    g.beginPath();
    for (let i = 1; i < nf; i++) { const a = D.fires[i - 1], b = D.fires[i]; g.moveTo(cx + a.x * r, cy + a.y * r); g.lineTo(cx + b.x * r, cy + b.y * r); }
    g.stroke();
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < nf; i++) {
      const f = D.fires[i], fl = 0.7 + 0.3 * Math.sin(t * 8 + f.ph);
      this._halo(g, cx + f.x * r, cy + f.y * r, r * 0.05 * fl, '#ffa040', 0.8);
    }
    g.restore();
    // See in der Mitte (enthält die Insel)
    g.fillStyle = 'rgba(25,70,140,1)'; g.beginPath(); g.arc(cx, cy, r * 0.15, 0, TAU); g.fill();
  }

  // ── Ebene 5: Planet mit Stadtlichtern ───────────────────────
  _L5(g, cx, cy, r, den) {
    const t = this.t, D = this.L[5], pr = r * 0.95, rot = t * 0.05;
    g.save(); g.globalCompositeOperation = 'lighter';
    this._halo(g, cx, cy, pr * 1.25, '#5ab0ff', 0.35); g.restore();
    g.save();
    g.beginPath(); g.arc(cx, cy, pr, 0, TAU); g.clip();
    const oc = g.createRadialGradient(cx - pr * 0.3, cy - pr * 0.3, 0, cx, cy, pr);
    oc.addColorStop(0, '#2a6fc9'); oc.addColorStop(1, '#0b2350');
    g.fillStyle = oc; g.fillRect(cx - pr, cy - pr, pr * 2, pr * 2);
    // Kontinente (Projektion auf die Kugel)
    for (const c of D.conts) {
      const lon = c.lon + rot, x3 = Math.sin(lon) * Math.cos(c.lat * 0.5);
      const zc = Math.cos(lon) * Math.cos(c.lat * 0.5);
      if (zc < -0.2) continue;
      const px = cx + x3 * pr, py = cy + Math.sin(c.lat * 0.5) * pr, s = c.s * pr * (0.4 + 0.6 * Math.max(0, zc));
      g.fillStyle = this.alt ? '#4f7a33' : '#5d8a3a';
      g.beginPath(); c.pts.forEach((v, i) => { const a = i / c.pts.length * TAU; const qx = px + Math.cos(a) * s * v * Math.max(0.3, zc), qy = py + Math.sin(a) * s * v; i ? g.lineTo(qx, qy) : g.moveTo(qx, qy); }); g.fill();
    }
    // Nachtseite + Stadtlichter
    const sh = g.createLinearGradient(cx - pr, 0, cx + pr, 0);
    sh.addColorStop(0, 'rgba(0,0,10,0)'); sh.addColorStop(0.55, 'rgba(0,0,10,0.25)'); sh.addColorStop(1, 'rgba(0,0,10,0.8)');
    g.fillStyle = sh; g.fillRect(cx - pr, cy - pr, pr * 2, pr * 2);
    const nl = Math.floor(den * 140);
    g.fillStyle = '#ffd580';
    for (let i = 0; i < nl; i++) {
      const L = D.lights[i], lon = L.lon + rot, zc = Math.cos(lon) * Math.cos(L.lat * 0.5);
      if (zc < 0) continue;
      const px = cx + Math.sin(lon) * Math.cos(L.lat * 0.5) * pr;
      if (px < cx) continue;
      g.globalAlpha = 0.5 + 0.5 * zc;
      g.fillRect(px, cy + Math.sin(L.lat * 0.5) * pr, Math.max(1, pr * 0.012), Math.max(1, pr * 0.012));
    }
    g.restore();
    g.strokeStyle = 'rgba(140,200,255,0.5)'; g.lineWidth = Math.max(1, pr * 0.012);
    g.beginPath(); g.arc(cx, cy, pr, 0, TAU); g.stroke();
  }

  // ── Ebene 6: Orbit (Satelliten, Raumschiffe) ─────────────────
  _L6(g, cx, cy, r, den) {
    const t = this.t, D = this.L[6];
    // Sonne am Rand
    g.save(); g.globalCompositeOperation = 'lighter';
    this._halo(g, cx - r * 1.1, cy - r * 0.9, r * 0.9, '#ffcf70', 0.35);
    g.restore();
    // Mond
    const ma = t * 0.12;
    g.fillStyle = '#b8b8c8'; g.beginPath(); g.arc(cx + Math.cos(ma) * r * 0.62, cy + Math.sin(ma) * r * 0.62 * 0.4, r * 0.035, 0, TAU); g.fill();
    // Orbitalbahnen & Satelliten
    const ns = Math.floor(4 + den * 56);
    for (let i = 0; i < ns; i++) {
      const s = D.sats[i], a = s.ph + t * s.sp * 0.5;
      const x = cx + Math.cos(a) * s.rad * r, y = cy + Math.sin(a) * s.rad * r * s.tilt;
      if (i < 10) { g.strokeStyle = 'rgba(200,160,255,0.12)'; g.lineWidth = 1; g.beginPath(); g.ellipse(cx, cy, s.rad * r, s.rad * r * s.tilt, 0, 0, TAU); g.stroke(); }
      g.fillStyle = '#e6d5ff'; g.fillRect(x - 1, y - 1, Math.max(1.5, r * 0.006), Math.max(1.5, r * 0.006));
    }
    // Raumschiffe mit Schweif
    const nsh = Math.floor(den * 8);
    g.strokeStyle = 'rgba(199,125,255,0.7)'; g.lineWidth = Math.max(1, r * 0.004);
    for (let i = 0; i < nsh; i++) {
      const s = D.ships[i], p = (t * 0.06 + s.ph) % 1, d0 = 0.12 + p * 1.2;
      const x = cx + Math.cos(s.a) * d0 * r, y = cy + Math.sin(s.a) * d0 * r;
      g.globalAlpha = (1 - p);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(s.a) * r * 0.08, y - Math.sin(s.a) * r * 0.08); g.stroke();
    }
    g.globalAlpha = 1;
  }

  // ── Ebene 7: Galaxie / Galaktisches Netz ────────────────────
  _L7(g, cx, cy, r, den) {
    const t = this.t, rot = t * 0.02;
    g.save(); g.globalCompositeOperation = 'lighter';
    this._halo(g, cx, cy, r * 0.5, '#fff3b0', 0.35);
    const pts = [];
    for (const s of this.L[7]) {
      const ang = s.arm / 3 * TAU + s.t * 4.2 + rot + s.off * 3;
      const d = (0.08 + s.t * 1.05) * r;
      const x = cx + Math.cos(ang) * d + s.off * r * 0.3, y = cy + Math.sin(ang) * d * 0.62 + s.off * r * 0.2;
      g.fillStyle = s.c; g.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + s.t * 30);
      g.fillRect(x, y, s.s, s.s);
      if (s.net) pts.push([x, y]);
    }
    // Das galaktische Netz: Sterne werden zu Neuronen
    if (den > 0) {
      const lim = Math.floor(pts.length * den);
      g.globalAlpha = 0.35; g.strokeStyle = '#fff3b0'; g.lineWidth = 0.7;
      g.beginPath();
      // jedes Neuron verbindet sich mit seinen zwei nächsten Nachbarn
      for (let i = 0; i < lim; i++) {
        const near = [];
        for (let j = 0; j < lim; j++) if (j !== i) near.push([(pts[i][0] - pts[j][0]) ** 2 + (pts[i][1] - pts[j][1]) ** 2, j]);
        near.sort((a, b) => a[0] - b[0]);
        for (const [, j] of near.slice(0, 2)) { g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[j][0], pts[j][1]); }
      }
      g.stroke();
    }
    g.restore();
  }

  // ── Kino-Modi ───────────────────────────────────────────────
  _drawVoid() {
    const g = this.g, p = 0.6 + 0.4 * Math.sin(this.t * 2.2);
    g.save(); g.globalCompositeOperation = 'lighter';
    this._halo(g, this.cx, this.cy, 30 + p * 16, '#ffffff', 0.5 * p);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(this.cx, this.cy, 2.2, 0, TAU); g.fill();
    g.restore();
  }

  _drawConverge() {
    const g = this.g, c = this.converge;
    g.save(); g.globalCompositeOperation = 'lighter';
    const n = 80;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + this.t * 0.4, ph = (this.t * (0.3 + c * 1.6) + i * 0.137) % 1;
      const d = (1 - ph) * Math.max(this.w, this.h) * 0.8;
      g.fillStyle = EPOCHS[i % 8].color; g.globalAlpha = ph * (0.3 + c);
      g.beginPath(); g.arc(this.cx + Math.cos(a) * d, this.cy + Math.sin(a) * d, 1.5 + c * 2, 0, TAU); g.fill();
    }
    g.globalAlpha = 1;
    this._halo(g, this.cx, this.cy, 20 + c * this.R * 1.2, '#ffffff', 0.25 + c * 0.7);
    g.restore();
  }

  startBang(colors) {
    this.mode = 'bang';
    const P = [];
    for (let i = 0; i < 700; i++) {
      const a = Math.random() * TAU, v = 0.2 + Math.pow(Math.random(), 0.6) * 1.4;
      P.push({ a, v, c: colors[i % colors.length], s: 0.6 + Math.random() * 2 });
    }
    this.bang = { t: 0, P };
  }
  _drawBang() {
    const g = this.g, b = this.bang; if (!b) return;
    const e = 1 - Math.exp(-b.t * 1.4), maxD = Math.hypot(this.w, this.h) * 0.6;
    g.save(); g.globalCompositeOperation = 'lighter';
    this._halo(g, this.cx, this.cy, 40 + e * maxD * 0.7, '#ffffff', Math.max(0, 0.8 - b.t * 0.25));
    for (const p of b.P) {
      const d = e * p.v * maxD;
      g.globalAlpha = clamp(1.4 - b.t * 0.22, 0, 1);
      g.fillStyle = p.c; g.beginPath(); g.arc(this.cx + Math.cos(p.a) * d, this.cy + Math.sin(p.a) * d, p.s, 0, TAU); g.fill();
    }
    g.restore();
  }

  // Relikt: pulsierende bernsteinfarbene Raute mit Glanzlinien
  _drawRelics() {
    const g = this.g, t = this.t, c = '#ffb347';
    for (const r of this.relics) {
      const v = this.relicVis(r); if (v <= 0) continue;
      const s = 12 + Math.sin(t * 3 + r.x) * 1.5;
      g.save(); g.globalAlpha = v; g.globalCompositeOperation = 'lighter';
      this._halo(g, r.x, r.y, 44 + Math.sin(t * 2.4) * 6, c, 0.35);
      g.fillStyle = hexA(c, 0.85); g.beginPath();
      g.moveTo(r.x, r.y - s * 1.3); g.lineTo(r.x + s, r.y); g.lineTo(r.x, r.y + s * 1.3); g.lineTo(r.x - s, r.y); g.closePath(); g.fill();
      g.strokeStyle = hexA('#ffffff', 0.7); g.lineWidth = 1.5; g.stroke();
      g.restore();
    }
  }

  // Doppelhelix in einem Ring, dessen Bogen die verbleibende Zeit zeigt
  _drawMutation() {
    const g = this.g, m = this.mutation, t = this.t, c = '#7cf29c';
    const pulse = 1 + Math.sin(t * 5) * 0.08, x = m.x, y = m.y;
    g.save(); g.globalCompositeOperation = 'lighter';
    this._halo(g, x, y, 46 * pulse, c, 0.4);
    g.lineWidth = 2.5; g.lineCap = 'round';
    g.strokeStyle = hexA(c, 0.25); g.beginPath(); g.arc(x, y, 30, 0, TAU); g.stroke();
    g.strokeStyle = hexA(c, 0.9); g.beginPath(); g.arc(x, y, 30, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(m.life / m.max, 0, 1)); g.stroke();
    g.lineWidth = 2;
    for (const ph of [0, Math.PI]) {
      g.strokeStyle = ph ? '#ffffff' : c; g.beginPath();
      for (let k = -10; k <= 10; k++) {
        const yy = y + k * 1.8, xx = x + Math.sin(k * 0.45 + t * 3 + ph) * 9;
        k === -10 ? g.moveTo(xx, yy) : g.lineTo(xx, yy);
      }
      g.stroke();
    }
    g.restore();
  }

  _drawGlitch() {
    const g = this.g, gl = this.glitch, t = this.t;
    const x = gl.x + (Math.random() < 0.1 ? (Math.random() - .5) * 8 : 0), y = gl.y;
    g.save(); g.globalCompositeOperation = 'lighter';
    this._halo(g, x, y, 34 + Math.sin(t * 6) * 6, '#ffffff', 0.35);
    g.font = '700 28px "Space Grotesk", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ff3df0'; g.fillText('✧', x - 2, y);
    g.fillStyle = '#3dfff0'; g.fillText('✧', x + 2, y);
    g.fillStyle = '#ffffff'; g.fillText('✧', x, y);
    g.restore();
  }
}
