// Zahlenformat auf Deutsch: 1.234 · 12,3 Tsd · 4,56 Mio · … · 1,2e39
const UNITS = ['', 'Tsd', 'Mio', 'Mrd', 'Bio', 'Brd', 'Trio', 'Trd', 'Quad', 'Qird', 'Quin', 'Qind', 'Sext'];

export function fmt(n) {
  if (!isFinite(n)) return '∞';
  if (n < 0) return '−' + fmt(-n);
  if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1).replace('.', ',') : Math.floor(n).toString();
  if (n < 1e5) return Math.floor(n).toLocaleString('de-DE');
  const e = Math.floor(Math.log10(n) / 3);
  if (e >= UNITS.length) {
    const exp = Math.floor(Math.log10(n));
    return (n / Math.pow(10, exp)).toFixed(2).replace('.', ',') + 'e' + exp;
  }
  const v = n / Math.pow(1000, e);
  return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)).replace('.', ',') + ' ' + UNITS[e];
}

export function fmtRate(n) {
  return n < 10 ? n.toFixed(1).replace('.', ',') : fmt(n);
}
