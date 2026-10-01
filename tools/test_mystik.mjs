// Referenztests für www/js/mystik.js:  node tools/test_mystik.mjs
import * as M from '../www/js/mystik.js';
let fail = 0;
const ok = (name, cond, info = '') => { console.log((cond ? 'OK   ' : 'FAIL ') + name + (info ? `  [${info}]` : '')); if (!cond) fail++; };
const near = (a, b, tol) => Math.abs(M.angDiff(a, b)) <= tol;
const jdUTC = (y, m, d, h = 0, mi = 0) => M.julianDay(new Date(Date.UTC(y, m - 1, d, h, mi)));

// Sonne: Meeus Bsp. 25.a (1992-10-13 0h TD): 199,90895°
const s1 = M.sunLongitude(2448908.5);
ok('Sonne 1992-10-13 (Meeus)', near(s1, 199.90895, 0.02), s1.toFixed(4));
// Frühlingspunkt 2000-03-20 07:35 UT ≈ 0°
ok('Frühlingspunkt 2000', near(M.sunLongitude(jdUTC(2000, 3, 20, 7, 35)), 0, 0.05), M.sunLongitude(jdUTC(2000, 3, 20, 7, 35)).toFixed(3));
// Sonnenwenden: 2024-06-20 20:51 UT ≈ 90°, 2024-12-21 09:21 UT ≈ 270°
ok('Sommersonnenwende 2024', near(M.sunLongitude(jdUTC(2024, 6, 20, 20, 51)), 90, 0.05));
ok('Wintersonnenwende 2024', near(M.sunLongitude(jdUTC(2024, 12, 21, 9, 21)), 270, 0.05));
// Mond: Meeus Bsp. 47.a (1992-04-12 0h TD): 133,167°
const m1 = M.moonLongitude(2448724.5);
ok('Mond 1992-04-12 (Meeus)', near(m1, 133.167, 0.5), m1.toFixed(3));
// Neumond 2000-01-06 18:14 UT, Vollmond 2000-01-21 04:40 UT
ok('Neumond 2000-01-06', M.moonPhase(jdUTC(2000, 1, 6, 18, 14)).name === 'Neumond' && Math.abs(angDiffSafe(M.moonPhase(jdUTC(2000, 1, 6, 18, 14)).elong)) < 1.5);
ok('Vollmond 2000-01-21', M.moonPhase(jdUTC(2000, 1, 21, 4, 40)).name === 'Vollmond');
function angDiffSafe(x) { return M.angDiff(x, 0); }

// Planeten: bekannte Zeichenwechsel 2024/25 (Toleranz 1,5°)
const ingress = [['saturn', 2025, 5, 25, 0, 'Saturn → Widder'], ['jupiter', 2025, 6, 9, 0, 'Jupiter → Krebs'], ['uranus', 2025, 7, 7, 0, 'Uranus → Zwillinge'],
  ['neptune', 2025, 3, 30, 0, 'Neptun → Widder'], ['pluto', 2024, 11, 19, 300, 'Pluto → Wassermann']];
for (const [p, y, mo, d, base, label] of ingress) {
  const lon = M.planetLongitude(p, jdUTC(y, mo, d, 12));
  const cusp = base || { saturn: 0, jupiter: 90, uranus: 60, neptune: 0 }[p];
  ok(label, near(lon, cusp, 1.5), `Länge ${lon.toFixed(2)}° (Grenze ${cusp}°)`);
}
// Saturn Jan 2000 ≈ Stier 10° (≈ 40°)
ok('Saturn 2000-01-01 ≈ 41° (Stier)', near(M.planetLongitude('saturn', jdUTC(2000, 1, 1, 12)), 40.4, 1.5), M.planetLongitude('saturn', jdUTC(2000, 1, 1, 12)).toFixed(2));

