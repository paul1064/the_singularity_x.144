// ─────────────────────────────────────────────────────────────
//  Akt II — Ökonomie des Ordens (reine Funktionen, in Node testbar)
//  Wissen wächst durch die Sephiroth des Baums; Pfade, Mentoren, Schicksalsebenen und Dimensionen verstärken.
// ─────────────────────────────────────────────────────────────
import { SEPHIROTH, PATHS, ABYSS_PATHS, SACRED, MENTORS, AGE_EVENTS, DIMENSIONS, gi } from './akt2data.js';
import { sephiraOfSign } from './mystik.js';

export const T2 = {
  costBase: 15, costTier: 7.5, costGrowth: 1.22,
  prodBase: 0.6, prodTier: 6.0,
  msMult: 1.3,                       // Faktor je heiliger Zahl
  pathBonus: 0.06, pathMin: 7,      // Pfad leuchtet, wenn beide Enden mindestens 7 Stück haben
  tapShare: 0.05,
  leapBase: 140, leapTier: 30, leapRun: 0.05,
  offlineHours: 8,
  ritualCd: 140,
  sephName: (n) => SEPHIROTH[gi(n)].name,
};
export const ALL_PATHS = [...PATHS, ...ABYSS_PATHS];
export const LAST_AGE = 7;

export function newA2() {
  return { run: 1, dim: 0, layers: 0, prof: null, total: 0, endings: [], wegAll: 0, ...runFields() };
}
export function runFields() {
  return { wissen: 0, earned: 0, owned: new Array(11).fill(0), age: 0, mentors: [], mcd: {}, buffs: [], events: {}, ritCd: 0,
    taps: 0, playTime: 0, weg: 0, pendingEvent: null, pendingMentor: 0, pendingLayer: null, finished: false, lastSeen: Date.now() };
}
export const resetRun = (a2) => Object.assign(a2, runFields());

// ── Schicksal → Spielwirkung ──────────────────────────────────
// Aus den berechneten Daten (mystik.analyse) und der Zahl der enthüllten Ebenen entsteht ein Satz Multiplikatoren.
export function computeFx(a2, a) {
  const fx = { prod: 1, tap: 1, cost: 1, offline: 1, rit: 1, cd: 1, path: 0, mentor: 1, seph: new Array(11).fill(1), lines: [] };
  const sn = T2.sephName;
  const L = a2.layers;
  if (a && L >= 1) { fx.seph[gi(a.sonnenSephira)] *= 1.3; fx.lines[0] = `${sn(a.sonnenSephira)} ×1,3 (Herrscher deiner Sonne)`; }
  if (a && L >= 2) { fx.seph[gi(a.mondSephira)] *= 1.25; fx.tap *= 1.2; fx.lines[1] = `${sn(a.mondSephira)} ×1,25 (Herrscher deines Mondes), Tippen +20 %`; }
  if (a && L >= 3) { fx.seph[gi(a.lebensSephira)] *= 1.3; fx.seph[gi(a.gematriaSephira)] *= 1.15; fx.lines[2] = `${sn(a.lebensSephira)} ×1,3 (Lebensweg), ${sn(a.gematriaSephira)} ×1,15 (Name)`; }
  if (a && L >= 4) {
    const parts = [];
    for (const line of [a.hd.personality.line, a.hd.design.line]) {
      if (line === 1) { fx.cost *= 0.94; parts.push('Kosten −6 %'); }
      if (line === 2) { fx.offline *= 1.3; parts.push('Offline +30 %'); }
      if (line === 3) { fx.rit *= 1.25; parts.push('Rituale +25 %'); }
      if (line === 4) { fx.tap *= 1.25; parts.push('Tippen +25 %'); }
      if (line === 5) { fx.cd *= 1.15; parts.push('Kräfte 15 % schneller'); }
      if (line === 6) { fx.prod *= 1.08; parts.push('Produktion +8 %'); }
    }
    fx.lines[3] = `Profil ${a.hd.profil}: ${parts.join(', ')}`;
  }
  if (a && L >= 5) {
    const id = a.aspekt ? a.aspekt.id : 'keiner';
    if (id === 'konjunktion') { fx.prod *= 1.05; fx.tap *= 1.1; fx.lines[4] = 'Sonne–Mond-Konjunktion: Produktion +5 %, Tippen +10 %'; }
    else if (id === 'sextil' || id === 'trigon') { fx.prod *= 1.1; fx.lines[4] = `Sonne–Mond-${id === 'trigon' ? 'Trigon' : 'Sextil'}: Produktion +10 %`; }
    else if (id === 'quadrat' || id === 'opposition') { fx.tap *= 1.2; fx.rit *= 1.2; fx.lines[4] = `Sonne–Mond-${id === 'quadrat' ? 'Quadrat' : 'Opposition'}: Tippen +20 %, Rituale +20 %`; }
    else { fx.offline *= 1.2; fx.lines[4] = 'Sonne und Mond eigenständig: Offline +20 %'; }
  }
  if (a && L >= 6) {
    const pj = a.persJahr;
    const pjFx = { 1: ['cost', 0.92, 'Kosten −8 %'], 2: ['offline', 1.3, 'Offline +30 %'], 3: ['rit', 1.3, 'Rituale +30 %'], 4: ['prod', 1.08, 'Produktion +8 %'], 5: ['tap', 1.25, 'Tippen +25 %'], 6: ['cd', 1.2, 'Kräfte 20 % schneller'], 7: ['prod', 1.1, 'Produktion +10 %'], 8: ['prod', 1.12, 'Produktion +12 %'], 9: ['cost', 0.94, 'Kosten −6 %'] }[pj];
    fx[pjFx[0]] *= pjFx[1];
    fx.lines[5] = `Persönliches Jahr ${pj}: ${pjFx[2]}`;
  }
  if (a && L >= 7) { fx.prod *= 1.15; fx.lines[6] = 'Das Große Werk: Produktion +15 %'; }
  // Himmelslage heute (ab der ersten Ebene): echter Mond und echte Sonne
  fx.sky = null;
  if (a && L >= 1) {
    const h = a.heute, ph = h.phase.name, parts = [];
    if (ph === 'Neumond') { fx.rit *= 1.3; parts.push('Neumond: Rituale +30 %'); }
    else if (ph === 'Vollmond') { fx.tap *= 1.25; parts.push('Vollmond: Tippen +25 %'); }
    else if (['Zunehmende Sichel', 'Erstes Viertel', 'Zunehmender Mond'].includes(ph)) { fx.prod *= 1.05; parts.push(`${ph}: Produktion +5 %`); }
    else { fx.cost *= 0.95; parts.push(`${ph}: Kosten −5 %`); }
    if (h.sun === a.sun) { fx.prod *= 1.1; parts.push('Die Sonne steht in deinem Zeichen: Produktion +10 %'); }
    fx.sky = parts;
  }
  // Dimensionen
  for (let d = 0; d < a2.dim; d++) {
    fx.prod *= 1.25;
    const f = DIMENSIONS[Math.min(d, DIMENSIONS.length - 1)].fx;
    for (const k of Object.keys(f)) { if (k === 'path') fx.path += f[k]; else fx[k] *= f[k]; }
  }
  // Weltereignisse dieses Durchgangs
  for (const [age, key] of Object.entries(a2.events)) { const o = AGE_EVENTS[age][key]; for (const k of Object.keys(o.fx)) fx[k] *= o.fx[k]; }
  // Mentoren
  for (const id of a2.mentors) {
    const au = MENTORS.find((m) => m.id === id).aura, v = 1 + (au.v - 1) * fx.mentor;
    if (au.k === 'path') fx.path += au.v * fx.mentor; else fx[au.k] *= v;
  }
  return fx;
}

