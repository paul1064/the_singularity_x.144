import * as M from '../www/js/museum.js';
import * as R from '../www/js/erbe.js';
import * as E from '../www/js/economy.js';
let fails = 0; const ok = (n, c, i = '') => { console.log((c ? 'OK   ' : 'FAIL ') + n + (i ? `  [${i}]` : '')); if (!c) fails++; };
const S = (o = {}) => Object.assign(E.newState(), { runsDone: 6, epoch: 3, universe: 150, ...o });
const tot = M.totals(S());
ok('8 Vitrinen mit 75 Funden', M.all().length === 8 && tot.total === 75, JSON.stringify(tot));
ok('jede Vitrine hat zwei Boni und nur eindeutige Fund-IDs', M.all().every((v) => v.bonus.length === 2) && new Set(M.all().flatMap((v) => v.items.map((i) => i.id))).size === 75);
ok('jeder Fund hat Name, Text und Hinweis', M.all().every((v) => v.items.every((i) => i.name && i.text && i.hint)));
ok('neuer Spielstand: nichts gefunden', tot.found === 0);
// Ableitung aus bestehenden Daten
const s = S({ fragments: [0, 1, 2, 3, 4, 5], letters: 10, endings: ['lenker'], avatars: ['mutter'], legacy: [{ u: 144, id: 'leviathan' }], law: 'nebel', pantheon: [{ u: 150, name: 'Die Formende Hand' }] });
const p = Object.fromEntries(M.progress(s).map((x) => [x.id, x]));
ok('Fragmente aus S.fragments (6/12 = Hälfte)', p.frag.found === 6 && p.frag.half && !p.frag.full);
ok('Briefe aus S.letters (10/10 vollständig)', p.brief.full);
ok('Relikte aus Avataren und Vermächtnis', p.relikt.found === 2);
ok('Enden', p.ende.found === 1);
ok('Götter aus dem Pantheon', p.gott.found === 1);
ok('Gesetz aus dem aktuellen Universum', p.gesetz.found === 1);
// Funde
const f = S(); ok('Fund wird neu vermerkt, doppelt nicht', M.fund(f, 'cos:komet') === true && M.fund(f, 'cos:komet') === false && f.museum.ids['cos:komet'] === 150);
M.fund(f, 'boss:zerfall'); M.fund(f, 'boss:stille'); M.fund(f, 'cos:sturm');
ok('Himmel & Gegner: 4/8 = Hälfte', M.progress(f).find((x) => x.id === 'himmel').half);
// Boni
const base = S(), pr = S({ legacy: Array.from({ length: 14 }, (_, i) => ({ id: Object.keys(M.all()[2].items).length && M.all()[2].items[i].id.split(':')[1] })) });
ok('Relikte vollständig: Produktion ×1,05 × 1,1', Math.abs(R.erbeFx(pr).prod - 1.05 * 1.1) < 1e-9, String(R.erbeFx(pr).prod));
ok('Fragmente zur Hälfte: Tippen ×1,1', Math.abs(R.erbeFx(S({ fragments: [0, 1, 2, 3, 4, 5] })).tap - 1.1) < 1e-9);
ok('Fragmente vollständig: Tippen ×1,21', Math.abs(R.erbeFx(S({ fragments: Array.from({ length: 12 }, (_, i) => i) })).tap - 1.21) < 1e-9);
ok('Himmel-Hälfte: Entropie-Strafe ×0,9, vollständig: Boss ×0,9 und +0,3 s', (() => { const a = S(); ['cos:komet', 'cos:sturm', 'cos:nova', 'boss:zerfall'].forEach((x) => M.fund(a, x)); const h = R.erbeFx(a); ['boss:stille', 'boss:winter', 'boss:entropie', 'boss:kollaps'].forEach((x) => M.fund(a, x)); const v = R.erbeFx(a); return Math.abs(h.penalty - 0.9) < 1e-9 && h.bossHp === 1 && Math.abs(v.bossHp - 0.9) < 1e-9 && Math.abs(v.weakLife - 0.3) < 1e-9; })());
ok('Museum und Erbe-Baum stapeln sich', Math.abs(R.erbeFx(S({ erbeNodes: ['s1'], legacy: pr.legacy })).prod - 1.1 * 1.05 * 1.1) < 1e-9);
ok('Cache reagiert auf neue Funde', (() => { const a = S(); const x0 = R.erbeFx(a).mut; ['law:schwer', 'law:nebel', 'law:wasser', 'law:stille'].forEach((x) => M.fund(a, x)); return x0 === 1 && Math.abs(R.erbeFx(a).mut - 1.1) < 1e-9; })());
// Meldungen
const n = S({ fragments: [0, 1, 2, 3, 4, 5], letters: 10 });
const th = M.newThresholds(n);
ok('Schwellen: Fragmente Hälfte + Briefe Hälfte und voll', th.map((t) => t.key).sort().join() === 'brief:1,brief:2,frag:1', th.map((t) => t.key).join());
M.markSeen(n, th); ok('gemeldete Schwellen kommen nicht wieder', M.newThresholds(n).length === 0);
n.fragments.push(6); ok('keine neue Schwelle zwischen 50 % und 100 %', M.newThresholds(n).length === 0);
console.log(fails ? `FEHLGESCHLAGEN: ${fails}` : 'Alle Tests bestanden'); process.exit(fails ? 1 : 0);
