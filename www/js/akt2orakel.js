// ─────────────────────────────────────────────────────────────
//  Akt II — Tagesorakel und Himmelskalender (rein, in Node testbar)
//  Das Orakel zieht täglich einen der 22 Pfade, persönlich aus Datum und deinen Daten abgeleitet.
//  Es sagt nichts voraus: Es stellt eine Frage. Der Kalender zeigt echte Himmelsereignisse.
// ─────────────────────────────────────────────────────────────
import { PATHS } from './akt2data.js';
import { SIGNS } from './mystik.js';

export const ORAKEL_FRAGE = [
  'Wozu wärst du heute bereit, wenn du nichts beweisen müsstest?',
  'Welche Absicht möchtest du heute in eine Handlung verwandeln?',
  'Was weißt du längst, ohne es auszusprechen?',
  'Was darf heute in dir wachsen?',
  'Wo würde dir ein klarer Rahmen helfen?',
  'Von wem möchtest du lernen, und wem etwas weitergeben?',
  'Welche Entscheidung folgt deinem Herzen und nicht deiner Gewohnheit?',
  'Wohin willst du dich heute mit Disziplin lenken?',
  'Wo reicht Sanftheit weiter als Druck?',
  'Was braucht heute einen Moment der Stille?',
  'Was verändert sich gerade, und worauf hast du Einfluss?',
  'Welche Tat möchtest du ehrlich abwägen?',
  'Was siehst du anders, wenn du es von der anderen Seite betrachtest?',
  'Was darf enden, damit Platz entsteht?',
  'Wo kannst du heute Maß halten?',
  'Welche Gewohnheit hält dich fester, als sie nützt?',
  'Was wackelt, weil es nie stabil war?',
  'Worauf hoffst du, und was ist ein kleiner Schritt dorthin?',
  'Welche Stimmung begleitet dich, ohne dass du sie benannt hast?',
  'Was gelingt dir leicht? Zeig es heute.',
  'Wozu ruft dich etwas, das du bisher überhört hast?',
  'Was ist vollendet? Was darfst du feiern?',
];
export const PHASE_TIPP = {
  'Neumond': 'Ein guter Tag, etwas Neues leise zu beginnen.',
  'Zunehmende Sichel': 'Die ersten Schritte tragen. Bleib dran.',
  'Erstes Viertel': 'Zeit, zu entscheiden und Hindernisse beiseitezuräumen.',
  'Zunehmender Mond': 'Verfeinern, nachbessern, vollenden.',
  'Vollmond': 'Alles liegt offen. Sieh hin, was jetzt klar wird.',
  'Abnehmender Mond': 'Teile, was du hast, und gib weiter.',
  'Letztes Viertel': 'Prüfe, was bleiben soll, und lass los, was nicht mehr passt.',
  'Abnehmende Sichel': 'Ruhe, Rückschau, Abschluss.',
};

// Feste: Bedeutung und Spielwirkung am echten Tag des Ereignisses
export const FEST_INFO = {
  sonnenfest: { text: 'Der Wendepunkt des Sonnenjahres. Der Orden feiert seit Atlantis.', fx: { prod: 1.3 }, effekt: 'Produktion ×1,3' },
  halbfest:   { text: 'Mitte zwischen zwei Sonnenfesten: das Jahr atmet.', fx: { prod: 1.15, cost: 0.95 }, effekt: 'Produktion ×1,15, Kosten −5 %' },
  neumond:    { text: 'Der Mond verbirgt sich. Alles beginnt im Dunkel.', fx: { rit: 1.5 }, effekt: 'Rituale wirken ×1,5' },
  vollmond:   { text: 'Der Mond steht dem Licht gegenüber. Alles zeigt sich.', fx: { tap: 1.5 }, effekt: 'Tippen ×1,5' },
  wiederkehr: { text: 'Die Sonne steht wieder dort, wo sie bei deiner Geburt stand. Ein persönliches Neujahr.', fx: { prod: 1.5 }, effekt: 'Produktion ×1,5' },
};
// Aus den heutigen Ereignissen die Multiplikatoren zusammenfassen
export function festFx(events) {
  const fx = { prod: 1, tap: 1, cost: 1, rit: 1 }, lines = [];
  for (const e of events.filter((x) => x.heute)) {
    const info = FEST_INFO[e.typ];
    for (const k of Object.keys(info.fx)) fx[k] *= info.fx[k];
    lines.push(`${e.name}: ${info.effekt}`);
  }
  return { fx, lines };
}

// ── Tageskarte ────────────────────────────────────────────────
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function fnv(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
// Persönliche, aber stabile Karte für diesen Tag (gleicher Tag und gleiche Daten ergeben dieselbe Karte)
export function tageskarte(prof, key = dayKey()) {
  return fnv(`${key}|${(prof.name || '').toLowerCase()}|${prof.y}-${prof.m}-${prof.d}`) % PATHS.length;
}
export function orakelLesung(idx, ana) {
  const p = PATHS[idx], h = ana ? ana.heute : null;
  const phase = h ? h.phase.name : null;
  const lines = [];
  if (h) lines.push(`${phase}, Sonne in ${SIGNS[h.sun]}, Mond in ${SIGNS[h.moon]}. ${PHASE_TIPP[phase]}`);
  const fest = ana ? ana.kalender.filter((e) => e.heute) : [];
  for (const e of fest) lines.push(`Heute: ${e.name}. ${FEST_INFO[e.typ].text}`);
  return { titel: `${p.letter} · ${p.card}`, text: p.text, frage: ORAKEL_FRAGE[idx], himmel: lines };
}