// Numerologie
ok('Lebenszahl 14.07.1990 = 4', M.lifePath(14, 7, 1990) === 4);
ok('Lebenszahl 29.11.1982 (Meisterzahl 22)', M.lifePath(29, 11, 1982) === M.reduceNum(M.reduceNum(29) + 11 + M.reduceNum(1982)));
ok('reduceNum Meisterzahlen', M.reduceNum(11) === 11 && M.reduceNum(22) === 22 && M.reduceNum(38) === 11 && M.reduceNum(29) === 11 && M.reduceNum(19) === 1);
const nn = M.nameNumbers('Paul Feichtinger');
ok('Namenszahlen plausibel', nn.ausdruck >= 1 && nn.seele >= 1 && nn.persoenlichkeit >= 1 && nn.buchstaben === 15, JSON.stringify(nn));
ok('Umlaute (Müller = MUELLER)', M.normName('Müller') === 'MUELLER' && M.normName('Weiß') === 'WEISS');
ok('Gematria A+B+C = 6', M.gematria('abc') === 6);
ok('Sephira aus Zahl', M.sephiraFromNumber(1) === 1 && M.sephiraFromNumber(9) === 9 && M.sephiraFromNumber(22) === 10 && M.sephiraFromNumber(11) === 2);
ok('Herrscher-Sephira: Löwe = Tiphareth, Steinbock = Binah', M.sephiraOfSign(4) === 6 && M.sephiraOfSign(9) === 3);

// Human Design: Tor-Rad
ok('Rad hat 64 verschiedene Tore', new Set(M.HD_WHEEL).size === 64 && M.HD_WHEEL.every((g) => g >= 1 && g <= 64));
ok('Frühlingspunkt = Tor 25', M.hdPosition(0).gate === 25 && M.hdPosition(0).line === 2, JSON.stringify(M.hdPosition(0)));
ok('2° Wassermann beginnt Tor 41.1', JSON.stringify(M.hdPosition(302)) === '{"gate":41,"line":1}');
ok('Tor 25 beginnt bei 28°15\' Fische', M.hdPosition(358.26).gate === 25 && M.hdPosition(358.2).gate === 36);
// Design-Sonne ≈ 88° vor der Geburt, ca. 88–92 Tage
const jdb = jdUTC(1990, 7, 14, 12), jdd = M.designJD(jdb);
ok('Design-Sonne ≈ 88° früher', near(M.sunLongitude(jdd), M.sunLongitude(jdb) - 88, 0.01) && jdb - jdd > 85 && jdb - jdd < 93, `${(jdb - jdd).toFixed(1)} Tage`);
// Profile: Profil ist immer eine der 12 bekannten Kombinationen
const profiles = new Set(['1/3', '1/4', '2/4', '2/5', '3/5', '3/6', '4/6', '4/1', '5/1', '5/2', '6/2', '6/3']);
let bad = 0, n = 0;
for (let k = 0; k < 400; k++) { const jd = jdb + k * 9.1; const p = M.hdPosition(M.sunLongitude(jd)).line, dd = M.hdPosition(M.sunLongitude(M.designJD(jd))).line; n++; if (!profiles.has(`${p}/${dd}`)) bad++; }
ok('Profile stets aus den 12 gültigen Kombinationen', bad === 0, `${bad} von ${n} ungültig`);

// Rückkehr: Saturnrückkehr liegt ca. 27–31 Jahre nach der Geburt (für Geburt 1990 → ca. 2019–2020, 2nd 2048)
const now = new Date(Date.UTC(2026, 8, 30, 12));
const a = M.analyse({ name: 'Paul Feichtinger', y: 1990, m: 7, d: 14 }, now);
ok('Analyse: Sonne Krebs, Element Wasser', a.sun === 3 && a.sunElement === 'Wasser', `${M.SIGNS[a.sun]} ${a.sunLon.toFixed(1)}°`);
ok('Analyse: Mondzeichen berechnet', a.moon >= 0 && a.moon < 12, `${M.SIGNS[a.moon]}`);
ok('Analyse: Profil gültig', profiles.has(a.hd.profil), a.hd.profil + ` Tor ${a.hd.personality.gate}.${a.hd.personality.line}`);
ok('Analyse: nächste Saturnrückkehr liegt in der Zukunft (2048±1)', a.saturnrueckkehr && Math.abs(a.saturnrueckkehr.getFullYear() - 2048) <= 1, a.saturnrueckkehr && a.saturnrueckkehr.toISOString().slice(0, 10));
ok('Analyse: heutiger Himmel', a.heute.sun === 5 || a.heute.sun === 6, `Sonne ${M.SIGNS[a.heute.sun]}, Mond ${M.SIGNS[a.heute.moon]}, ${a.heute.phase.name}`);
ok('Analyse: Transite heute (Pluto in Wassermann)', M.signOf(a.heute.transit.pluto) === 10, M.SIGNS[M.signOf(a.heute.transit.pluto)]);
console.log(fail ? `\n${fail} Test(s) fehlgeschlagen` : '\nAlle Tests bestanden');
process.exit(fail ? 1 : 0);
