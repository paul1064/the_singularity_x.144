// ─────────────────────────────────────────────────────────────
//  Mystik — Berechnungen für Akt II (rein, ohne DOM, in Node testbar)
//  Astronomie: Sonne (±0,01°), Mond (±0,3°), Jupiter–Pluto (±1°), genug für
//  Zeichen, Tore und Zyklen. Alles läuft lokal, nichts wird gesendet.
//  Die Systeme (Astrologie, Numerologie, Kabbalah, Human Design) sind Symbolsprachen.
// ─────────────────────────────────────────────────────────────
const D2R = Math.PI / 180;
export const mod = (x, m) => ((x % m) + m) % m;
const sin = (deg) => Math.sin(deg * D2R);
const cos = (deg) => Math.cos(deg * D2R);
export const angDiff = (a, b) => mod(a - b + 180, 360) - 180;   // a − b im Bereich −180…180

export const SIGNS = ['Widder', 'Stier', 'Zwillinge', 'Krebs', 'Löwe', 'Jungfrau', 'Waage', 'Skorpion', 'Schütze', 'Steinbock', 'Wassermann', 'Fische'];
export const ELEMENTS = ['Feuer', 'Erde', 'Luft', 'Wasser'];
export const elementOf = (signIdx) => ELEMENTS[[0, 1, 2, 3][signIdx % 4]];   // Widder Feuer, Stier Erde, Zwillinge Luft, Krebs Wasser, …
export const signOf = (lon) => Math.floor(mod(lon, 360) / 30);
export const degInSign = (lon) => mod(lon, 360) % 30;

// ── Zeit ──────────────────────────────────────────────────────
export const julianDay = (date) => date.getTime() / 86400000 + 2440587.5;
const T_of = (jd) => (jd - 2451545) / 36525;

// ── Sonne (Meeus, scheinbare Länge) ───────────────────────────
export function sunLongitude(jd) {
  const T = T_of(jd);
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * sin(M) + (0.019993 - 0.000101 * T) * sin(2 * M) + 0.000289 * sin(3 * M);
  const omega = 125.04 - 1934.136 * T;
  return mod(L0 + C - 0.00569 - 0.00478 * sin(omega), 360);
}
// Abstand Erde–Sonne in AE (für die Planetenberechnung)
function earthDistance(jd) {
  const T = T_of(jd);
  const e = 0.016708634 - 0.000042037 * T;
  const M = 357.52911 + 35999.05029 * T;
  const C = (1.914602 - 0.004817 * T) * sin(M) + 0.019993 * sin(2 * M);
  return 1.000001018 * (1 - e * e) / (1 + e * cos(M + C));
}

// ── Mond (Astronomical Almanac, niedrige Genauigkeit ≈ 0,3°) ──
export function moonLongitude(jd) {
  const T = T_of(jd);
  return mod(218.32 + 481267.881 * T + 6.29 * sin(135.0 + 477198.87 * T) - 1.27 * sin(259.3 - 413335.36 * T)
    + 0.66 * sin(235.7 + 890534.22 * T) + 0.21 * sin(269.9 + 954397.74 * T) - 0.19 * sin(357.5 + 35999.05 * T)
    - 0.11 * sin(186.5 + 966404.03 * T), 360);
}
export const MOON_PHASES = ['Neumond', 'Zunehmende Sichel', 'Erstes Viertel', 'Zunehmender Mond', 'Vollmond', 'Abnehmender Mond', 'Letztes Viertel', 'Abnehmende Sichel'];
export function moonPhase(jd) {
  const elong = mod(moonLongitude(jd) - sunLongitude(jd), 360);
  return { elong, name: MOON_PHASES[Math.floor(mod(elong + 22.5, 360) / 45)], lit: (1 - cos(elong)) / 2 };
}

