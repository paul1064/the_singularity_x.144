import * as A from '../www/js/akt3econ.js';
import { LETTER, MIRRORS, ENDINGS3 } from '../www/js/akt3data.js';
let fails = 0; const ok = (n, c, i = '') => { console.log((c ? 'OK   ' : 'FAIL ') + n + (i ? `  [${i}]` : '')); if (!c) fails++; };
const mk = (o = {}) => Object.assign(A.newA3(), o);
const fx0 = (a3, vit = 0) => A.computeFx(a3, { vit: new Array(8).fill(vit), dim: 0, meta: 1 });
ok('8 Spiegel, 8 Briefsätze mit je drei Tönen', MIRRORS.length === 8 && LETTER.length === 8 && LETTER.every((l) => l.a && l.b && l.c && l.prompt));
ok('4 Enden mit Namen und Text', Object.keys(ENDINGS3).join() === 'licht,schatten,gleich,wahr' && Object.values(ENDINGS3).every((e) => e.name && e.text.length > 80));
const a = mk(), f = fx0(a);
ok('Start: nur Spiegel 0 offen', A.unlocked(a, 0) && !A.unlocked(a, 1));
ok('ohne Einheiten: Gleichgewicht 1, keine Produktion, kein Einklang', A.balance(a, f).bal === 1 && A.prodPerSec(a, f) === 0 && !A.harmonized(a, f));
a.mem = 1e6; A.buy(a, f, 0, 'licht', 5);
let b = A.balance(a, f);
ok('nur Licht: G = 1, bal = 0, Multiplikator 0,6', b.G === 1 && b.bal === 0 && Math.abs(A.balMult(b.bal) - 0.6) < 1e-9);
A.buy(a, f, 0, 'schatten', 5); b = A.balance(a, f);
ok('5 Licht + 5 Schatten: perfekt (G 0,5, Multiplikator 1,6)', Math.abs(b.G - 0.5) < 1e-9 && Math.abs(A.balMult(b.bal) - 1.6) < 1e-9 && A.harmonized(a, f));
ok('Kosten wachsen mit der Gesamtzahl beider Seiten', A.genCost(a, 0, 1) > A.genCost(mk(), 0, 1));
ok('maxAffordable passt zu genCost', (() => { const x = mk({ mem: 5000 }), n = A.maxAffordable(x, 0); return A.genCost(x, 0, n) <= 5000 && A.genCost(x, 0, n + 1) > 5000; })());
// Einklang
const e = mk(); e.mem = 1e6; const fe = fx0(e); A.buy(e, fe, 0, 'licht', 4); A.buy(e, fe, 0, 'schatten', 4);
for (let i = 0; i < 20; i++) A.tick(e, fe, 1);
ok('Einklang lädt sich im Gleichgewicht (+1,5/s)', Math.abs(e.einklang - 30) < 1e-6, String(e.einklang));
A.buy(e, fe, 0, 'licht', 30); for (let i = 0; i < 10; i++) A.tick(e, fe, 1);
ok('Einklang zerfällt aus dem Gleichgewicht (−0,4/s)', Math.abs(e.einklang - 26) < 1e-6, String(e.einklang));
for (let i = 0; i < 1000; i++) A.tick(e, fe, 1); ok('Einklang nie unter 0', e.einklang === 0);
const h = mk(); h.mem = 1e9; const fh = fx0(h); A.buy(h, fh, 0, 'licht', 3); A.buy(h, fh, 0, 'schatten', 3); for (let i = 0; i < 200; i++) A.tick(h, fh, 1);
ok('Einklang höchstens 100', h.einklang === 100);
ok('Einklang erhöht die Produktion bis ×2', Math.abs(A.einklangMult(100) / A.einklangMult(0) - 2) < 1e-9);
// Verbindungen
const l = mk({ kap: 7 }); l.mem = 1e15; const fl = fx0(l);
A.buy(l, fl, 0, 'licht', 4); A.buy(l, fl, 0, 'schatten', 4); A.buy(l, fl, 1, 'licht', 4); A.buy(l, fl, 1, 'schatten', 4);
ok('Verbindung 0–1 leuchtet (je ≥ 7, beide Seiten ≥ 3)', A.links(l).length === 1 && Math.abs(A.linkMult(l) - 1.06) < 1e-9);
const l2 = mk({ kap: 7 }); l2.mem = 1e15; A.buy(l2, fx0(l2), 0, 'licht', 8); A.buy(l2, fx0(l2), 1, 'licht', 8);
ok('einseitige Spiegel verbinden sich nicht', A.links(l2).length === 0);
const wrap = mk({ kap: 7 }); wrap.mem = 1e18; for (const k of [7, 0]) { A.buy(wrap, fx0(wrap), k, 'licht', 4); A.buy(wrap, fx0(wrap), k, 'schatten', 4); }
ok('Ring schließt sich (Spiegel 7 mit 0)', A.links(wrap).some((x) => x[0] === 7 && x[1] === 0));
// Museum-Einfluss und Meta
const fm = A.computeFx(mk(), { vit: [1, 0, 0, 0, 0, 0, 0, 0], dim: 9, meta: 1.2 });
ok('Museum ×1,5 je voller Vitrine, Dimensionen +5 % je Stück', fm.hist[0] === 1.5 && fm.hist[1] === 1 && Math.abs(fm.dim - 1.45) < 1e-9 && fm.meta === 1.2);
ok('Siegel +10 % je Stück', Math.abs(A.computeFx(mk({ seals: ['a', 'b'] }), {}).run - 1.2) < 1e-9);
// Ausgleichen
const s = mk(); s.mem = 1e9; const fs = fx0(s); A.buy(s, fs, 0, 'licht', 6);
ok('Ausgleichen schlägt die schwächere Seite vor (Schatten)', A.suggest(s, fs).side === 'schatten');
A.buy(s, fs, 0, 'schatten', 12); ok('… und danach Licht', A.suggest(s, fs).side === 'licht');
ok('Ausgleichen wählt nur freigeschaltete Spiegel', A.suggest(mk(), fx0(mk())).k === 0);
// Sprünge
ok('Sprungkosten wachsen mit Kapitel und Durchgang', A.leapCost(mk({ kap: 1 })) > A.leapCost(mk({ kap: 0 })) && A.leapCost(mk({ run: 3 })) > A.leapCost(mk()));
ok('Große Spiegelung braucht Einklang 100 und kostet ×1,5', !A.finalReady(mk({ kap: 7, einklang: 99 })) && A.finalReady(mk({ kap: 7, einklang: 100 })) && !A.finalReady(mk({ kap: 6, einklang: 100 })));
ok('Kosten der Großen Spiegelung ×1,5', Math.abs(A.leapCost(mk({ kap: 7 })) / (A.T3.leapBase * Math.pow(A.T3.leapTier, 7)) - 1.5) < 1e-9);
// Brief und Enden
ok('Ton: a=+1, b=−1, c=0', A.tone(['a', 'a', 'b', 'c']) === 1);
ok('Brieftext aus den gewählten Sätzen', A.letterText(['a', 'b', 'c'])[0] === LETTER[0].a && A.letterText(['a', 'b', 'c'])[1] === LETTER[1].b && A.letterText(['a', 'b', 'c'])[2] === LETTER[2].c);
const L8 = (x) => new Array(8).fill(x);
ok('Ende: Licht-Brief → Das Licht, das bleibt', A.endingKey(mk({ lines: L8('a') }), false) === 'licht');
ok('Ende: Schatten-Brief → Der Schatten, der trägt', A.endingKey(mk({ lines: L8('b') }), true) === 'schatten');
ok('Ende: ausgewogener Brief → Gleichklang', A.endingKey(mk({ lines: L8('c') }), false) === 'gleich');
ok('Ende: ausgewogen + Museum/Briefe voll → Das Wahre Ende', A.endingKey(mk({ lines: L8('c') }), true) === 'wahr' && A.endingKey(mk({ lines: ['a', 'a', 'a', 'b', 'b', 'c', 'c', 'c'] }), true) === 'wahr');
ok('Das Wahre Ende ist nicht für einseitige Briefe', A.endingKey(mk({ lines: L8('a') }), true) === 'licht');
ok('Zurücksetzen behält Siegel und Briefe', (() => { const x = mk({ seals: ['gleich'], letters: [1], mem: 5, kap: 3 }); A.resetRun(x); return x.seals.length === 1 && x.letters.length === 1 && x.mem === 0 && x.kap === 0; })());
console.log(fails ? `FEHLGESCHLAGEN: ${fails}` : 'Alle Tests bestanden'); process.exit(fails ? 1 : 0);
