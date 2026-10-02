// ─────────────────────────────────────────────────────────────
//  V6.4 — Das Museum der Universen (rein, in Node testbar)
//  Alles, was du je gefunden hast, steht in Vitrinen. Die meisten Funde leiten sich aus bestehenden
//  Spielständen ab (Fragmente, Briefe, Enden …), neue werden in S.museum.ids vermerkt.
//  Jede Vitrine gibt bei 50 % und bei 100 % einen dauerhaften Bonus.
// ─────────────────────────────────────────────────────────────
import { FRAGMENTS, LETTERS, AVATAR_OPTS, RELIC_TEXT, ENDINGS, MYTHS, LAWS, MOMENTS, MUTATIONS } from './data.js';

const LAW_LORE = {
  schwer: 'In manchen Universen ist alles schwerer: der Boden, die Zeit, die Entscheidungen. Dort wächst, was nicht zerbricht.',
  nebel: 'Ein Universum, das sich nicht in die Karten schauen lässt. Zufälle sind selten, aber sie wiegen mehr.',
  wasser: 'Alles beginnt im Wasser und bleibt dort länger, als es müsste.',
  stille: 'Ein Universum, das den Atem anhält. Vieles geschieht leiser.',
  eile: 'Hier hat es alles eilig. Wer schnell ist, kommt weit; wer verweilt, ist zu spät.',
  chaos: 'Ordnung ist eine Ausnahme. Das Chaos schreibt seine Regeln jedes Mal neu.',
  fuelle: 'Alles ist im Überfluss da, auch das, was man nicht braucht.',
  technik: 'Kalt und klar rechnet dieses Universum. Es hat kein Herz, aber Präzision.',
};
const MUT_LORE = {
  schub: 'Ein Funke, der die Welt für einen Atemzug schneller macht.',
  raserei: 'Die Finger wissen es vor dem Kopf: jetzt, jetzt, jetzt.',
  ernte: 'Was gewachsen ist, wird auf einmal reif.',
};
// Himmel und Gegner (inline, damit das Modul keine Abhängigkeit auf Spiellogik hat)
const HIMMEL = [
  ['cos:komet', 'Der Komet', 'Ein Eisbrocken zog seine Bahn durch den Himmel. Du hast entschieden, was er der Welt bringt.', 'Erlebe ein kosmisches Ereignis.'],
  ['cos:sturm', 'Der Sonnensturm', 'Ein Feuerschleier rollte heran und knisterte am Rand der Welt. Du hast ihn gesehen.', 'Erlebe ein kosmisches Ereignis.'],
  ['cos:nova', 'Der sterbende Stern', 'Ein ferner Stern blähte sich auf. Die Nacht zerriss, und du warst da.', 'Erlebe ein kosmisches Ereignis.'],
  ['boss:zerfall', 'Der Zerfall besiegt', 'Der Zerfall wich zurück. Die Ordnung hielt.', 'Besiege den Boss vor dem Sprung aus Epoche 2.'],
  ['boss:stille', 'Die Große Stille besiegt', 'Ein Ruf zerriss die Stille. Das Land antwortete.', 'Besiege den Boss vor dem Sprung aus Epoche 4.'],
  ['boss:winter', 'Der Letzte Winter besiegt', 'Der Winter brach. Aus dem Eis stieg Licht auf.', 'Besiege den Boss vor dem Sprung aus Epoche 6.'],
  ['boss:entropie', 'Die Entropie besiegt', 'Du hast der Entropie ins Gesicht gesehen. Sie blinzelte zuerst.', 'Besiege den Boss vor der Singularität.'],
  ['boss:kollaps', 'Den Kollaps überstanden', 'Du hast es zusammengehalten, mit bloßen Händen.', 'Besiege den Kollaps bei 100 % Entropie.'],
];

export const COLORS = { frag: '#7cf29c', brief: '#ffd166', relikt: '#ffb347', ende: '#fff3b0', gott: '#c77dff', gesetz: '#5ee7df', himmel: '#ff6b81', moment: '#4aa8ff' };

