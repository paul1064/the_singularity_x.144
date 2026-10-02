// ─────────────────────────────────────────────────────────────
//  Akt III — Ökonomie des Spiegeluniversums (rein, in Node testbar)
//  Acht Spiegel, je mit Licht- und Schattenseite. Der Gleichgewichts-Wert G (Licht-Anteil der Produktion)
//  bestimmt einen Multiplikator; hält man das Gleichgewicht, lädt sich der „Einklang" auf.
// ─────────────────────────────────────────────────────────────
import { SACRED } from './akt2data.js';
import { LETTER, MIRRORS } from './akt3data.js';

export const T3 = {
  costBase: 18, costTier: 7.5, costGrowth: 1.2,
  prodBase: 0.55, prodTier: 6.0,
  msMult: 1.3,
  tapShare: 0.05,
  leapBase: 130, leapTier: 14, leapRun: 0.05,
  band: 0.88,                  // Gleichgewicht (bal) ab dem sich der Einklang auflädt
  einklangUp: 1.5, einklangDown: 0.4, einklangMax: 100,
  offlineHours: 8,
};
export const LAST_KAP = 7;
export const NUM = MIRRORS.length;

export function newA3() { return { run: 1, seals: [], letters: [], ...runFields() }; }
export function runFields() {
  return { mem: 0, earned: 0, lic: new Array(NUM).fill(0), sch: new Array(NUM).fill(0), kap: 0, einklang: 0, buffs: [], cd: { licht: 0, schatten: 0 },
    lines: [], pendingLetter: null, finalLeap: false, taps: 0, playTime: 0, finished: false, lastSeen: Date.now() };
}
export const resetRun = (a3) => Object.assign(a3, runFields());

// Einflüsse von außen: vit = Vitrinen-Fortschritt je Spiegel (0–1), dim = Dimensionen aus Akt II, meta = Siegel/Pantheon …
export function computeFx(a3, ex = {}) {
  const vit = ex.vit || new Array(NUM).fill(0);
  return { hist: vit.map((v) => 1 + 0.5 * v), dim: 1 + 0.05 * (ex.dim || 0), meta: ex.meta || 1, run: 1 + 0.1 * (a3.seals ? a3.seals.length : 0) };
}
export const total = (a3, k) => a3.lic[k] + a3.sch[k];
export const unlocked = (a3, k) => k <= a3.kap;
export function msMult(n) { let m = 1; for (const s of SACRED) if (n >= s) m *= T3.msMult; return m; }
export const unitProd = (k) => T3.prodBase * Math.pow(T3.prodTier, k);
export const sideProd = (a3, fx, k, side) => unitProd(k) * (side === 'licht' ? a3.lic[k] : a3.sch[k]) * msMult(total(a3, k)) * fx.hist[k];
export function weights(a3, fx) {
  let L = 0, S = 0;
  for (let k = 0; k < NUM; k++) { L += sideProd(a3, fx, k, 'licht'); S += sideProd(a3, fx, k, 'schatten'); }
  return { L, S };
}
// G = Licht-Anteil (0–1), bal = 1 bei Gleichgewicht, 0 bei einseitig
export function balance(a3, fx) {
  const { L, S } = weights(a3, fx), s = L + S, G = s > 0 ? L / s : 0.5;
  return { G, bal: 1 - Math.abs(2 * G - 1), L, S };
}
export const balMult = (bal) => 0.6 + bal;
// Verbindungen: Benachbarte Spiegel im Ring leuchten, wenn beide mindestens 7 Einheiten haben und zusammen mindestens 3 je Seite
export const LINK_MIN = 7, LINK_SIDE = 3, LINK_BONUS = 0.06;
export function links(a3) {
  const out = [];
  for (let k = 0; k < NUM; k++) {
    const j = (k + 1) % NUM;
    if (total(a3, k) >= LINK_MIN && total(a3, j) >= LINK_MIN && Math.min(a3.lic[k] + a3.lic[j], a3.sch[k] + a3.sch[j]) >= LINK_SIDE) out.push([k, j]);
  }
  return out;
}
export const linkMult = (a3) => 1 + LINK_BONUS * links(a3).length;
export const einklangMult = (e) => 1 + e / T3.einklangMax;
export const harmonized = (a3, fx) => { const b = balance(a3, fx); return b.L + b.S > 0 && b.bal >= T3.band; };
export function buffMult(a3, kind) { let m = 1; for (const b of a3.buffs) if (b.k === kind && b.m > m) m = b.m; return m; }
export function prodPerSec(a3, fx) {
  const b = balance(a3, fx);
  return (b.L + b.S) * balMult(b.bal) * einklangMult(a3.einklang) * linkMult(a3) * fx.dim * fx.meta * fx.run * buffMult(a3, 'prod');
}
export function tapValue(a3, fx) {
  const lic = a3.lic.reduce((x, y) => x + y, 0);
  return Math.max(1, prodPerSec(a3, fx) * T3.tapShare) * (1 + 0.004 * lic) * buffMult(a3, 'tap');
}
export function earn(a3, v) { a3.mem += v; a3.earned += v; }