// ── Sephiroth ─────────────────────────────────────────────────
const tier = (i) => (i === 10 ? 7.5 : i);
export const genUnlocked = (a2, i) => (i === 10 ? a2.dim >= 1 && a2.age >= 3 : i < Math.min(10, 3 + a2.age));
export const milestoneMult = (n) => SACRED.reduce((m, t) => (n >= t ? m * T2.msMult : m), 1);
export const baseCost = (i) => T2.costBase * Math.pow(T2.costTier, tier(i));
export function genCost(a2, fx, i, n = 1) {
  const g = T2.costGrowth, c0 = baseCost(i) * Math.pow(g, a2.owned[i]) * fx.cost;
  return c0 * (Math.pow(g, n) - 1) / (g - 1);
}
export function maxAffordable(a2, fx, i) {
  const g = T2.costGrowth, c0 = baseCost(i) * Math.pow(g, a2.owned[i]) * fx.cost;
  return Math.max(0, Math.floor(Math.log(a2.wissen * (g - 1) / c0 + 1) / Math.log(g)));
}
export const genProd = (a2, fx, i) => T2.prodBase * Math.pow(T2.prodTier, tier(i)) * a2.owned[i] * milestoneMult(a2.owned[i]) * fx.seph[i];

// Pfade
export function activePaths(a2) {
  return ALL_PATHS.filter((p) => {
    const i = gi(p.a), j = gi(p.b);
    if ((i === 10 || j === 10) && a2.dim < 1) return false;
    return a2.owned[i] >= T2.pathMin && a2.owned[j] >= T2.pathMin;
  });
}
// Schübe gleicher Art stapeln sich nicht: Es zählt der stärkste
export const buffMult = (a2, k) => a2.buffs.reduce((m, b) => (b.k === k ? Math.max(m, b.m) : m), 1);
export function globalMult(a2, fx) {
  return (1 + (T2.pathBonus + fx.path) * activePaths(a2).length) * fx.prod * buffMult(a2, 'prod') * (a2.meta ?? 1);
}
export function prodPerSec(a2, fx) {
  let s = 0;
  for (let i = 0; i < 11; i++) if (a2.owned[i]) s += genProd(a2, fx, i);
  return s * globalMult(a2, fx);
}
export const tapValue = (a2, fx, pps = prodPerSec(a2, fx)) => (1 + pps * T2.tapShare) * fx.tap * buffMult(a2, 'tap');
export const leapCost = (a2) => T2.leapBase * Math.pow(T2.leapTier, a2.age) * (1 + T2.leapRun * (a2.run - 1)) * (1 + 0.8 * a2.dim) * (a2.age === LAST_AGE ? 2 : 1);   // höhere Dimensionen: größere Welten
export const offlineEff = (fx) => 0.6 * fx.offline;
export const ritualLength = (a2) => 3 + Math.floor(a2.age / 2);
export function earn(a2, x) { a2.wissen += x; a2.earned += x; a2.total += x; }

// Weg-Ende (bewahren/offenbaren)
export function endingKey(a2) { return a2.weg >= 2 ? 'bewahrer' : a2.weg <= -2 ? 'offenbarer' : 'mitte'; }

// Sephira-Nummer des Herrschers eines Zeichens (Hilfe für Tests/Anzeige)
export const sephOfSign = sephiraOfSign;