// Vitrinen und Funde. found(S) entscheidet über „entdeckt".
export function vitrinen() {
  const has = (S, id) => !!(S.museum && S.museum.ids && S.museum.ids[id]);
  const gods = (S) => new Set([...(S.pantheon || []).map((g) => g.name), ...(S.myths || []).map((m) => m.name)]);
  return [
    { id: 'frag', name: 'Splitter von x.144', sub: 'Fragmente, die zwischen den Universen glitzern', color: COLORS.frag,
      bonus: [['Tippen +10 %', { tap: 1.1 }], ['Tippen +10 % mehr', { tap: 1.1 }]],
      items: FRAGMENTS.map((t, i) => ({ id: 'frag:' + i, name: `Splitter ${i + 1}`, text: t, hint: 'Berühre ein Glitzern in der Welt.', found: (S) => (S.fragments || []).includes(i) })) },
    { id: 'brief', name: 'Briefe der Vorgänger', sub: 'Zehn Stimmen aus 143 Universen', color: COLORS.brief,
      bonus: [['Offline-Ertrag +15 %', { offline: 1.15 }], ['Entropie 10 % langsamer, Offline +15 %', { offline: 1.15, entRate: 0.9 }]],
      items: LETTERS.map((l, i) => ({ id: 'brief:' + i, name: l.title, text: l.text, hint: 'Ein Brief kommt in Landgang oder in der Technosphäre.', found: (S) => i < (S.letters || 0) })) },
    { id: 'relikt', name: 'Relikte', sub: 'Die Gestalten, die du erweckt hast', color: COLORS.relikt,
      bonus: [['Produktion +5 %', { prod: 1.05 }], ['Produktion +10 % mehr', { prod: 1.1 }]],
      items: Object.values(AVATAR_OPTS).map((o) => ({ id: 'relikt:' + o.id, name: o.name, text: `${RELIC_TEXT[o.epoch]}\n${o.sub}`, hint: `Wähle diesen Weg als Avatar (Epoche ${o.epoch + 1}).`, found: (S) => (S.avatars || []).includes(o.id) || (S.legacy || []).some((l) => l.id === o.id) })) },
    { id: 'ende', name: 'Enden', sub: 'Wie ein Universum enden kann', color: COLORS.ende,
      bonus: [['Erträge +15 %', { gain: 1.15 }], ['Erträge +20 % mehr', { gain: 1.2 }]],
      items: Object.entries(ENDINGS).map(([id, e]) => ({ id: 'ende:' + id, name: e.name, text: e.text, hint: 'Erreiche dieses Ende. Es hängt von deinen Antworten und Eingriffen ab.', found: (S) => (S.endings || []).includes(id) })) },
    { id: 'gott', name: 'Götter und Mythen', sub: 'Was die Geschöpfe über dich erzählen', color: COLORS.gott,
      bonus: [['Produktion +5 %', { prod: 1.05 }], ['Sprungkosten −5 %', { leap: 0.95 }]],
      items: Object.entries(MYTHS).flatMap(([e, m]) => Object.entries(m).map(([k, g]) => ({ id: `gott:${e}:${k}`, name: g.name, text: g.text, hint: `Entsteht in Epoche ${+e + 1}, wenn du so eingreifst: ${k === 'kraft' ? 'mit Kräften' : k === 'funke' ? 'mit Mutationen und Momenten' : 'kaum'}.`, found: (S) => gods(S).has(g.name) }))) },
    { id: 'gesetz', name: 'Kosmische Gesetze', sub: 'Die Regeln, unter denen Universen laufen', color: COLORS.gesetz,
      bonus: [['Mutationen 10 % häufiger', { mut: 1.1 }], ['Mutationen 15 % häufiger', { mut: 1.15 }]],
      items: LAWS.map((l) => ({ id: 'law:' + l.id, name: l.name, text: `${LAW_LORE[l.id]}\n${l.text}`, hint: 'Ein Universum ab dem zweiten Durchlauf trägt zufällig eines dieser Gesetze.', found: (S) => has(S, 'law:' + l.id) || S.law === l.id })) },
    { id: 'himmel', name: 'Himmel und Gegner', sub: 'Ereignisse und Bosse', color: COLORS.himmel,
      bonus: [['Entropie-Strafe −10 %', { penalty: 0.9 }], ['Bosse 10 % schwächer, Schwachpunkte +0,3 s', { bossHp: 0.9, weakLife: 0.3 }]],
      items: HIMMEL.map(([id, name, text, hint]) => ({ id, name, text, hint, found: (S) => has(S, id) })) },
    { id: 'moment', name: 'Momente und Mutationen', sub: 'Kurze Augenblicke, die alles verändern', color: COLORS.moment,
      bonus: [['Erträge +10 %', { gain: 1.1 }], ['Umlenken +10 % Chance, Tippen +10 %', { umlenken: 0.1, tap: 1.1 }]],
      items: [...Object.entries(MOMENTS).map(([e, m]) => ({ id: 'mom:' + e, name: m.title, text: `${m.text}\n${m.win}`, hint: `Gewinne den Moment beim Eintritt in Epoche ${+e + 1}.`, found: (S) => has(S, 'mom:' + e) })),
        ...MUTATIONS.map((m) => ({ id: 'mut:' + m.id, name: m.name, text: `${MUT_LORE[m.id]}\n${m.text}`, hint: 'Sammle den leuchtenden Helix-Glimmer.', found: (S) => has(S, 'mut:' + m.id) }))] },
  ];
}
let VIT = null;
export const all = () => VIT || (VIT = vitrinen());

