// ─────────────────────────────────────────────────────────────
//  V6.3 — Das Vermächtnis (rein, in Node testbar)
//  Prestige-Baum über alle Universen: Jedes abgeschlossene Universum gibt Erbe-Punkte.
//  Drei Äste (Schöpfer / Bewahrer / Zerstörer) mit je 4 Stufen und ein Schlussstein.
//  Das Erbe wird nie verbraucht, nur verteilt, und lässt sich jederzeit kostenlos neu verteilen.
// ─────────────────────────────────────────────────────────────
export const BRANCHES = {
  schoepfer:  { name: 'Schöpfer',  color: '#ffd166', sub: 'Wachstum' },
  bewahrer:   { name: 'Bewahrer',  color: '#5ee7df', sub: 'Ordnung' },
  zerstoerer: { name: 'Zerstörer', color: '#c77dff', sub: 'Wandel' },
};
// fx: prod, tap, leap, offline, mut (Häufigkeit), gain (Erträge aus Mutation/Moment/Ereignis),
//     entRate, tapRelief, penalty, crack (Abstand der Risse), bossHp, weakLife (+s), umlenken (+Chance)
export const NODES = [
  { id: 's1', b: 'schoepfer', t: 1, cost: 3,  name: 'Erster Funke',          text: 'Produktion +10 %',                          fx: { prod: 1.10 } },
  { id: 's2', b: 'schoepfer', t: 2, cost: 5,  name: 'Verdichtete Zeit',      text: 'Evolutionssprünge kosten 8 % weniger',      fx: { leap: 0.92 } },
  { id: 's3', b: 'schoepfer', t: 3, cost: 8,  name: 'Echo der Welt',         text: 'Offline-Ertrag +30 %',                      fx: { offline: 1.3 } },
  { id: 's4', b: 'schoepfer', t: 4, cost: 12, name: 'Schöpfungsrausch',      text: 'Produktion +25 %',                          fx: { prod: 1.25 } },
  { id: 'b1', b: 'bewahrer',  t: 1, cost: 3,  name: 'Ordnungssinn',          text: 'Die Entropie steigt 15 % langsamer',        fx: { entRate: 0.85 } },
  { id: 'b2', b: 'bewahrer',  t: 2, cost: 5,  name: 'Ruhiger Puls',          text: 'Tippen drängt die Entropie 50 % stärker zurück', fx: { tapRelief: 1.5 } },
  { id: 'b3', b: 'bewahrer',  t: 3, cost: 8,  name: 'Hüter der Ränder',      text: 'Produktionsverlust durch Entropie halbiert, Risse seltener', fx: { penalty: 0.5, crack: 1.5 } },
  { id: 'b4', b: 'bewahrer',  t: 4, cost: 12, name: 'Unbeugsam',             text: 'Bosse haben 20 % weniger Leben, Schwachpunkte bleiben 0,6 s länger', fx: { bossHp: 0.8, weakLife: 0.6 } },
  { id: 'z1', b: 'zerstoerer', t: 1, cost: 3, name: 'Funkenflug',            text: 'Mutationen erscheinen 25 % häufiger',       fx: { mut: 1.25 } },
  { id: 'z2', b: 'zerstoerer', t: 2, cost: 5, name: 'Zerstörerische Ernte',  text: 'Erträge aus Mutationen, Momenten und kosmischen Ereignissen +50 %', fx: { gain: 1.5 } },
  { id: 'z3', b: 'zerstoerer', t: 3, cost: 8, name: 'Kosmischer Mut',        text: 'Umlenken gelingt 15 % öfter, Tippen +20 %', fx: { umlenken: 0.15, tap: 1.2 } },
  { id: 'z4', b: 'zerstoerer', t: 4, cost: 12, name: 'Feuersturm',           text: 'Tippen +50 %',                              fx: { tap: 1.5 } },
  { id: 'k',  b: 'key', t: 5, cost: 25, name: 'Der Gedanke vor dem Gedanken', text: 'Produktion ×1,5, Entropie 20 % langsamer, Erträge +25 %. Schlussstein: braucht Stufe 3 aller Äste.', fx: { prod: 1.5, entRate: 0.8, gain: 1.25 } },
];
export const NODE = Object.fromEntries(NODES.map((n) => [n.id, n]));
const ADD = new Set(['weakLife', 'umlenken']);
const BASE = () => ({ prod: 1, tap: 1, leap: 1, offline: 1, mut: 1, gain: 1, entRate: 1, tapRelief: 1, penalty: 1, crack: 1, bossHp: 1, weakLife: 0, umlenken: 0 });