// ── Planeten Jupiter–Pluto (JPL „Keplerian Elements", 1800–2050) ──
// [a, e, I, L, ϖ, Ω] + Änderung je Jahrhundert
const EL = {
  jupiter: [[5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909], [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
  saturn:  [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448], [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
  uranus:  [[19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503], [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589]],
  neptune: [[30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574], [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]],
  pluto:   [[39.48211675, 0.24882730, 17.14001206, 238.92903833, 224.06891629, 110.30393684], [-0.00031596, 0.00005170, 0.00004818, 145.20780515, -0.04062942, -0.01183482]],
};
export const PLANETS = Object.keys(EL);
function helio(name, T) {
  const [p0, dp] = EL[name];
  const [a, e, I, L, w, O] = p0.map((v, i) => v + dp[i] * T);
  const om = w - O, M = mod(L - w, 360);
  let E = M + (180 / Math.PI) * e * sin(M);          // Kepler-Gleichung (Newton)
  for (let k = 0; k < 6; k++) E -= (E - (180 / Math.PI) * e * sin(E) - M) / (1 - e * cos(E));
  const xp = a * (cos(E) - e), yp = a * Math.sqrt(1 - e * e) * sin(E);
  const co = cos(om), so = sin(om), cO = cos(O), sO = sin(O), cI = cos(I), sI = sin(I);
  return [(co * cO - so * sO * cI) * xp + (-so * cO - co * sO * cI) * yp,
          (co * sO + so * cO * cI) * xp + (-so * sO + co * cO * cI) * yp];
}
// geozentrische ekliptikale Länge (Tierkreis des Datums, mit Präzession)
export function planetLongitude(name, jd) {
  const T = T_of(jd);
  const [px, py] = helio(name, T);
  const sunLon = sunLongitude(jd), R = earthDistance(jd);
  const ex = -R * cos(sunLon), ey = -R * sin(sunLon);   // Erde (Tierkreis des Datums)
  // Planet von J2000 auf „Datum" drehen
  const prec = 1.396971 * T * D2R, cp = Math.cos(prec), sp = Math.sin(prec);
  const qx = px * cp - py * sp, qy = px * sp + py * cp;
  return mod(Math.atan2(qy - ey, qx - ex) / D2R, 360);
}

// ── Numerologie ───────────────────────────────────────────────
const MASTER = [11, 22, 33];
export function reduceNum(n, keepMaster = true) {
  n = Math.abs(Math.trunc(n));
  while (n > 9 && !(keepMaster && MASTER.includes(n))) n = String(n).split('').reduce((a, c) => a + +c, 0);
  return n;
}
export const lifePath = (d, m, y) => reduceNum(reduceNum(d) + reduceNum(m) + reduceNum(y));
const PYTH = { A: 1, J: 1, S: 1, B: 2, K: 2, T: 2, C: 3, L: 3, U: 3, D: 4, M: 4, V: 4, E: 5, N: 5, W: 5, F: 6, O: 6, X: 6, G: 7, P: 7, Y: 7, H: 8, Q: 8, Z: 8, I: 9, R: 9 };
export const normName = (s) => s.toUpperCase().replace(/Ä/g, 'AE').replace(/Ö/g, 'OE').replace(/Ü/g, 'UE').replace(/ß/g, 'SS').replace(/[^A-Z]/g, '');
export function nameNumbers(name) {
  const L = normName(name).split('');
  const sum = (arr) => arr.reduce((a, c) => a + PYTH[c], 0);
  const vowels = L.filter((c) => 'AEIOU'.includes(c)), cons = L.filter((c) => !'AEIOU'.includes(c));
  return { ausdruck: reduceNum(sum(L)), seele: reduceNum(sum(vowels)), persoenlichkeit: reduceNum(sum(cons)), buchstaben: L.length };
}
// Lateinische Gematria (A=1 … Z=26)
export const gematria = (name) => normName(name).split('').reduce((a, c) => a + c.charCodeAt(0) - 64, 0);

// Sephira-Nummer (1 Kether … 10 Malkuth) aus einer Zahl
export function sephiraFromNumber(n) {
  if (n === 11) return 2;    // Chokmah: Meisterintuition
  if (n === 22) return 10;   // Malkuth: Meisterbauer
  if (n === 33) return 6;    // Tiphareth: Meisterlehrer
  return ((n - 1) % 10) + 1;
}
// Herrscher des Zeichens → Sephira-Nummer (klassische Zuordnung)
const RULER_SEPHIRA = [5, 7, 8, 9, 6, 8, 7, 5, 4, 3, 3, 4];   // Widder … Fische
export const sephiraOfSign = (signIdx) => RULER_SEPHIRA[signIdx];
export const RULERS = ['Mars', 'Venus', 'Merkur', 'Mond', 'Sonne', 'Merkur', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];

// ── Human Design (vereinfacht: Sonnen-Tore und Profil) ────────
export const HD_WHEEL = [41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60];
export function hdPosition(lon) {
  const x = mod(lon - 302, 360);            // Tor 41 beginnt bei 2° Wassermann
  const gi = Math.floor(x / 5.625), rem = x - gi * 5.625;
  return { gate: HD_WHEEL[gi], line: Math.min(6, Math.floor(rem / 0.9375) + 1) };
}
// Zeitpunkt der „Design"-Sonne: 88° Sonnenbogen vor der Geburt
export function designJD(jdBirth) {
  const target = mod(sunLongitude(jdBirth) - 88, 360);
  let jd = jdBirth - 88;
  for (let i = 0; i < 10; i++) jd += angDiff(target, sunLongitude(jd)) / 0.9856;
  return jd;
}

// ── Aspekte & Zyklen ──────────────────────────────────────────
export const ASPECTS = [
  { id: 'konjunktion', name: 'Konjunktion', angle: 0, orb: 8 }, { id: 'sextil', name: 'Sextil', angle: 60, orb: 5 },
  { id: 'quadrat', name: 'Quadrat', angle: 90, orb: 7 }, { id: 'trigon', name: 'Trigon', angle: 120, orb: 7 },
  { id: 'opposition', name: 'Opposition', angle: 180, orb: 8 },
];
export function aspectBetween(lonA, lonB) {
  const d = Math.abs(angDiff(lonA, lonB));
  let best = null;
  for (const a of ASPECTS) { const o = Math.abs(d - a.angle); if (o <= a.orb && (!best || o < best.orb)) best = { ...a, orb: o }; }
  return best;
}
// Nächster Durchgang des laufenden Planeten über den Geburtsort des Planeten (z. B. Saturnrückkehr)
export function nextReturn(name, jdBirth, jdNow, maxYears = 32) {
  const natal = planetLongitude(name, jdBirth);
  let prev = angDiff(planetLongitude(name, jdNow), natal);
  for (let d = 5; d < maxYears * 365.25; d += 5) {
    const cur = angDiff(planetLongitude(name, jdNow + d), natal);
    if (prev < 0 && cur >= 0 && Math.abs(prev) < 90 && Math.abs(cur) < 90) return { jd: jdNow + d - 2.5, natal };
    prev = cur;
  }
  return { jd: null, natal };
}
export const dateOfJD = (jd) => new Date((jd - 2440587.5) * 86400000);

// ── Alles zusammen ────────────────────────────────────────────
// profile: { name, y, m, d, h?, min? } (Ortszeit des Geräts; ohne Uhrzeit 12:00)
// ── Geburtsort & Ortszeit ─────────────────────────────────────
// Ortszeit (Wanduhr) in einer IANA-Zeitzone → exakter Zeitpunkt (berücksichtigt damals gültige Sommerzeit)
function tzOffsetMin(utcMs, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
    .formatToParts(new Date(utcMs)).map((q) => [q.type, +q.value]));
  return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(utcMs / 1000) * 1000) / 60000;
}
export function localToDate(y, m, d, h, min, tz) {
  if (!tz) return new Date(y, m - 1, d, h, min, 0);                  // ohne Ort: Zeitzone des Geräts
  const wall = Date.UTC(y, m - 1, d, h, min, 0);
  let utc = wall - tzOffsetMin(wall, tz) * 60000;
  utc = wall - tzOffsetMin(utc, tz) * 60000;                          // zweiter Durchgang an Sommerzeitgrenzen
  return new Date(utc);
}
// Aszendent und Medium Coeli (Himmelsmitte) für Zeitpunkt jd, geografische Breite/Länge in Grad (Ost positiv)
export function ascMc(jd, lat, lon) {
  const T = (jd - 2451545) / 36525;
  const ramc = mod(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T + lon, 360);
  const eps = 23.4392911 - 0.0130042 * T;
  const mc = mod(Math.atan2(sin(ramc), cos(ramc) * cos(eps)) / D2R, 360);
  const asc = mod(Math.atan2(cos(ramc), -(sin(ramc) * cos(eps) + Math.tan(lat * D2R) * sin(eps))) / D2R, 360);
  return { asc, mc };
}

export function analyse(profile, now = new Date()) {
  const { name, y, m, d } = profile, h = profile.h ?? 12, min = profile.min ?? 0;
  const ort = profile.ort || null;
  const birth = localToDate(y, m, d, h, min, ort ? ort.tz : null);
  const jd = julianDay(birth), jdNow = julianDay(now);
  const sunLon = sunLongitude(jd), moonLon = moonLongitude(jd);
  const sun = signOf(sunLon), moon = signOf(moonLon);
  const lp = lifePath(d, m, y), nn = nameNumbers(name), gem = gematria(name);
  const jdD = designJD(jd);
  const pers = hdPosition(sunLon), design = hdPosition(sunLongitude(jdD));
  const ageYears = (now.getTime() - birth.getTime()) / 31557600000;
  const satRet = nextReturn('saturn', jd, jdNow), jupRet = nextReturn('jupiter', jd, jdNow);
  const transit = {};
  for (const p of PLANETS) transit[p] = planetLongitude(p, jdNow);
  return {
    birth, jd, sunLon, moonLon, sun, moon, sunElement: elementOf(sun), moonElement: elementOf(moon),
    hasTime: profile.h !== undefined && profile.h !== null, ort,
    hori: ort && profile.h !== undefined && profile.h !== null ? (() => { const r = ascMc(jd, ort.lat, ort.lon); return { ...r, ascZ: signOf(r.asc), mcZ: signOf(r.mc), hausSonne: ((signOf(sunLon) - signOf(r.asc) + 12) % 12) + 1, hausMond: ((signOf(moonLon) - signOf(r.asc) + 12) % 12) + 1 }; })() : null,
    lebensweg: lp, name: nn, gematria: gem, gematriaSephira: sephiraFromNumber(reduceNum(gem)),
    lebensSephira: sephiraFromNumber(lp), sonnenSephira: sephiraOfSign(sun), mondSephira: sephiraOfSign(moon),
    aspekt: aspectBetween(sunLon, moonLon), geburtsphase: moonPhase(jd),
    hd: { personality: pers, design, profil: `${pers.line}/${design.line}`, designDatum: dateOfJD(jdD) },
    alter: ageYears, saturnrueckkehr: satRet.jd ? dateOfJD(satRet.jd) : null, jupiterrueckkehr: jupRet.jd ? dateOfJD(jupRet.jd) : null,
    persJahr: reduceNum(d + m + now.getFullYear()),
    heute: { sun: signOf(sunLongitude(jdNow)), moon: signOf(moonLongitude(jdNow)), phase: moonPhase(jdNow), transit },
    kalender: kalender(now, 120, sunLon),
  };
}

// ── Himmelskalender: echte Termine ────────────────────────────
// Nächster Zeitpunkt, an dem die Sonne die Länge target (°) erreicht (Newton-Verfahren)
export function nextSunCrossing(target, jdFrom) {
  let jd = jdFrom + mod(target - sunLongitude(jdFrom), 360) / 0.9856;
  for (let i = 0; i < 8; i++) jd += angDiff(target, sunLongitude(jd)) / 0.9856;
  return jd;
}
const elong = (jd) => mod(moonLongitude(jd) - sunLongitude(jd), 360);
// Nächster Zeitpunkt, an dem der Mondabstand zur Sonne target (0 = Neumond, 180 = Vollmond) erreicht
export function nextElongation(target, jdFrom) {
  let jd = jdFrom + mod(target - elong(jdFrom), 360) / 12.19;
  for (let i = 0; i < 10; i++) jd += angDiff(target, elong(jd)) / 12.19;
  return jd;
}
// Feste des Jahreskreises (Sonnenlänge): Sonnenfeste (Wenden, Tag-und-Nacht-Gleichen) und Halbfeste dazwischen
export const FESTE_LAENGE = [
  { id: 'fruehling', typ: 'sonnenfest', lon: 0,   name: 'Frühlings-Tagundnachtgleiche' },
  { id: 'walpurgis', typ: 'halbfest',   lon: 45,  name: 'Walpurgis' },
  { id: 'sommer',    typ: 'sonnenfest', lon: 90,  name: 'Sommersonnenwende' },
  { id: 'schnitter', typ: 'halbfest',   lon: 135, name: 'Schnitterfest' },
  { id: 'herbst',    typ: 'sonnenfest', lon: 180, name: 'Herbst-Tagundnachtgleiche' },
  { id: 'samhain',   typ: 'halbfest',   lon: 225, name: 'Samhain' },
  { id: 'winter',    typ: 'sonnenfest', lon: 270, name: 'Wintersonnenwende' },
  { id: 'lichtmess', typ: 'halbfest',   lon: 315, name: 'Lichtmess' },
];
const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
export { sameDay };
// Alle Ereignisse der nächsten `days` Tage, nach Datum sortiert. natalSunLon: für die Sonnenwiederkehr (Geburtstag).
export function kalender(now, days = 120, natalSunLon = null) {
  const jd0 = julianDay(now) - 0.5, jd1 = jd0 + days + 0.5, out = [];
  const add = (typ, id, name, jd) => { if (jd >= jd0 && jd <= jd1) out.push({ typ, id, name, jd, date: dateOfJD(jd) }); };
  for (const f of FESTE_LAENGE) add(f.typ, f.id, f.name, nextSunCrossing(f.lon, jd0));
  for (const [target, typ, name] of [[0, 'neumond', 'Neumond'], [180, 'vollmond', 'Vollmond']]) {
    let jd = nextElongation(target, jd0);
    while (jd <= jd1) { add(typ, typ, name, jd); jd = nextElongation(target, jd + 10); }
  }
  if (natalSunLon !== null) add('wiederkehr', 'wiederkehr', 'Sonnenwiederkehr (dein Geburtstag)', nextSunCrossing(natalSunLon, jd0));
  out.sort((a, b) => a.jd - b.jd);
  for (const e of out) e.heute = sameDay(e.date, now);
  return out;
}