export function genCost(a3, k, n = 1) {
  const own = total(a3, k), g = T3.costGrowth;
  return T3.costBase * Math.pow(T3.costTier, k) * Math.pow(g, own) * (Math.pow(g, n) - 1) / (g - 1);
}
export function maxAffordable(a3, k) {
  const own = total(a3, k), g = T3.costGrowth, c0 = T3.costBase * Math.pow(T3.costTier, k) * Math.pow(g, own);
  const n = Math.floor(Math.log(a3.mem * (g - 1) / c0 + 1) / Math.log(g));
  return Math.max(0, n);
}
export function leapCost(a3) {
  return T3.leapBase * Math.pow(T3.leapTier, a3.kap) * (1 + T3.leapRun * (a3.run - 1)) * (a3.kap === LAST_KAP ? 1.5 : 1);
}
// Die Große Spiegelung kostet mehr und braucht zusätzlich vollen Einklang
export const finalReady = (a3) => a3.kap === LAST_KAP && a3.einklang >= T3.einklangMax - 1e-9;

// Einklang: lädt sich im Gleichgewicht, zerfällt sonst langsam
export function tick(a3, fx, dt) {
  const h = harmonized(a3, fx);
  a3.einklang = Math.max(0, Math.min(T3.einklangMax, a3.einklang + (h ? T3.einklangUp : -T3.einklangDown) * dt));
  return h;
}

// Ausgleichen: Welche Einheit auf der schwächeren Seite bringt am meisten für das Geld? (ignoriert Bezahlbarkeit)
export function suggest(a3, fx) {
  const { L, S } = weights(a3, fx);
  const side = L > S ? 'schatten' : L < S ? 'licht' : (a3.lic.reduce((x, y) => x + y, 0) <= a3.sch.reduce((x, y) => x + y, 0) ? 'licht' : 'schatten');
  let best = null;
  for (let k = 0; k < NUM; k++) {
    if (!unlocked(a3, k)) continue;
    const gainP = unitProd(k) * msMult(total(a3, k) + 1) * fx.hist[k], c = genCost(a3, k, 1), r = gainP / c;
    if (!best || r > best.r) best = { k, side, r, cost: c };
  }
  return best;
}
export function buy(a3, fx, k, side, n = 1) {
  const c = genCost(a3, k, n); if (a3.mem < c || !unlocked(a3, k)) return false;
  a3.mem -= c; if (side === 'licht') a3.lic[k] += n; else a3.sch[k] += n; return true;
}

// Brief & Ende
export const tone = (lines) => lines.reduce((s, x) => s + (x === 'a' ? 1 : x === 'b' ? -1 : 0), 0);
export function letterText(lines) { return lines.map((x, i) => LETTER[i][x]); }
export function endingKey(a3, wahrOk) {
  const t = tone(a3.lines);
  if (wahrOk && Math.abs(t) <= 2) return 'wahr';
  return t >= 3 ? 'licht' : t <= -3 ? 'schatten' : 'gleich';
}
export const offlineEff = () => 0.6;