export function fund(S, id) {
  S.museum = S.museum || { ids: {}, seen: [] };
  if (S.museum.ids[id]) return false;
  S.museum.ids[id] = S.universe || 1;
  return true;
}
export function progress(S) {
  return all().map((v) => { const f = v.items.filter((i) => i.found(S)).length; return { id: v.id, found: f, total: v.items.length, half: f * 2 >= v.items.length, full: f >= v.items.length }; });
}
export const totals = (S) => progress(S).reduce((a, p) => ({ found: a.found + p.found, total: a.total + p.total }), { found: 0, total: 0 });

// Dauerhafte Boni: je Vitrine bei 50 % Stufe 1, bei 100 % zusätzlich Stufe 2 (alles multiplikativ, weakLife/umlenken additiv)
let sig = null, sigFx = null;
function signature(S) {
  const m = S.museum && S.museum.ids ? Object.keys(S.museum.ids).length : 0;
  return [(S.fragments || []).length, S.letters || 0, (S.endings || []).length, (S.pantheon || []).length, (S.myths || []).length, (S.legacy || []).length, (S.avatars || []).join('.'), S.law || '', m].join('|');
}
export function museumFx(S) {
  const k = signature(S);
  if (k === sig) return sigFx;
  const out = [];
  progress(S).forEach((p, i) => { const v = all()[i]; if (p.half) out.push(v.bonus[0][1]); if (p.full) out.push(v.bonus[1][1]); });
  sig = k; sigFx = out; return out;
}
export const museumKey = (S) => signature(S) + '#' + museumFx(S).length;

// Schwellen, die neu erreicht wurden und noch nicht gemeldet sind: [{key, v, level, text}]
export function newThresholds(S) {
  const seen = new Set((S.museum && S.museum.seen) || []), L = [];
  progress(S).forEach((p, i) => {
    const v = all()[i];
    if (p.half && !seen.has(v.id + ':1')) L.push({ key: v.id + ':1', v, level: 1, text: v.bonus[0][0] });
    if (p.full && !seen.has(v.id + ':2')) L.push({ key: v.id + ':2', v, level: 2, text: v.bonus[1][0] });
  });
  return L;
}
export function markSeen(S, list) { S.museum = S.museum || { ids: {}, seen: [] }; for (const t of list) if (!S.museum.seen.includes(t.key)) S.museum.seen.push(t.key); }