let cacheKey = null, cacheVal = null;
export function erbeFx(S) {
  const key = (S.erbeNodes || []).join(',');
  if (key === cacheKey) return cacheVal;
  const f = BASE();
  for (const id of S.erbeNodes || []) {
    const n = NODE[id]; if (!n) continue;
    for (const [k, v] of Object.entries(n.fx)) f[k] = ADD.has(k) ? f[k] + v : f[k] * v;
  }
  cacheKey = key; cacheVal = f;
  return f;
}

export const owned = (S, id) => (S.erbeNodes || []).includes(id);
// Voraussetzung: vorige Stufe desselben Astes, der Schlussstein braucht Stufe 3 aller Äste
export function prereq(id) {
  const n = NODE[id];
  if (n.id === 'k') return ['s3', 'b3', 'z3'];
  return n.t > 1 ? [NODES.find((x) => x.b === n.b && x.t === n.t - 1).id] : [];
}
// Gibt null zurück, wenn kaufbar, sonst den Grund
export function why(S, id) {
  const n = NODE[id]; if (!n) return 'Unbekannt';
  if (owned(S, id)) return 'Schon erworben';
  const miss = prereq(id).filter((p) => !owned(S, p));
  if (miss.length) return id === 'k' ? 'Braucht Stufe 3 aller drei Äste' : `Braucht „${NODE[miss[0]].name}"`;
  if ((S.erbeVP || 0) < n.cost) return `Es fehlen ${n.cost - (S.erbeVP || 0)} Erbe`;
  return null;
}
export function buy(S, id) {
  if (why(S, id)) return false;
  S.erbeVP -= NODE[id].cost; S.erbeNodes = [...(S.erbeNodes || []), id]; return true;
}
// Alles zurück ins Erbe (kostenlos): Entscheidung statt Strafe
export function respec(S) {
  const back = (S.erbeNodes || []).reduce((a, id) => a + NODE[id].cost, 0);
  S.erbeVP = (S.erbeVP || 0) + back; S.erbeNodes = []; return back;
}
export const spent = (S) => (S.erbeNodes || []).reduce((a, id) => a + NODE[id].cost, 0);
export const TOTAL_COST = NODES.reduce((a, n) => a + n.cost, 0);

// Ertrag eines abgeschlossenen Universums (S = Spielstand des endenden Universums)
export function gain(S) {
  const L = [{ t: 'Ein Universum vollendet', v: 2 }];
  const av = Math.min(4, (S.avatars || []).length); if (av) L.push({ t: `${av} Avatar${av > 1 ? 'e' : ''} erwacht`, v: av });
  const my = Math.min(3, (S.myths || []).length); if (my) L.push({ t: my > 1 ? `${my} Mythen entstanden` : '1 Mythos entstanden', v: my });
  if (S.runNewEnding) L.push({ t: 'Ein neues Ende gefunden', v: 3 });
  const bw = S.runBossWins || 0; if (bw) L.push({ t: `${bw} Boss${bw > 1 ? 'e' : ''} besiegt`, v: 2 * bw });
  return { total: L.reduce((a, l) => a + l.v, 0), lines: L };
}
// Rückwirkend für bereits gespielte Universen (einmalig)
export function retro(S) {
  if (S.erbeRetro || !(S.runsDone > 0)) return null;
  S.erbeRetro = true;
  const v = Math.min(60, S.runsDone * 6);
  S.erbeVP = (S.erbeVP || 0) + v; S.erbeTotal = (S.erbeTotal || 0) + v;
  return { total: v, lines: [{ t: `Rückwirkend für ${S.runsDone} abgeschlossene Universen`, v }] };
}
