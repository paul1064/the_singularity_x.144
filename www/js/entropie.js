// ─────────────────────────────────────────────────────────────
//  V6.2 — Die Entropie (rein, in Node testbar)
//  Der Gegenspieler: Sie steigt von selbst, bleicht die Welt aus und frisst Produktion.
//  Ordnung (Tippen, Kaufen, Mutationen, Kräfte, Momente …) drängt sie zurück.
//  Bei 100 % bricht sie durch (Kollaps); vor den großen Evolutionssprüngen wartet je ein Boss.
// ─────────────────────────────────────────────────────────────
export const ENT = {
  fromRun: 3,            // ab dem 4. Durchlauf (Universum 147)
  penaltyStart: 30,      // ab diesem Wert (%) sinkt die Produktion
  penaltyMax: 0.4,       // bei 100 % um 40 %
  offlineShare: 0.2,     // offline wächst sie nur zu einem Fünftel …
  offlineCap: 50,        // … und höchstens bis 50 %
  crackAt: 50,           // ab hier reißen Risse in der Welt auf
  bossBonus: 0.015,      // je besiegtem Boss dauerhaft +1,5 % Produktion …
  bossBonusMax: 20,      // … bis 20 Siege
};
export const entActive = (S) => S.akt !== 2 && S.runsDone >= ENT.fromRun && !S.finished;
// Anstieg in Prozentpunkten pro Sekunde: später (Epoche) und in älteren Universen schneller; jeder offene Riss gibt Zusatz
export const entRate = (S, cracks = 0) => (0.05 + 0.02 * S.epoch) * (1 + 0.05 * Math.min(10, Math.max(0, S.runsDone - ENT.fromRun))) + cracks * 0.05;
export const entMult = (S) => 1 - ENT.penaltyMax * Math.max(0, ((S.entropy || 0) - ENT.penaltyStart) / (100 - ENT.penaltyStart));
export const bossBonus = (S) => 1 + ENT.bossBonus * Math.min(ENT.bossBonusMax, S.bossWins || 0);
export const entStage = (e) => (e < 25 ? 0 : e < 50 ? 1 : e < 75 ? 2 : 3);
export const STAGE_NAME = ['ruhig', 'Verblassen', 'Risse', 'Verfall'];

// Erleichterung in Prozentpunkten
export const RELIEF = { tap: 0.04, buy: 0.3, mutation: 5, glitch: 3, power: 8, moment: 10, cosmos: 10, cosmosNutzen: 3, crack: 6, relic: 4, leap: 15 };
export function relief(S, kind, n = 1) { S.entropy = Math.max(0, (S.entropy || 0) - (RELIEF[kind] || 0) * n); return S.entropy; }
export function tick(S, dt, cracks = 0) { S.entropy = Math.min(100, (S.entropy || 0) + entRate(S, cracks) * dt); return S.entropy; }
export function offline(S, secs) {
  const add = entRate(S) * secs * ENT.offlineShare, cur = S.entropy || 0;
  S.entropy = Math.max(cur, Math.min(ENT.offlineCap, cur + add));
  return S.entropy;
}

export const STAGE_LINES = [
  null,
  ['Die Ränder werden dünner.', 'Etwas ordnet sich nicht mehr von selbst.'],
  ['Es reißt. Dort, wo nichts war, öffnet sich etwas.', 'Versiegle die Risse, bevor sie wachsen.'],
  ['Alles will auseinanderfallen.', 'Halte fest. Halte fest.'],
];

