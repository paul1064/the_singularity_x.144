// ─────────────────────────────────────────────────────────────
//  Ökonomie — reine Funktionen (auch in Node testbar)
// ─────────────────────────────────────────────────────────────
import { GENERATORS, MILESTONES, EPOCHS } from './data.js';

export const TUNING = {
  costBase: 12,
  costTier: 5.6,      // Kostenfaktor pro Generator-Stufe
  costGrowth: 1.14,   // Preisanstieg pro gekauftem Stück
  prodBase: 0.35,
  prodTier: 5.0,      // Ertragsfaktor pro Stufe
  leapFactor: 30,     // Sprungkosten = Faktor × Grundpreis des 3. Generators der Epoche
  tapShare: 0.06,     // Anteil der Produktion/s, den ein Tipp zusätzlich bringt
  offlineHours: 8,
  resGain: 0.06,      // Resonanz-Zuwachs pro Tipp (0–1)
  resDecay: 0.3,      // Resonanz-Verfall pro Sekunde
};

export function newState() {
  return {
    v: 1,
    universe: 144,
    runsDone: 0,
    complexity: 0,
    runEarned: 0,
    lifetime: 0,
    owned: new Array(GENERATORS.length).fill(0),
    epoch: 0,               // höchste freigeschaltete Epoche (0–7)
    finished: false,        // Singularität erreicht, Gedanke steht aus
    choices: {},            // eventId -> 'a'|'b'
    pendingEvent: null,
    fragments: [],          // Indizes gefundener Fragmente
    constants: { g: 0, s: 0, em: 0, c: 0, x: 0 },
    intent: null,
    timeline: [],
    voiceEntered: [],
    taps: 0,
    playTime: 0,
    lastSeen: Date.now(),
    settings: { music: true, sfx: true, vibrate: true },
    introSeen: false,
    traits: [],             // V2: gewählte Merkmale (pro Durchlauf)
    pendingTrait: null,     // V2: angebotene, noch nicht gewählte Merkmale
    buffs: [],              // V2: aktive Mutations-Effekte {k, m, t}
  };
}

export const epochOf = (i) => Math.floor(i / 3);

export function baseCost(i) {
  return TUNING.costBase * Math.pow(TUNING.costTier, i);
}

export const hasTrait = (state, id) => state.traits.includes(id);
export const buffMult = (state, k) => state.buffs.reduce((m, b) => (b.k === k ? m * b.m : m), 1);

export function costMult(state, i) {
  const e = epochOf(i);
  let m = 1;
  if (hasTrait(state, 'sparsam')) m *= 0.85;
  if (state.choices.oxygen === 'b' && (e === 2 || e === 3)) m *= 0.8;
  return m;
}

export function genCost(state, i, n = 1) {
  const g = TUNING.costGrowth;
  const c0 = baseCost(i) * Math.pow(g, state.owned[i]) * costMult(state, i);
  return c0 * (Math.pow(g, n) - 1) / (g - 1);
}

export function maxAffordable(state, i) {
  const g = TUNING.costGrowth;
  const c0 = baseCost(i) * Math.pow(g, state.owned[i]) * costMult(state, i);
  const n = Math.floor(Math.log(state.complexity * (g - 1) / c0 + 1) / Math.log(g));
  return Math.max(0, n);
}

export function leapCost(state, e) {
  let c = TUNING.leapFactor * baseCost(e * 3 + 2);
  if (e === 7) c *= 3;
  if (e === 7 && state.choices.button === 'b') c *= 0.7;
  if (hasTrait(state, 'erbe')) c *= 0.8;
  return c;
}

export function milestoneMult(owned) {
  let m = 1;
  for (const t of MILESTONES) if (owned >= t) m *= 2;
  return m;
}

