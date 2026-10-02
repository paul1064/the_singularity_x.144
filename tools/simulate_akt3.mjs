// Balance-Simulator Akt III: node tools/simulate_akt3.mjs [hist] [dim] [seals]
import * as A from '../www/js/akt3econ.js';
const hist = +(process.argv[2] ?? 0), dim = +(process.argv[3] ?? 0), seals = +(process.argv[4] ?? 0), TAPS = 2;
const a3 = A.newA3(); a3.seals = new Array(seals).fill('x');
const fx = A.computeFx(a3, { vit: new Array(8).fill(hist), dim, meta: 1 });
let t = 0, last = 0; const dt = 0.25; const times = [];
while (t < 3 * 3600 && !a3.finished) {
  A.earn(a3, A.prodPerSec(a3, fx) * dt + TAPS * dt * A.tapValue(a3, fx)); t += dt;
  A.tick(a3, fx, dt);
  // kaufen: auf der schwächeren Seite das beste Preis-Leistungs-Verhältnis (ideales Spiel)
  for (let guard = 0; guard < 20; guard++) {
    const s = A.suggest(a3, fx);
    if (!s || a3.mem < s.cost) break;
    A.buy(a3, fx, s.k, s.side, 1);
  }
  const cost = A.leapCost(a3);
  if (a3.mem >= cost && (a3.kap < A.LAST_KAP || A.finalReady(a3))) {
    a3.mem -= cost;
    times.push([a3.kap, Math.round(t - last)]); last = t;
    if (a3.kap === A.LAST_KAP) { a3.finished = true; break; }
    a3.kap++;
  }
}
console.log(`hist ×${1 + 0.5 * hist}, Dimensionen ${dim}, Siegel ${seals}`);
console.log('Kapitel (Sekunden):', times.map(([k, s]) => `${k + 1}:${s}`).join('  '));
console.log(`Gesamt: ${(t / 60).toFixed(1)} min, Einklang ${a3.einklang.toFixed(0)}, bal ${A.balance(a3, fx).bal.toFixed(2)}`);
