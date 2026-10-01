// ─────────────────────────────────────────────────────────────
//  Spielstand sichern — reine Funktionen (in Node testbar)
//  Sicherung = JSON-Datei oder Text-Code („SX144:" + Base64), mit Prüfsumme gegen Tippfehler/Beschädigung.
//  Automatische Schnappschüsse: die letzten 3, höchstens einer pro 20 Stunden.
// ─────────────────────────────────────────────────────────────
export const FORMAT = 1;
export const GAME = 'singularity-x144';
export const SNAP_MAX = 3;
export const SNAP_MIN_AGE = 20 * 3600e3;
export const REMIND_AFTER = 7 * 86400e3;     // Erinnerung, wenn die letzte Sicherung so alt ist
export const REMIND_EVERY = 3 * 86400e3;     // und höchstens alle 3 Tage fragen

export function fnv(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, '0'); }
const b64e = (s) => btoa(unescape(encodeURIComponent(s)));
const b64d = (s) => decodeURIComponent(escape(atob(s)));

export function info(save) {
  return { universe: save.universe, akt: save.akt || 1, runsDone: save.runsDone || 0, orakelTage: save.a2 ? save.a2.orakelTage || 0 : 0 };
}
export function packBackup(save, now = Date.now()) {
  const json = JSON.stringify(save);
  return { game: GAME, format: FORMAT, exportedAt: now, info: info(save), hash: fnv(json), save };
}
export const toText = (b) => JSON.stringify(b);
export const toCode = (b) => 'SX144:' + b64e(JSON.stringify(b));

// Liest Datei- oder Code-Text; { ok, backup, error }
export function parseBackup(text) {
  try {
    let t = String(text || '').trim();
    if (!t) return { ok: false, error: 'Nichts eingefügt.' };
    if (t.startsWith('SX144:')) t = b64d(t.slice(6).replace(/\s+/g, ''));
    const b = JSON.parse(t);
    if (!b || b.game !== GAME) return { ok: false, error: 'Das ist keine Sicherung von The Singularity x.144.' };
    if (b.format > FORMAT) return { ok: false, error: 'Die Sicherung stammt aus einer neueren Version. Bitte aktualisiere die App.' };
    const s = b.save;
    if (!s || typeof s !== 'object') return { ok: false, error: 'Die Sicherung enthält keinen Spielstand.' };
    if (fnv(JSON.stringify(s)) !== b.hash) return { ok: false, error: 'Die Sicherung ist beschädigt (Prüfsumme stimmt nicht).' };
    if (!(s.universe >= 144) || !Array.isArray(s.owned) || typeof s.complexity !== 'number') return { ok: false, error: 'Der Spielstand ist unvollständig.' };
    return { ok: true, backup: b };
  } catch { return { ok: false, error: 'Der Text konnte nicht gelesen werden. Wurde er vollständig kopiert?' }; }
}

// Schnappschüsse (Ring aus SNAP_MAX): [{ at, info, save }]
export function addSnapshot(list, save, now = Date.now(), force = false) {
  const l = Array.isArray(list) ? list.slice() : [];
  if (!force && l.length && now - l[0].at < SNAP_MIN_AGE) return l;
  l.unshift({ at: now, info: info(save), save });
  return l.slice(0, SNAP_MAX);
}
export function needsReminder(save, now = Date.now()) {
  if (save.universe <= 144 && !(save.runsDone > 0)) return false;       // ganz am Anfang noch nichts zu verlieren
  const old = !save.lastBackup || now - save.lastBackup > REMIND_AFTER;
  return old && (!save.backupAsked || now - save.backupAsked > REMIND_EVERY);
}
export function ageText(ts, now = Date.now()) {
  if (!ts) return 'noch nie';
  const d = Math.floor((now - ts) / 86400e3);
  return d <= 0 ? 'heute' : d === 1 ? 'gestern' : `vor ${d} Tagen`;
}