// Multiplikator einer Epoche aus Entscheidungen, Konstanten & Durchläufen
export function epochMult(state, e) {
  let m = 1;
  const ch = state.choices;
  if (ch.oxygen === 'a' && e >= 2) m *= 1.5;
  if (ch.asteroid === 'a' && e >= 4) m *= 2;
  if (ch.asteroid === 'b' && (e === 3 || e === 4)) m *= 1.6;
  if (ch.volcano === 'b' && (e === 4 || e === 5)) m *= 1.5;
  if (ch.button === 'a' && e >= 6) m *= 1.5;
  if (hasTrait(state, 'wuchern')) m *= 1.25;
  if (hasTrait(state, 'schwarm')) m *= 0.9;
  if (hasTrait(state, 'vorhut') && e === state.epoch) m *= 2;
  const k = state.constants;
  if (e <= 1) m *= 1 + 0.15 * k.g;
  if (e >= 2 && e <= 4) m *= 1 + 0.12 * k.em;
  if (e >= 5) m *= 1 + 0.12 * k.c;
  return m;
}

export function globalMult(state) {
  return (1 + 0.05 * state.constants.x) * (1 + 0.15 * state.runsDone);
}

export function genProd(state, i) {
  const base = TUNING.prodBase * Math.pow(TUNING.prodTier, i);
  return base * state.owned[i] * milestoneMult(state.owned[i]) * epochMult(state, epochOf(i)) * globalMult(state);
}

export function prodPerSec(state) {
  let s = 0;
  for (let i = 0; i < GENERATORS.length; i++) if (state.owned[i]) s += genProd(state, i);
  return s * buffMult(state, 'prod');
}

export function tapMult(state) {
  let m = 1 + 0.3 * state.constants.s;
  if (state.choices.volcano === 'a') m *= 3;
  if (state.intent === 'wille') m *= 2;
  if (hasTrait(state, 'schwarm')) m *= 2;
  if (hasTrait(state, 'traeumer')) m *= 0.8;
  return m * buffMult(state, 'tap');
}

// Resonanz: schnelles Tippen (vor allem mit mehreren Fingern) lädt einen Tipp-Multiplikator auf
export const resonanceMax = (state) => (hasTrait(state, 'gleichklang') ? 3 : 2);
export const resonanceGain = (state) => TUNING.resGain * (hasTrait(state, 'gleichklang') ? 2 : 1);
export const resonanceMult = (state, res) => 1 + (resonanceMax(state) - 1) * res;

export function tapValue(state, pps = prodPerSec(state), res = 0) {
  return (1 + pps * TUNING.tapShare) * tapMult(state) * globalMult(state) * resonanceMult(state, res);
}

// Mutationen: Häufigkeit, Lebensdauer, Stärke
export const mutationInterval = (state) => (40 + Math.random() * 40) / (hasTrait(state, 'mutant') ? 2 : 1);
export const mutationLife = (state) => 9 * (hasTrait(state, 'mutant') ? 1.5 : 1);
export const mutationPower = (state, m) => (hasTrait(state, 'glueck') ? 1 + (m - 1) * 1.5 : m);
export const offlineEfficiency = (state) => 0.6 * (hasTrait(state, 'traeumer') ? 1.6 : 1);

export function earn(state, amount) {
  state.complexity += amount;
  state.runEarned += amount;
  state.lifetime += amount;
}

export function catastropheLoss(state, frac) {
  let f = state.intent === 'harmonie' ? frac / 2 : frac;
  if (hasTrait(state, 'zaeh')) f /= 2;
  state.complexity *= (1 - f);
}

export function offlineCapSec(state) {
  return (TUNING.offlineHours + state.constants.x) * 3600;
}

// Gedankenkraft = Prestige-Punkte für den nächsten Urknall
export function thoughtPower(state) {
  const size = Math.floor(Math.log10(Math.max(10, state.runEarned)) / 6);
  const choices = Math.floor(Object.keys(state.choices).length / 2);
  return 3 + size + Math.floor(state.fragments.length / 3) + choices + state.runsDone;
}

export function stability(constants) {
  const v = Object.values(constants);
  const spread = Math.max(...v) - Math.min(...v);
  return Math.max(0, 100 - spread * 14);
}
export const STABILITY_MIN = 40;

export const epochCount = () => EPOCHS.length;
