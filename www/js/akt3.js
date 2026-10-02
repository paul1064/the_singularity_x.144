// ─────────────────────────────────────────────────────────────
//  AKT III — DAS SPIEGELUNIVERSUM
//  Acht Spiegel im Ring, jeder spiegelt eine Vitrine deines Museums. Jeder Spiegel hat eine Licht- und eine
//  Schattenseite (Erinnern / Loslassen). Hältst du beide im Gleichgewicht, lädt sich der Einklang auf.
//  Mit jedem Spiegelsprung schreibst du einen Satz an die, die nach dir kommen: Es sind die Briefe, die du bekommen hast.
//  createAkt3(ctx) wird von main.js aufgerufen.
// ─────────────────────────────────────────────────────────────
import { MIRRORS, KAPITEL, LETTER, LETTER_HEAD, ENDINGS3, WAHR_BRIEF, INTRO3, FINAL3, POWERS } from './akt3data.js';
import * as A from './akt3econ.js';
import * as MU from './museum.js';
import { SpiegelKlang } from './akt3audio.js';
import { fmt, fmtRate } from './format.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const MAX_FINGERS = 5;
const LICHT = '#fff3b0', SCHATTEN = '#8f6bff';

export function createAkt3(C) {
  const $ = C.$;
  const st = () => C.getS();
  const a = () => st().a3;
  let fx = null, active = false, busy = false, uiT = 0, saveT = 0, klT = 0, buyN = 1, tab = 'spiegel', t = 0, rowKey = '', wasHarm = false;
  const pointers = new Map();
  const cv = $('a3c'), g = cv.getContext('2d');
  const K = new SpiegelKlang(C.music);
  let W = 0, H = 0, dpr = 1, geo = { cx: 0, cy: 0, rx: 0, ry: 0, top: 0, bottom: 0, pw: 34, ph: 54 };

  // ── Berechnung ──────────────────────────────────────────────
  function extra() {
    const S = st(), prog = MU.progress(S);
    const vit = MIRRORS.map((m) => { const p = prog.find((x) => x.id === m.vit); return p ? p.found / p.total : 0; });
    const meta = (1 + 0.03 * S.endings.length) * (1 + 0.02 * Math.min(10, S.pantheon.length)) * (1 + 0.015 * Math.min(20, S.bossWins || 0));
    return { vit, dim: S.a2 ? S.a2.dim : 0, meta };
  }
  function recalc() { fx = A.computeFx(a(), extra()); }
  const pps = () => A.prodPerSec(a(), fx);

  // ── Layout & Zeichnen ───────────────────────────────────────
  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const land = W > H, pr = $('a3panel').getBoundingClientRect();
    const availW = land ? W - 400 : W, top = land ? 150 : 268;      // unter der Kräfteleiste (Dock) und der Gleichgewichtsskala
    const bottom = land ? H - 40 : Math.max(top + 190, pr.top - 22);
    const cx = availW / 2, cy = (top + bottom) / 2, rx = Math.min(availW * 0.36, 150), ry = Math.min((bottom - top) * 0.4, 140);
    geo = { cx, cy, rx, ry, top, bottom, availW, pw: clamp(rx * 0.24, 28, 38), ph: clamp(ry * 0.44, 38, 64) };
  }
  const mirrorPos = (k) => { const th = -Math.PI / 2 + k * Math.PI * 2 / A.NUM; return { x: geo.cx + Math.cos(th) * geo.rx, y: geo.cy + Math.sin(th) * geo.ry }; };
  function hitMirror(x, y) {
    const al = a();
    for (let k = 0; k < A.NUM; k++) {
      if (!A.unlocked(al, k)) continue;
      const p = mirrorPos(k);
      if (Math.abs(x - p.x) < geo.pw / 2 + 8 && Math.abs(y - p.y) < geo.ph / 2 + 8) return { k, side: x < p.x ? 'licht' : 'schatten', p };
    }
    return null;
  }
  function draw() {
    if (!active || !fx) return;
    const al = a(), b = A.balance(al, fx);
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const { cx, cy } = geo;
    // Gleichgewichtsskala
    const bw = Math.min(210, geo.availW - 60), by = geo.top - 40;
    g.save(); g.textAlign = 'center';
    g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(cx - bw / 2, by, bw, 6);
    const zone = (1 - A.T3.band) / 2;
    g.fillStyle = hexA('#7cf29c', 0.4); g.fillRect(cx - bw * zone, by, bw * zone * 2, 6);
    const needleX = cx - bw / 2 + bw * b.G;
    g.fillStyle = hexA(SCHATTEN, 0.6); g.fillRect(cx - bw / 2, by, 6, 6); g.fillStyle = hexA(LICHT, 0.8); g.fillRect(cx + bw / 2 - 6, by, 6, 6);
    g.fillStyle = A.harmonized(al, fx) ? '#7cf29c' : '#ffffff'; g.beginPath(); g.moveTo(needleX, by - 3); g.lineTo(needleX - 5, by - 10); g.lineTo(needleX + 5, by - 10); g.closePath(); g.fill();
    g.font = '600 9.5px "Space Grotesk", system-ui, sans-serif'; g.fillStyle = hexA(SCHATTEN, 0.9); g.textAlign = 'left'; g.fillText('SCHATTEN', cx - bw / 2, by + 19);
    g.fillStyle = hexA(LICHT, 0.95); g.textAlign = 'right'; g.fillText('LICHT', cx + bw / 2, by + 19);
    g.textAlign = 'center'; g.fillStyle = '#ffffff'; g.fillText(`GLEICHGEWICHT ×${fmt(A.balMult(b.bal))}`, cx, by + 19);
    g.fillStyle = 'rgba(124,242,156,.9)'; g.fillText(`EINKLANG ${Math.floor(al.einklang)} %`, cx, by + 32);
    g.restore();
    // Verbindungen
    const lit = A.links(al);
    for (let k = 0; k < A.NUM; k++) {
      const j = (k + 1) % A.NUM, pa = mirrorPos(k), pb = mirrorPos(j), on = lit.some((l) => l[0] === k);
      g.strokeStyle = on ? hexA('#ffffff', 0.7) : 'rgba(255,255,255,.08)'; g.lineWidth = on ? 2 : 1;
      if (on) { g.shadowColor = '#ffffff'; g.shadowBlur = 8; }
      g.beginPath(); g.moveTo(pa.x, pa.y); g.lineTo(pb.x, pb.y); g.stroke(); g.shadowBlur = 0;
      if (on) { const f = (t * 0.3 + k * 0.2) % 1; g.fillStyle = '#fff'; g.beginPath(); g.arc(pa.x + (pb.x - pa.x) * f, pa.y + (pb.y - pa.y) * f, 2.2, 0, Math.PI * 2); g.fill(); }
    }
    // Mitte: das Ich, halb Licht, halb Schatten, mit Einklang-Ring
    const R = 34, e = al.einklang / A.T3.einklangMax;
    g.save(); g.translate(cx, cy); g.rotate(t * (0.25 + 0.5 * e));
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, R * 2.8); gr.addColorStop(0, hexA(e > 0.5 ? '#ffffff' : LICHT, 0.3 + 0.3 * e)); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, R * 2.8, 0, Math.PI * 2); g.fill();
    g.fillStyle = hexA(LICHT, 0.35 + 0.65 * b.G); g.beginPath(); g.arc(0, 0, R, Math.PI / 2, -Math.PI / 2); g.fill();
    g.fillStyle = hexA(SCHATTEN, 0.35 + 0.65 * (1 - b.G)); g.beginPath(); g.arc(0, 0, R, -Math.PI / 2, Math.PI / 2); g.fill();
    g.lineWidth = 2; g.strokeStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.stroke();
    g.restore();
    g.save(); g.lineWidth = 5; g.lineCap = 'round'; g.strokeStyle = hexA('#7cf29c', 0.9); g.shadowColor = '#7cf29c'; g.shadowBlur = e > 0.99 ? 14 : 4;
    g.beginPath(); g.arc(cx, cy, R + 10, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * e); g.stroke(); g.restore();
    g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.shadowColor = '#000'; g.shadowBlur = 6; g.font = '700 14px "Space Grotesk", system-ui, sans-serif';
    g.fillText(`${Math.floor(al.einklang)} %`, cx, cy); g.restore();
    // Spiegel
    for (let k = 0; k < A.NUM; k++) {
      const m = MIRRORS[k], p = mirrorPos(k), un = A.unlocked(al, k), w = geo.pw, h = geo.ph, n = A.total(al, k);
      const can = un && al.mem >= A.genCost(al, k, 1);
      g.save(); g.translate(p.x, p.y);
      if (un && n > 0) { const gl = g.createRadialGradient(0, 0, 0, 0, 0, w * 1.9); gl.addColorStop(0, hexA(m.color, 0.35)); gl.addColorStop(1, hexA(m.color, 0)); g.fillStyle = gl; g.beginPath(); g.arc(0, 0, w * 1.9, 0, Math.PI * 2); g.fill(); }
      const rr = (x, y, ww, hh, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + ww, y, x + ww, y + hh, r); g.arcTo(x + ww, y + hh, x, y + hh, r); g.arcTo(x, y + hh, x, y, r); g.arcTo(x, y, x + ww, y, r); g.closePath(); };
      g.save(); rr(-w / 2, -h / 2, w, h, 10); g.clip();
      const ls = n > 0 ? al.lic[k] / n : 0.5;
      g.fillStyle = un ? hexA(LICHT, 0.1 + 0.4 * ls) : 'rgba(255,255,255,.04)'; g.fillRect(-w / 2, -h / 2, w / 2, h);
      g.fillStyle = un ? hexA(SCHATTEN, 0.1 + 0.4 * (1 - ls)) : 'rgba(255,255,255,.04)'; g.fillRect(0, -h / 2, w / 2, h);
      if (un) { g.fillStyle = 'rgba(255,255,255,.07)'; g.beginPath(); g.moveTo(-w / 2, h / 2); g.lineTo(-w / 2, -h * 0.1); g.lineTo(w / 2, -h / 2); g.lineTo(w / 2, -h * 0.3); g.closePath(); g.fill(); }   // Glanz
      g.restore();
      g.lineWidth = can ? 2.4 : 1.6; g.strokeStyle = hexA(m.color, un ? (can ? 1 : 0.7) : 0.2);
      if (can) { g.shadowColor = m.color; g.shadowBlur = 6 + Math.sin(t * 5) * 3; }
      rr(-w / 2, -h / 2, w, h, 10); g.stroke(); g.shadowBlur = 0;
      g.strokeStyle = 'rgba(255,255,255,.15)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -h / 2 + 4); g.lineTo(0, h / 2 - 4); g.stroke();
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.font = `700 ${Math.round(w * 0.36)}px "Space Grotesk", system-ui, sans-serif`;
      if (un) { g.fillStyle = hexA(LICHT, 1); g.fillText(String(al.lic[k]), -w / 4, 0); g.fillStyle = '#c9b8ff'; g.fillText(String(al.sch[k]), w / 4, 0); } else { g.fillStyle = 'rgba(255,255,255,.3)'; g.fillText('?', 0, 0); }
      if (un) { g.font = '600 8.5px "Space Grotesk", system-ui, sans-serif'; g.fillStyle = 'rgba(255,255,255,.7)'; g.fillText(m.unit, 0, h / 2 + 10); }
      g.restore();
    }
  }

  // ── Eingabe ─────────────────────────────────────────────────
  cv.addEventListener('pointerdown', (e) => {
    if (!active || busy || !fx || C.modalOpen()) return;
    pointers.set(e.pointerId, 1);
    if (pointers.size > MAX_FINGERS) return;
    const h = hitMirror(e.clientX, e.clientY);
    if (h) { buy(h.k, h.side, e.clientX, e.clientY); return; }
    tap(e.clientX, e.clientY);
  });
  const up = (e) => pointers.delete(e.pointerId);
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

  let lastSfx = 0, lastVib = 0;
  function tap(x, y) {
    const al = a(), v = A.tapValue(al, fx);
    A.earn(al, v); al.taps++;
    C.world.burst(x, y, LICHT, 7);
    C.world.floater(x + (Math.random() - 0.5) * 40, y - 12 - Math.random() * 16, '+' + fmt(v), '#fff3b0');
    const now = performance.now();
    if (now - lastSfx > 45) { K.tap(); lastSfx = now; }
    if (now - lastVib > 60) { C.vibrate(6); lastVib = now; }
  }
  const buyAmount = (k) => (buyN === 'max' ? Math.max(1, A.maxAffordable(a(), k)) : buyN);
  function buy(k, side, x, y) {
    const al = a();
    if (!A.unlocked(al, k)) { C.vibrate(15); C.world.floater(x, y - 20, 'Noch verhüllt', '#8a93b8'); return; }
    const n = buyAmount(k), cost = A.genCost(al, k, n);
    if (al.mem < cost) { C.vibrate(20); C.world.floater(x, y - 24, 'Zu wenig Erinnerung', '#8a93b8'); return; }
    const ms0 = A.msMult(A.total(al, k)), l0 = A.links(al).length;
    A.buy(al, fx, k, side, n);
    K.buy(side, k); C.vibrate(side === 'licht' ? 10 : 18);
    C.world.burst(x, y, side === 'licht' ? LICHT : SCHATTEN, 14, 1.1);
    if (A.msMult(A.total(al, k)) > ms0) C.world.floater(x, y - 34, `${MIRRORS[k].name} ×${(A.msMult(A.total(al, k)) / ms0).toFixed(1).replace('.', ',')}`, '#fff');
    if (A.links(al).length > l0) { C.world.floater(geo.cx, geo.top - 52, 'Verbindung leuchtet auf', '#ffffff'); C.world.doFlash('#ffffff', 0.2); C.vibrate([20, 30, 20]); }
    refreshRows(); updateHud(); updateLeap();
  }
  function autoBalance() {
    const al = a(); if (busy || !fx || C.modalOpen()) return;
    const s = A.suggest(al, fx); if (!s) return;
    const side = s.side, p = mirrorPos(s.k);
    if (al.mem < A.genCost(al, s.k, 1)) { C.vibrate(20); C.world.floater(p.x, p.y - 30, `Brauche ${fmt(A.genCost(al, s.k, 1))} ✦`, '#8a93b8'); return; }
    buy(s.k, side, p.x, p.y);
  }

  // ── Kräfte ──────────────────────────────────────────────────
  function firePower(side) {
    const al = a(), pw = POWERS[side];
    if (busy || C.modalOpen() || !fx) return;
    if (al.cd[side] > 0) { C.vibrate(15); C.world.floater(C.world.cx, C.world.cy - 60, `${pw.name} · noch ${Math.ceil(al.cd[side])} s`, '#fff'); return; }
    al.cd[side] = pw.cd; K.power(side); C.vibrate([20, 30, 60]); C.world.doFlash(pw.color, 0.3); C.world.burst(C.world.cx, C.world.cy, pw.color, 40, 1.5);
    C.world.floater(C.world.cx, C.world.cy - 70, pw.name, pw.color);
    if (side === 'licht') { const old = al.buffs.find((x) => x.id === 'erinnern'); if (old) old.t = 15; else al.buffs.push({ id: 'erinnern', n: 'Erinnern', k: 'tap', m: 5, t: 15 }); }
    else { const gain = pps() * 150; A.earn(al, gain); C.world.floater(C.world.cx, C.world.cy - 40, `+${fmt(gain)} ✦`, '#fff'); }
    buildDock(); updateBuffs(); updateHud();
  }

  // ── Oberfläche ──────────────────────────────────────────────
  function updateHud() {
    const al = a(), S = st();
    $('amount').textContent = fmt(al.mem);
    $('rate').textContent = `+${fmtRate(pps())} /s`;
    $('universeLabel').textContent = `UNIVERSUM ${S.universe} · DAS SPIEGELUNIVERSUM${al.run > 1 ? ` · DURCHGANG ${al.run}` : ''}`;
    $('epochLabel').textContent = al.kap >= A.LAST_KAP ? 'Die Große Spiegelung' : `Kapitel ${al.kap + 1} · ${MIRRORS[al.kap].name}`;
    document.documentElement.style.setProperty('--accent', '#cdbbff');
  }
  function updateBuffs() {
    const al = a();
    $('buffs').innerHTML = al.buffs.map((x) => `<b>${x.n} ×${fmt(x.m)} · ${Math.ceil(x.t)} s</b>`).join('');
  }
  function buildDock() {
    const al = a(), dock = $('dock'); dock.innerHTML = '';
    const mk = (id, ic, col, label, cd, max, fn) => {
      const b = document.createElement('button'); b.className = 'av' + (cd <= 0 ? ' ready' : ''); b.dataset.id = id; b.style.setProperty('--c', col); b.style.setProperty('--p', Math.max(0, cd / max * 100).toFixed(1));
      b.setAttribute('aria-label', label); b.innerHTML = `<span>${ic}</span>`; C.onTap(b, fn); dock.appendChild(b);
    };
    mk('licht', 'E', POWERS.licht.color, `${POWERS.licht.name}: ${POWERS.licht.text}`, al.cd.licht, POWERS.licht.cd, () => firePower('licht'));
    mk('schatten', 'L', POWERS.schatten.color, `${POWERS.schatten.name}: ${POWERS.schatten.text}`, al.cd.schatten, POWERS.schatten.cd, () => firePower('schatten'));
    mk('_auto', 'A', '#7cf29c', 'Ausgleichen: kauft auf der schwächeren Seite', 0, 1, autoBalance);
  }
  function updateDock() {
    const al = a();
    for (const b of $('dock').children) {
      const id = b.dataset.id; if (id === '_auto') continue;
      const cd = al.cd[id], max = POWERS[id].cd; b.classList.toggle('ready', cd <= 0); b.style.setProperty('--p', Math.max(0, cd / max * 100).toFixed(1));
    }
  }
  function buildRows() {
    const al = a(), box = $('a3Rows'); box.innerHTML = '';
    const idx = []; for (let k = A.NUM - 1; k >= 0; k--) if (A.unlocked(al, k)) idx.push(k);
    rowKey = idx.join(',');
    for (const k of idx) {
      const m = MIRRORS[k], row = document.createElement('div'); row.className = 'mrow'; row.dataset.k = k; row.style.setProperty('--c', m.color);
      row.innerHTML = `<div class="mh"><b>${m.name}</b><small>${m.desc}</small><div class="pr"></div><div class="ms"><i></i></div></div>
        <button class="mbtn licht" data-s="licht"><b></b><small></small></button><button class="mbtn schatten" data-s="schatten"><b></b><small></small></button>`;
      for (const bt of row.querySelectorAll('.mbtn')) C.onTap(bt, () => buy(k, bt.dataset.s, C.world.cx, C.world.cy));
      box.appendChild(row);
    }
    refreshRows();
  }
  function refreshRows() {
    const al = a(); if (!fx) return;
    const want = []; for (let k = A.NUM - 1; k >= 0; k--) if (A.unlocked(al, k)) want.push(k);
    if (want.join(',') !== rowKey) { buildRows(); return; }
    for (const row of $('a3Rows').querySelectorAll('.mrow')) {
      const k = +row.dataset.k, n = buyAmount(k), cost = A.genCost(al, k, n), can = al.mem >= cost, own = A.total(al, k);
      for (const bt of row.querySelectorAll('.mbtn')) {
        bt.classList.toggle('can', can); const s = bt.dataset.s;
        bt.querySelector('b').textContent = `${s === 'licht' ? 'Licht' : 'Schatten'} · ${fmt(cost)} ✦`; bt.querySelector('small').textContent = `${s === 'licht' ? al.lic[k] : al.sch[k]} Stück · ×${n}`;
      }
      const p = A.sideProd(al, fx, k, 'licht') + A.sideProd(al, fx, k, 'schatten');
      row.querySelector('.pr').textContent = own ? `${fmtRate(p)} /s · Museum ×${fx.hist[k].toFixed(2).replace('.', ',')}` : `Museum ×${fx.hist[k].toFixed(2).replace('.', ',')}`;
      const nxt = [3, 7, 12, 22, 33, 72, 144].find((m) => m > own), prv = [...[3, 7, 12, 22, 33, 72, 144]].reverse().find((m) => m <= own) || 0;
      row.querySelector('.ms i').style.width = nxt ? `${(own - prv) / (nxt - prv) * 100}%` : '100%';
    }
  }
  function updateLeap() {
    const al = a(), box = $('a3Leap'); if (!fx) return;
    const cost = A.leapCost(al), final = al.kap === A.LAST_KAP, enough = al.mem >= cost, ready = enough && (!final || A.finalReady(al));
    if (!box.firstChild) { box.innerHTML = '<button class="leap"><div class="k"></div><div class="n"></div><div class="bar"><i></i></div><div class="c"><span></span><b></b></div></button>'; C.onTap(box.firstChild, doLeap); }
    const el = box.firstChild;
    el.classList.toggle('ready', ready);
    el.querySelector('.k').textContent = final ? 'DIE VERSÖHNUNG' : `SPIEGELSPRUNG ${al.kap + 1}/8`;
    el.querySelector('.n').textContent = KAPITEL[al.kap].leap;
    el.querySelector('.bar i').style.width = `${Math.min(100, al.mem / cost * 100)}%`;
    el.querySelector('.c span').textContent = `${fmt(Math.min(al.mem, cost))} / ${fmt(cost)} ✦`;
    el.querySelector('.c b').textContent = ready ? 'BEREIT' : final && enough ? `Einklang ${Math.floor(al.einklang)} / 100 %` : '';
  }
  function buildBriefe() {
    const al = a(), S = st(), box = $('a3-brief');
    const draft = al.lines.length ? `<div class="a2card"><h4>${LETTER_HEAD}</h4>${A.letterText(al.lines).map((l) => `<div class="rd"><p><i>${l}</i></p></div>`).join('')}<small>Dein Brief in diesem Durchgang (${al.lines.length}/8)</small></div>` : '<div class="a2card locked">Mit jedem Spiegelsprung schreibst du einen Satz an die, die nach dir kommen.</div>';
    const old = al.letters.map((l) => `<div class="a2card"><h4>Durchgang ${l.run}: ${ENDINGS3[l.ending].name}</h4>${A.letterText(l.lines).map((x) => `<div class="rd"><p><i>${x}</i></p></div>`).join('')}</div>`).join('');
    box.innerHTML = `<div class="rd-note" style="margin:6px 2px 10px">Die Briefe, die du in den Universen gefunden hast, trugen eine Handschrift. Hier schreibst du sie.</div>${draft}${old}
      <div class="a2card"><h4>Das Wahre Ende</h4><div class="rd"><p>${wahrOk() ? 'Alle Voraussetzungen sind erfüllt. Halte deinen Brief ausgewogen, und die Versöhnung wird dir etwas zeigen.' : 'Verborgen. Sammle im Museum alle Enden und alle Briefe, und halte deinen Brief ausgewogen.'}</p></div><small>Enden ${MU.progress(S).find((p) => p.id === 'ende').found}/6 · Briefe ${MU.progress(S).find((p) => p.id === 'brief').found}/10</small></div>`;
  }
  const wahrOk = () => { const p = MU.progress(st()); return p.find((x) => x.id === 'ende').full && p.find((x) => x.id === 'brief').full; };
  function refreshAll() { updateHud(); updateBuffs(); buildDock(); buildRows(); updateLeap(); buildBriefe(); }
  function setTab(k) {
    tab = k;
    document.querySelectorAll('#a3panel .tab').forEach((b) => b.classList.toggle('active', b.dataset.a3tab === k));
    for (const id of ['spiegel', 'brief']) $('a3-' + id).classList.toggle('hidden', id !== k);
    if (k === 'brief') buildBriefe();
  }
  document.querySelectorAll('#a3panel .tab').forEach((b) => C.onTap(b, () => setTab(b.dataset.a3tab)));
  document.querySelectorAll('#a3Buy button').forEach((b) => C.onTap(b, () => {
    buyN = b.dataset.n === 'max' ? 'max' : +b.dataset.n;
    document.querySelectorAll('#a3Buy button').forEach((x) => x.classList.toggle('active', x === b));
    if (active) refreshRows();
  }));
  C.onTap($('a3Auto'), autoBalance);
  window.addEventListener('resize', () => { if (active) layout(); });

  // ── Fenster ─────────────────────────────────────────────────
  function ask(html, label = 'Weiter') {
    return new Promise((res) => { C.openModal(`${html}<button class="btn" id="a3ok">${label}</button>`, false); $('a3ok').onclick = () => { C.closeModal(); res(); }; });
  }
  async function cine(lines, hold = 2400) {
    const ov = $('overlay'); ov.classList.remove('hidden'); document.body.classList.add('cine-mode');
    for (const l of lines) { ov.innerHTML = `<div class="cine">${l}</div>`; await wait(60); ov.firstChild.classList.add('on'); await wait(hold); ov.firstChild.classList.remove('on'); await wait(1300); }
    ov.classList.add('hidden'); ov.innerHTML = ''; document.body.classList.remove('cine-mode');
  }
  // Ein Satz für den Brief
  function showLetter(k) {
    busy = true; K.letter(); C.world.doFlash('#cdbbff', 0.3);
    const L = LETTER[k], tp = { a: ['Licht', LICHT], b: ['Schatten', '#c9b8ff'], c: ['Mitte', '#9fe9e0'] };
    const opt = (c) => `<button class="choice-btn" data-k="${c}" style="border-color:${hexA(tp[c][1], 0.35)}"><b style="font-family:'Cormorant',serif;font-style:italic;font-size:18px;font-weight:600">${L[c]}</b><span style="color:${tp[c][1]}">${tp[c][0]}</span></button>`;
    C.openModal(`<div class="kicker" style="color:#cdbbff">DER BRIEF · SATZ ${k + 1}/8</div><h2>${LETTER_HEAD}</h2><p>${L.prompt}</p>${opt('a')}${opt('b')}${opt('c')}`, false);
    for (const b of $('modalCard').querySelectorAll('.choice-btn')) b.onclick = async () => {
      const al = a(); al.lines[k] = b.dataset.k; al.pendingLetter = null; C.closeModal(); C.vibrate(30); C.world.burst(C.world.cx, C.world.cy, '#cdbbff', 40, 1.4);
      busy = false; save();
      if (al.finalLeap) { await finale(); return; }
      C.say([KAPITEL[al.kap].line], 'plural'); recalc(); refreshAll();
    };
  }
  function queue() {
    const al = a();
    if (busy || C.modalOpen() || !active) return;
    if (al.pendingLetter !== null && al.pendingLetter !== undefined) showLetter(al.pendingLetter);
  }

  // ── Spiegelsprung, Finale ───────────────────────────────────
  function doLeap() {
    const al = a();
    if (busy || !fx || C.modalOpen()) return;
    const cost = A.leapCost(al), final = al.kap === A.LAST_KAP;
    if (al.mem < cost || (final && !A.finalReady(al))) { C.vibrate(20); if (final && al.mem >= cost) C.world.floater(C.world.cx, C.world.cy - 50, 'Halte das Gleichgewicht, bis der Einklang voll ist', '#7cf29c'); return; }
    al.mem -= cost; al.pendingLetter = al.kap;
    if (final) al.finalLeap = true; else al.kap++;
    K.leap(); C.music.boom(); C.vibrate(40); C.world.doFlash('#cdbbff', 0.8); C.world.shake = 0.5; C.world.burst(C.world.cx, C.world.cy, '#cdbbff', 70, 2);
    recalc(); refreshAll(); save();
  }
  async function finale() {
    const al = a(), S = st();
    busy = true; al.finished = true; save();
    K.finale(); C.music.boom(true); C.world.doFlash('#ffffff', 1);
    await cine(FINAL3);
    const wok = wahrOk(), key = A.endingKey(al, wok), en = ENDINGS3[key];
    const lines = A.letterText(al.lines);
    await ask(`<div class="kicker" style="color:#cdbbff">DER BRIEF</div><h2>${LETTER_HEAD}</h2>${lines.map((l) => `<p class="quote" style="font-size:18px;margin:0 0 8px">${l}</p>`).join('')}<div class="rd-note">— Ich</div>`, 'Versiegeln');
    if (key === 'wahr') await cine(WAHR_BRIEF, 2800);
    else if (!wok && Math.abs(A.tone(al.lines)) <= 2) await ask('<div class="kicker" style="color:#8a93b8">ETWAS FEHLT NOCH</div><p class="quote">Die Handschrift kommt dir bekannt vor, aber du kannst sie noch nicht lesen.</p><div class="rd-note">Das Wahre Ende verlangt, dass du im Museum alle Enden und alle Briefe gefunden hast.</div>', 'Weiter');
    const fresh = !al.seals.includes(key);
    await ask(`<div class="kicker" style="color:${en.color}">DAS ENDE DES SPIEGELS${fresh ? ' · NEUES SIEGEL' : ''}</div><h2>${en.name}</h2><p class="quote">${en.text}</p>${fresh ? '<div class="rd-fx">Neues Siegel: Alle Spiegel dauerhaft +10 % Produktion</div>' : ''}`, key === 'wahr' ? 'Ich bin du' : 'Weiter');
    if (!al.preview) C.pushChronik({ u: S.universe, akt: 3, run: al.run, ending: en.name, min: Math.round(al.playTime / 60), seals: al.seals.length + (fresh ? 1 : 0) });
    al.letters.push({ run: al.run, lines: [...al.lines], ending: key });
    if (fresh) al.seals.push(key);
    al.run++; A.resetRun(al); recalc(); layout(); refreshAll(); busy = false; save();
    C.world.doFlash('#ffffff', 1);
    C.say(['Der Spiegel beginnt von vorn. Dein Brief ist unterwegs.'], 'plural');
  }

  // ── Betreten/verlassen, Takt ────────────────────────────────
  async function enter(preview = false) {
    const S = st();
    S.akt = 3; if (!S.a3) S.a3 = A.newA3();
    S.a3.preview = (!!preview || !!S.a3.preview) && !(S.a2 && S.a2.dim >= 9);   // Vorschau: Rückweg nach Akt I möglich
    active = true; busy = false;
    document.body.classList.add('akt3'); cv.classList.remove('hidden'); $('a3panel').classList.remove('hidden');
    C.world.mode = 'a2'; C.world.z = 7; C.world.zTarget = 7; C.world.zMax = 7;
    C.music.setLevel(8);
    layout(); recalc(); refreshAll(); setTab('spiegel'); K.start(); save();
    if (S.a3.finished) { finale(); return; }          // Neustart mitten im Finale: noch einmal von vorn
    if (!S.a3.introSeen) { busy = true; S.a3.introSeen = true; save(); await cine(INTRO3, 2600); C.say([KAPITEL[0].line], 'plural'); busy = false; }
  }
  function leave() {
    const S = st(); active = false; busy = false; K.stop(); S.akt = 1;
    document.body.classList.remove('akt3'); cv.classList.add('hidden'); $('a3panel').classList.add('hidden');
    $('dock').innerHTML = ''; $('buffs').innerHTML = ''; save();
  }
  function save() { C.save(); }
  function frame(dt) {
    if (!active) return;
    const al = a(); t += dt;
    if (!fx) recalc();
    if (!al.finished && !busy) {
      A.earn(al, pps() * dt); al.playTime += dt;
      const h = A.tick(al, fx, dt);
      if (h && !wasHarm) { K.harmony(); C.world.floater(geo.cx, geo.top - 52, 'Gleichgewicht', '#7cf29c'); }
      wasHarm = h;
      for (const x of al.buffs) x.t -= dt;
      const n = al.buffs.length; al.buffs = al.buffs.filter((x) => x.t > 0); if (al.buffs.length !== n) updateBuffs();
      for (const s of ['licht', 'schatten']) if (al.cd[s] > 0) al.cd[s] = Math.max(0, al.cd[s] - dt);
    }
    uiT += dt; saveT += dt; klT += dt;
    if (klT > 1) { klT = 0; const b = A.balance(al, fx); K.setState(b.G, al.einklang); }
    if (uiT > 0.25) { uiT = 0; updateHud(); updateDock(); refreshRows(); updateLeap(); if (al.buffs.length) updateBuffs(); queue(); }
    if (saveT > 10) { saveT = 0; save(); }
  }
  function offline(sec) {
    const al = a(); if (!active || !fx || al.finished) return;
    const away = Math.min(sec, A.T3.offlineHours * 3600); if (away < 30) return;
    const gain = pps() * away * A.offlineEff(); A.earn(al, gain);
    for (const s of ['licht', 'schatten']) al.cd[s] = Math.max(0, al.cd[s] - away);
    C.world.floater(C.world.cx, C.world.cy, `+${fmt(gain)} ✦ (offline)`, '#fff3b0');
  }

  return {
    enter, leave, frame, draw, offline, layout, recalc, refreshAll,
    get active() { return active; },
    dev: { get fx() { return fx; }, buy, doLeap, finale, queue, firePower, autoBalance, showLetter, wahrOk, setBusy(v) { busy = v; } },
  };
}