// ── Bosse ─────────────────────────────────────────────────────
// hp: Schaden bis zum Sieg (Tippen = 1, Schwachpunkt = 10), dur: Sekunden, weakEvery: Takt der Schwachpunkte
export const BOSSES = {
  2: { id: 'zerfall', name: 'Der Zerfall', color: '#8f6bff', hp: 90, dur: 22, weakEvery: 1.6,
    intro: 'Das Meer wird still. Etwas löst die Ordnung auf, Molekül für Molekül.',
    win: 'Der Zerfall wich zurück. Die Ordnung hielt.', lose: 'Der Zerfall nahm sich, was er brauchte.' },
  4: { id: 'stille', name: 'Die Große Stille', color: '#5aa8ff', hp: 130, dur: 22, weakEvery: 1.45,
    intro: 'Das Leben ruft, und niemand antwortet. Die Stille kriecht über das Land.',
    win: 'Ein Ruf zerriss die Stille. Das Land antwortete.', lose: 'Die Stille legte sich auf alles, und wurde schwer.' },
  6: { id: 'winter', name: 'Der Letzte Winter', color: '#bfe9ff', hp: 170, dur: 24, weakEvery: 1.3,
    intro: 'Die Wärme der Welt wird abgesaugt. Jeder Gedanke friert ein.',
    win: 'Der Winter brach. Aus dem Eis stieg Licht auf.', lose: 'Der Winter zog sich zurück, aber seine Kälte blieb.' },
  7: { id: 'entropie', name: 'Die Entropie', color: '#ff4d8d', hp: 200, dur: 26, weakEvery: 1.15,
    intro: 'Sie hat auf diesen Moment gewartet. Seit dem ersten Universum. Sie will, dass du vergisst.',
    win: 'Du hast der Entropie ins Gesicht gesehen. Sie blinzelte zuerst.', lose: 'Die Entropie lächelte. Sie hat Geduld.' },
  kollaps: { id: 'kollaps', name: 'Der Kollaps', color: '#ff6b3d', hp: 150, dur: 22, weakEvery: 1.35,
    intro: 'Die Ordnung reißt auf. Alles, was du gebaut hast, beginnt zu fallen.',
    win: 'Du hast es zusammengehalten, mit bloßen Händen.', lose: 'Ein Teil des Erreichten zerfiel zu Staub.' },
};
export const BOSS_EPOCHS = [2, 4, 6, 7];
export const BOSS_DMG = { tap: 1, weak: 10 };
export const BOSS_HEAL = 6;                    // verpasster Schwachpunkt heilt den Boss
// Je höher die Entropie beim Kampfbeginn, desto zäher der Boss (bis +50 %)
export const bossHP = (def, entropy) => Math.round(def.hp * (1 + Math.min(100, entropy || 0) / 200));
export const needsBoss = (S, from) => entActive(S) && BOSSES[from] !== undefined && BOSS_EPOCHS.includes(from) && !(S.bossDone || []).includes(from);

// Ausgang eines Kampfes (rein): neue Entropie, Verlust, Belohnung
export function bossResult(S, key, win, pps) {
  const isCollapse = key === 'kollaps';
  if (win) return { entropy: 8, loss: 0, gain: pps * 120, buff: { k: 'prod', m: 2, dur: 60, n: 'Triumph über die Entropie' }, wins: 1, acts: 2 };
  return { entropy: isCollapse ? 60 : Math.min(100, (S.entropy || 0) + 25), loss: isCollapse ? 0.2 : 0, gain: 0, buff: null, wins: 0, acts: 0 };
}

export const INTRO = {
  title: 'Etwas hat dich bemerkt',
  text: 'Seit dem ersten Universum frisst etwas an den Rändern der Dinge. Du hast es nie gesehen, weil deine Vorgänger schneller waren als sein Hunger. Jetzt holt es auf.\n\nSie hat keinen Namen, nur einen Zug: Alles soll sich gleich machen, still werden, vergessen. Die Alten nannten sie die Entropie.',
  how: 'Sie steigt von selbst und bleicht die Welt aus. Ordnung drängt sie zurück: Tippen, Kaufen, Mutationen, Kräfte, Momente. Ab 50 % reißen Risse auf, die du antippen kannst. Vor den großen Evolutionssprüngen stellt sie sich dir. Bei 100 % bricht sie durch.',
};
