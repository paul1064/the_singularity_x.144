// Balance-Simulator für Akt II:  node tools/simulate_akt2.mjs [taps/s]
import * as A from '../www/js/akt2econ.js';
import { MENTORS } from '../www/js/akt2data.js';
const fakeA = (layers) => ({ // typischer Datensatz: Krebs-Sonne, Lebensweg 4, Profil 2/4 …
  sun: 3, sonnenSephira: 9, mondSephira: 8, lebensSephira: 4, gematriaSephira: 1, hd: { personality: { line: 2 }, design: { line: 4 }, profil: '2/4' },
  aspekt: { id: 'trigon' }, persJahr: 5, heute: { phase: { name: 'Zunehmender Mond' }, sun: 6 } });
function run(tapsPerSec, layers, dim, runNo) {
  const a2 = A.newA2(); a2.layers = layers; a2.dim = dim; a2.run = runNo;
  const data = fakeA(layers); let fx = A.computeFx(a2, data), t = 0, log = [];
  const cd = {}; // Mentorenkräfte: ideal genutzt
  while (t < 5 * 3600) {
    t++;
    for (const b of a2.buffs) b.t -= 1; a2.buffs = a2.buffs.filter((b) => b.t > 0);
    for (const id of a2.mentors) {
      cd[id] = Math.max(0, (cd[id] || 0) - fx.cd); if (cd[id] > 0) continue;
      const m = MENTORS.find((x) => x.id === id); cd[id] = m.power.cd;
      for (const f of m.power.fx) { if (f.t === 'burst') a2.buffs.push({ k: f.k, m: f.m, t: f.dur }); if (f.t === 'gain') A.earn(a2, A.prodPerSec(a2, fx) * f.secs); }
    }
    const pps = A.prodPerSec(a2, fx);
    A.earn(a2, pps + tapsPerSec * A.tapValue(a2, fx, pps));
    if (a2.wissen >= A.leapCost(a2)) {
      a2.wissen -= A.leapCost(a2); log.push(`${(t / 60).toFixed(1)}`);
      if (a2.age === A.LAST_AGE) return { t, log };
      a2.age++; a2.mentors.push(MENTORS[a2.age].id); fx = A.computeFx(a2, data);
    }
    for (let k = 0; k < 25; k++) {       // gierig kaufen: bester Ertrag je Kosten
      let best = -1, br = Infinity;
      for (let i = 0; i < 11; i++) { if (!A.genUnlocked(a2, i)) continue; const c = A.genCost(a2, fx, i), b = A.genProd(a2, fx, i); a2.owned[i]++; const g = A.genProd(a2, fx, i) - b; a2.owned[i]--; if (c / g < br) { br = c / g; best = i; } }
      const c = best >= 0 ? A.genCost(a2, fx, best) : Infinity;
      if (best >= 0 && a2.wissen >= c && c < A.leapCost(a2) * 0.3) { a2.wissen -= c; a2.owned[best]++; } else break;
    }
  }
  return { t, log };
}
const taps = +process.argv[2] || 2;
a2mentor0();
function a2mentor0() {}
for (const [layers, dim, runNo, label] of [[1, 0, 1, 'Durchgang 1 (Ebene 1)'], [3, 0, 3, 'Durchgang 3'], [7, 0, 7, 'Durchgang 7 (alle Ebenen)'], [7, 1, 8, 'Dimension 1, Durchgang 8'], [7, 3, 10, 'Dimension 3'], [7, 6, 13, 'Dimension 6']]) {
  const r = run(taps, layers, dim, runNo);
  console.log(`${label}: ${(r.t / 60).toFixed(1)} min  (Zeitalter nach min: ${r.log.join(' · ')})`);
}
