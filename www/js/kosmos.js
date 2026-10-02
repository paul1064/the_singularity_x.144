// ─────────────────────────────────────────────────────────────
//  V6.1 — Epische Momente (rein, in Node testbar)
//  1) Rückblick-Film: vor jedem Urknall läuft das Universum als Zeitraffer ab
//  2) Kosmische Ereignisse: Komet, Sonnensturm, Supernova als Entscheidung in Echtzeit
//  3) Haptik: Vibrationsmuster je Epoche
// ─────────────────────────────────────────────────────────────
import { EPOCHS, LEAPS, AVATARS, ENDINGS, LAWS } from './data.js';

// ── 3) Haptik ─────────────────────────────────────────────────
// Tippen wird mit jeder Epoche „schwerer": winziges Ticken in der Ursuppe, dumpfer Schlag in der Singularität
export const tapHaptik = (e) => 4 + e * 2;
// Evolutionssprung: Crescendo, je später die Epoche, desto mehr und stärkere Impulse
export function leapHaptik(e) {
  const p = [];
  for (let i = 0; i <= Math.min(e, 6); i++) { p.push(14 + i * 9, 36); }
  p.push(60 + e * 14);
  return p;
}
export const leapShake = (e) => 0.5 + e * 0.12;

// ── 2) Kosmische Ereignisse ───────────────────────────────────
// Eine Entscheidung in 12 Sekunden. Abwehren = sicher, Umlenken = riskant aber groß, Nutzen = Energie anzapfen.
export const COSMOS = [
  { id: 'komet', minEpoch: 1, color: '#9fd4ff', title: 'Ein Komet kommt näher',
    text: 'Ein Eisbrocken zieht seine Bahn durch den Himmel. Er trägt Wasser und vielleicht mehr.',
    abwehren: 'Der Komet zerbirst hoch oben. Ein Funkenregen fällt.', umlenken: 'Du hast seine Bahn gebogen. Er streift die Welt und lässt Schätze zurück.',
    umlenkenMiss: 'Der Komet traf die Küste. Ein Teil des Erreichten ging verloren.', nutzen: 'Der Komet bringt seine Fracht: Die Welt wird fruchtbarer.' },
  { id: 'sturm', minEpoch: 3, color: '#ffb347', title: 'Ein Sonnensturm rollt heran',
    text: 'Die Sonne wirft einen Feuerschleier ins All. Er knistert am Rand der Welt.',
    abwehren: 'Das Magnetfeld hielt. Der Sturm malte nur Lichter an den Himmel.', umlenken: 'Du hast den Sturm um die Welt geleitet. Seine Kraft blieb im Gefüge hängen.',
    umlenkenMiss: 'Der Sturm riss Lücken ins Gefüge. Ein Teil des Erreichten ging verloren.', nutzen: 'Du hast die Ladung des Sturms getrunken: alles in der Welt vibriert.' },
  { id: 'nova', minEpoch: 5, color: '#ff6b81', title: 'Ein Stern in der Nähe stirbt',
    text: 'Ein ferner Stern bläht sich auf. In Sekunden wird er die Nacht zerreißen.',
    abwehren: 'Die Welle ging vorbei. Was zurückblieb, war Staub und Sternenlicht.', umlenken: 'Du hast die Druckwelle abgelenkt und ihre Energie eingefangen.',
    umlenkenMiss: 'Die Druckwelle traf unvermittelt. Ein Teil des Erreichten ging verloren.', nutzen: 'Das Licht des sterbenden Sterns füllt dich mit Kraft.' },
];
export const COSMOS_DUR = 12;
export const COSMOS_FIRST = [150, 240];       // Sekunden bis zum ersten Ereignis
export const COSMOS_EVERY = [300, 480];       // danach
export const cosmosWait = (first, rnd = Math.random) => { const [a, b] = first ? COSMOS_FIRST : COSMOS_EVERY; return a + rnd() * (b - a); };
export function pickCosmos(epoch, last, rnd = Math.random) {
  const ok = COSMOS.filter((c) => c.minEpoch <= epoch && c.id !== last);
  return ok.length ? ok[Math.floor(rnd() * ok.length)] : null;
}
// Ergebnis einer Entscheidung. choice: abwehren | umlenken | nutzen | null (verstrichen)
// pps = Produktion pro Sekunde, tapV = Tippwert, komplex = aktuelle Komplexität
export const UMLENKEN_CHANCE = 0.6;
export function cosmosOutcome(def, choice, pps, tapV, komplex, rnd = Math.random, bonus = 0) {
  if (choice === 'abwehren') return { win: true, act: 'kraft', gain: pps * 60 + tapV * 15, text: def.abwehren, buff: null };
  if (choice === 'umlenken') {
    if (rnd() < UMLENKEN_CHANCE + bonus) return { win: true, act: 'kraft', gain: pps * 240 + tapV * 40, text: def.umlenken, buff: { k: 'prod', m: 2, dur: 45, n: 'Kosmischer Rückenwind' } };
    return { win: false, act: 'kraft', gain: -komplex * 0.06, text: def.umlenkenMiss, buff: null };
  }
  if (choice === 'nutzen') return { win: true, act: 'mutation', gain: pps * 90, text: def.nutzen, buff: { k: 'tap', m: 3, dur: 40, n: 'Kosmische Ladung' } };
  return { win: false, act: null, gain: 0, text: 'Das Ereignis zog vorbei, und niemand griff ein.', buff: null };
}

// ── 1) Rückblick-Film ─────────────────────────────────────────
// Baut aus dem Spielstand des endenden Universums die Szenen des Films.
export function buildFilm(S) {
  const sc = [];
  sc.push({ kind: 'start', color: '#ffffff', title: `Universum ${S.universe}`, lines: [S.runsDone > 0 ? 'Noch einmal alles, von Anfang an.' : 'Alles, was du geworden bist.'] });
  const top = Math.min(7, S.finished ? 7 : S.epoch);
  const avatarIds = new Set(S.avatars || []);
  for (let e = 0; e <= top; e++) {
    const lines = [];
    if (e > 0) lines.push(`${LEAPS[e - 1]}`);
    else lines.push('Es begann mit einem Funken');
    const av = AVATARS[e] && AVATARS[e].options.find((o) => avatarIds.has(o.id));
    if (av) lines.push(`${av.name} erwachte`);
    const my = (S.myths || []).find((m) => m.e === e);
    if (my) lines.push(`Ein Mythos entstand: ${my.name}`);
    sc.push({ kind: 'epoche', e, color: EPOCHS[e].color, title: EPOCHS[e].name, sub: EPOCHS[e].scale, lines });
  }
  const end = S.ending && ENDINGS[S.ending], law = LAWS.find((l) => l.id === S.law);
  const min = Math.max(1, Math.round((S.playTime || 0) / 60));
  const fin = [`${S.taps || 0} Berührungen · ${min} Minuten`];
  if (law && S.runsDone > 0) fin.unshift(`Unter dem Gesetz: ${law.name}`);
  if (end) fin.unshift(end.name);
  sc.push({ kind: 'ende', color: '#fff3b0', title: 'Und dann dachte jemand', lines: [...fin, 'einen neuen Anfang.'] });
  return sc;
}
export const FILM_MS = 1900;          // Dauer je Epochen-Szene
