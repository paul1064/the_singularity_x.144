// Simuliert einen Durchlauf mit gieriger Kaufstrategie, um die Balance zu prüfen.
import * as E from '../www/js/economy.js';
const run = (tapsPerSec = 2, choices = { oxygen: 'a', asteroid: 'a', volcano: 'b', button: 'a' }, prep = s => s) => {
  const s = prep(E.newState());
  let t = 0; const log = [];
  while (t < 6 * 3600) {
    const pps = E.prodPerSec(s);
    E.earn(s, pps + tapsPerSec * E.tapValue(s, pps));
    t++;
    // Sprung?
    if (s.epoch <= 7 && s.complexity >= E.leapCost(s, s.epoch)) {
      s.complexity -= E.leapCost(s, s.epoch);
      log.push(`${(t/60).toFixed(1)}min Sprung ${s.epoch+1}`);
      if (s.epoch === 7) { return { t, log }; }
      s.epoch++;
      const ev = { 2: 'oxygen', 4: 'asteroid', 6: 'button' }[s.epoch];
      if (ev) { s.choices[ev] = choices[ev]; if (choices[ev]==='a' && ev!=='button') E.catastropheLoss(s, ev==='oxygen'?0.5:0.6); }
      if (s.epoch === 4) s.choices.volcano = choices.volcano;
      continue;
    }
    // bester Generator nach Amortisation
    for (let k = 0; k < 20; k++) {
      let best = -1, bestR = Infinity;
      for (let i = 0; i < (s.epoch + 1) * 3; i++) {
        const c = E.genCost(s, i); const before = E.genProd(s, i); s.owned[i]++; const gain = E.genProd(s, i) - before; s.owned[i]--;
        const r = c / gain; if (r < bestR) { bestR = r; best = i; }
      }
      const lc = E.leapCost(s, s.epoch);
      if (best >= 0 && s.complexity >= E.genCost(s, best) && E.genCost(s, best) < lc * 0.25) { s.complexity -= E.genCost(s, best); s.owned[best]++; } else break;
    }
  }
  return { t, log };
};
const r = run(+process.argv[2] || 2);
console.log(r.log.join('\n')); console.log('Ende:', (r.t/60).toFixed(1), 'min');
const r2 = run(2, undefined, s => { s.runsDone = 1; s.constants = { g: 3, s: 3, em: 3, c: 3, x: 3 }; return s; });
console.log('Durchlauf 2 (Konstanten 3/3/3/3/3):', (r2.t/60).toFixed(1), 'min');
