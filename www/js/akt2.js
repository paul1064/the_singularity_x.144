// ─────────────────────────────────────────────────────────────
//  AKT II — DER ORDEN
//  Du steuerst einen Geheimbund auf der Erde, der das Wissen der Menschheit vermehrt. Der Baum des Lebens
//  ist Karte und Bedienfeld. Deine Geburtsdaten verbinden sich mit dem Schicksal der Welt: Pro Durchgang
//  enthüllt eine Schicksalsebene mehr über dich und gibt dem Spiel einen spürbaren Bonus.
//  createAkt2(ctx) wird von main.js aufgerufen; ctx liefert Zustand, Fenster, Stimme und Musik.
// ─────────────────────────────────────────────────────────────
import { SEPHIROTH, AGES, AGE_EVENTS, MENTORS, DIMENSIONS, ORDEN_ENDEN, SACRED, gi } from './akt2data.js';
import * as A from './akt2econ.js';
import { analyse, SIGNS } from './mystik.js';
import { lesen, LAYER_TITLES, HINWEIS } from './akt2read.js';
import { fmt, fmtRate } from './format.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const MAX_FINGERS = 5;

export function createAkt2(C) {
  const $ = C.$;
  const st = () => C.getS();
  const a = () => st().a2;
  let fx = null, ana = null;
  let active = false, busy = false, uiT = 0, saveT = 0, buyN = 1, tab = 'orden', t = 0;
  let ritual = null, genKey = '';
  const pointers = new Map();
  const cv = $('a2c'), g = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, geo = { top: 0, bottom: 0, x0: 0, x1: 0, r: 14, availW: 0 };

  // ── Berechnung ──────────────────────────────────────────────
  function recalc() {
    const S = st(), a2 = S.a2;
    ana = a2.prof ? analyse(a2.prof) : null;
    a2.meta = (1 + 0.03 * S.endings.length) * (1 + 0.02 * Math.min(10, S.pantheon.length));
    fx = A.computeFx(a2, ana);
  }
  const pps = () => A.prodPerSec(a(), fx);
  const cur = () => AGES[a().age];

  // ── Layout & Zeichnen ───────────────────────────────────────
  function layout() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const land = W > H, pr = $('a2panel').getBoundingClientRect();
    const availW = land ? W - 400 : W, top = land ? 110 : 200;
    const bottom = land ? H - 40 : Math.max(top + 170, pr.top - 34);
    geo = { top, bottom, x0: availW * 0.09, x1: availW * 0.91, r: clamp((bottom - top) / 21, 10, 18), availW };
  }
  const nodePos = (i) => { const s = SEPHIROTH[i]; return { x: geo.x0 + s.x * (geo.x1 - geo.x0), y: geo.top + s.y * (geo.bottom - geo.top) }; };
  const nodeVisible = (i) => i < 10 || a().dim >= 1;
  function hitNode(x, y) {
    let best = -1, bd = 1e9;
    for (let i = 0; i < 11; i++) {
      if (!nodeVisible(i)) continue;
      const p = nodePos(i), d = Math.hypot(x - p.x, y - p.y);
      if (d < geo.r + 13 && d < bd) { best = i; bd = d; }
    }
    return best;
  }
  function sacredGeometry() {
    const a2 = a(), cx = geo.availW / 2, cy = (geo.top + geo.bottom) / 2, R = Math.min(geo.availW, geo.bottom - geo.top) * 0.2;
    g.save(); g.lineWidth = 1; g.strokeStyle = hexA('#ffd166', 0.05 + 0.012 * a2.age);
    const circle = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke(); };
    circle(cx, cy, R);
    const pts = [[cx, cy]];
    for (let k = 0; k < 6; k++) { const an = k * Math.PI / 3 + t * 0.02, x = cx + Math.cos(an) * R, y = cy + Math.sin(an) * R; circle(x, y, R); pts.push([x, y]); }
    if (a2.dim >= 1) for (let k = 0; k < 6; k++) { const an = k * Math.PI / 3 + Math.PI / 6 + t * 0.02, x = cx + Math.cos(an) * R * 1.732, y = cy + Math.sin(an) * R * 1.732; circle(x, y, R); pts.push([x, y]); }
    if (a2.dim >= 3) { g.strokeStyle = hexA('#c77dff', 0.07); for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[j][0], pts[j][1]); g.stroke(); } }
    if (a2.dim >= 6) { g.strokeStyle = hexA('#ffffff', 0.12); for (const off of [0, Math.PI / 3]) { g.beginPath(); for (let k = 0; k < 3; k++) { const an = off - Math.PI / 2 + k * 2 * Math.PI / 3 + t * 0.05; const x = cx + Math.cos(an) * R * 2.1, y = cy + Math.sin(an) * R * 2.1; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.stroke(); } }
    g.restore();
  }
  function draw() {
    if (!active || !fx) return;
    const a2 = a();
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    sacredGeometry();
    // Pfade
    const act = new Set(A.activePaths(a2));
    A.ALL_PATHS.forEach((p, idx) => {
      const i = gi(p.a), j = gi(p.b);
      if ((i === 10 || j === 10) && a2.dim < 1) return;
      const pa = nodePos(i), pb = nodePos(j), on = act.has(p);
      g.save(); g.lineCap = 'round';
      if (on) {
        g.strokeStyle = hexA('#ffd166', 0.85); g.lineWidth = 2; g.shadowColor = '#ffd166'; g.shadowBlur = 8;
        g.beginPath(); g.moveTo(pa.x, pa.y); g.lineTo(pb.x, pb.y); g.stroke();
        const f = (t * 0.35 + idx * 0.173) % 1;
        g.shadowBlur = 0; g.fillStyle = '#fff'; g.beginPath(); g.arc(pa.x + (pb.x - pa.x) * f, pa.y + (pb.y - pa.y) * f, 2.2, 0, Math.PI * 2); g.fill();
      } else {
        const both = A.genUnlocked(a2, i) && A.genUnlocked(a2, j);
        g.strokeStyle = `rgba(255,255,255,${both ? 0.16 : 0.06})`; g.lineWidth = 1;
        g.beginPath(); g.moveTo(pa.x, pa.y); g.lineTo(pb.x, pb.y); g.stroke();
      }
      g.restore();
    });
    // Sephiroth
    const hl = ritual && ritual.phase === 'show' ? ritual.seq[Math.floor(ritual.t / 0.8)] : -1;
    const lit = ritual && ritual.phase === 'show' && (ritual.t % 0.8) < 0.55;
    for (let i = 0; i < 11; i++) {
      if (!nodeVisible(i)) continue;
      const s = SEPHIROTH[i], p = nodePos(i), r = geo.r, n = a2.owned[i], un = A.genUnlocked(a2, i);
      const can = un && a2.wissen >= A.genCost(a2, fx, i, 1);
      g.save();
      if (n > 0 || (lit && hl === i)) {
        const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * (2.2 + Math.min(1.6, Math.log10(n + 1))));
        gr.addColorStop(0, hexA(s.color, lit && hl === i ? 0.9 : 0.42)); gr.addColorStop(1, hexA(s.color, 0));
        g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r * 4, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = '#080c1a'; g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill();
      g.lineWidth = can ? 2.4 : 1.6; g.strokeStyle = hexA(s.color, un ? (can ? 1 : 0.7) : 0.22);
      if (can) { g.shadowColor = s.color; g.shadowBlur = 6 + Math.sin(t * 5) * 3; }
      g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.stroke(); g.shadowBlur = 0;
      if (un && n > 0) {       // Fortschritt zur nächsten heiligen Zahl
        const nxt = SACRED.find((m) => m > n), prv = [...SACRED].reverse().find((m) => m <= n) || 0;
        g.lineWidth = 2; g.strokeStyle = hexA(s.color, 0.9);
        g.beginPath(); g.arc(p.x, p.y, r + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (nxt ? (n - prv) / (nxt - prv) : 1)); g.stroke();
      }
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = `700 ${Math.round(r * 0.85)}px "Space Grotesk", system-ui, sans-serif`;
      g.fillText(un ? (n > 0 ? String(n) : '+') : '?', p.x, p.y + 0.5);
      if (un) { g.font = '600 9.5px "Space Grotesk", system-ui, sans-serif'; g.fillStyle = hexA('#ffffff', 0.72); g.fillText(s.name, p.x, p.y + r + 11); }
      g.restore();
    }
    // Ritual-Text
    if (ritual) {
      g.save(); g.textAlign = 'center'; g.fillStyle = '#ffd166'; g.font = '600 15px "Cormorant", Georgia, serif'; g.shadowColor = '#000'; g.shadowBlur = 8;
      const txt = ritual.phase === 'show' ? 'Merke dir die Reihenfolge …' : `Jetzt du · ${ritual.pos}/${ritual.len} · ${Math.ceil(ritual.left)} s`;
      g.fillText(txt, geo.availW / 2, geo.top - 14);
      g.restore();
    }
  }

  // ── Eingabe: Sephira antippen = kaufen, Leere = Wissen sammeln (Mehrfinger) ──
  cv.addEventListener('pointerdown', (e) => {
    if (!active || busy || !fx || C.modalOpen()) return;
    pointers.set(e.pointerId, 1);
    if (pointers.size > MAX_FINGERS) return;
    const i = hitNode(e.clientX, e.clientY);
    if (ritual) { if (i >= 0) ritualTap(i); return; }
    if (i >= 0) { buyNode(i, e.clientX, e.clientY); return; }
    tap(e.clientX, e.clientY);
  });
  const up = (e) => pointers.delete(e.pointerId);
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);

  let lastSfx = 0, lastVib = 0;
  function tap(x, y) {
    const a2 = a(), v = A.tapValue(a2, fx);
    A.earn(a2, v); a2.taps++;
    C.world.burst(x, y, '#ffd166', 7);
    C.world.floater(x + (Math.random() - 0.5) * 40, y - 12 - Math.random() * 16, '+' + fmt(v), '#fff3b0');
    const now = performance.now();
    if (now - lastSfx > 45) { C.music.tap(); lastSfx = now; }
    if (now - lastVib > 60) { C.vibrate(6); lastVib = now; }
  }
  const buyAmount = (i) => (buyN === 'max' ? Math.max(1, A.maxAffordable(a(), fx, i)) : buyN);
  function buyNode(i, x, y) {
    const a2 = a();
    if (!A.genUnlocked(a2, i)) { C.vibrate(15); C.world.floater(x, y - 20, 'Noch verborgen', '#8a93b8'); return; }
    const n = buyAmount(i), cost = A.genCost(a2, fx, i, n);
    if (a2.wissen < cost) { C.vibrate(20); C.world.floater(x, y - 24, 'Zu wenig Wissen', '#8a93b8'); return; }
    const before = new Set(A.activePaths(a2)), ms0 = A.milestoneMult(a2.owned[i]);
    a2.wissen -= cost; a2.owned[i] += n;
    C.music.buy(); C.vibrate(10);
    C.world.burst(x, y, SEPHIROTH[i].color, 14, 1.1);
    if (A.milestoneMult(a2.owned[i]) > ms0) C.world.floater(x, y - 34, `${SEPHIROTH[i].name} ×${(A.milestoneMult(a2.owned[i]) / ms0).toFixed(1).replace('.', ',')}`, '#fff');
    const fresh = A.activePaths(a2).filter((p) => !before.has(p))[0];
    if (fresh) {       // ein neuer Pfad des Baums leuchtet auf
      C.world.doFlash('#ffd166', 0.3); C.vibrate([20, 30, 20]);
      C.world.floater(geo.availW / 2, geo.top - 14, `Pfad ${fresh.letter}: ${fresh.card}`, '#ffd166');
      C.say([fresh.text], 'plural');
    }
    refreshGens(); updateHud(); updateLeap();
  }

  // ── Rituale („Die Sequenz") ────────────────────────────────
  function startRitual() {
    const a2 = a();
    if (busy || ritual || !fx || C.modalOpen()) return;
    if (a2.ritCd > 0) { C.vibrate(15); C.world.floater(C.world.cx, C.world.cy - 40, `Ritual · noch ${Math.ceil(a2.ritCd)} s`, '#fff'); return; }
    const avail = []; for (let i = 0; i < 11; i++) if (A.genUnlocked(a2, i) && nodeVisible(i)) avail.push(i);
    const len = A.ritualLength(a2), seq = [];
    while (seq.length < len) { const c = avail[Math.floor(Math.random() * avail.length)]; if (c !== seq[seq.length - 1]) seq.push(c); }
    ritual = { seq, len, phase: 'show', t: 0, pos: 0, left: 6 + len * 1.5 };
    a2.ritCd = A.T2.ritualCd;
    C.music.boom(); C.vibrate(20); buildDock();
  }
  function ritualTap(i) {
    if (ritual.phase !== 'input') return;
    if (i === ritual.seq[ritual.pos]) {
      ritual.pos++; C.music.buy(); C.vibrate(10); const p = nodePos(i); C.world.burst(p.x, p.y, SEPHIROTH[i].color, 14, 1.2);
      if (ritual.pos >= ritual.len) ritualEnd(true);
    } else ritualEnd(false);
  }
  function ritualEnd(win) {
    const a2 = a(), len = ritual.len;
    ritual = null;
    if (win) {
      const m = 1 + (2 + 0.5 * len) * fx.rit, gain = pps() * 40 * len * fx.rit;
      A.earn(a2, gain); a2.buffs.push({ n: 'Ritual', k: 'prod', m, t: 30 });
      C.music.boom(true); C.vibrate([40, 40, 80]); C.world.doFlash('#ffd166', 0.6); C.world.burst(C.world.cx, C.world.cy, '#ffd166', 60, 1.8);
      C.world.floater(geo.availW / 2, geo.top + 10, `Ritual gelungen: +${fmt(gain)} ✦, Produktion ×${m.toFixed(1).replace('.', ',')}`, '#ffd166');
    } else { C.vibrate(40); C.world.floater(geo.availW / 2, geo.top + 10, 'Der Faden riss. Das Ritual ruht.', '#8a93b8'); a2.ritCd = Math.min(a2.ritCd, A.T2.ritualCd * 0.5); }
    buildDock(); updateBuffs(); updateHud();
  }

  // ── Mentoren: Kräfte ────────────────────────────────────────
  function firePower(id) {
    const a2 = a(), m = MENTORS.find((x) => x.id === id);
    if (busy || C.modalOpen()) return;
    if ((a2.mcd[id] || 0) > 0) { C.vibrate(15); C.world.floater(C.world.cx, C.world.cy - 60, `${m.power.name} · noch ${Math.ceil(a2.mcd[id])} s`, '#fff'); return; }
    a2.mcd[id] = m.power.cd;
    const col = AGES[m.age].color;
    C.music.boom(); C.vibrate([20, 30, 60]); C.world.doFlash(col, 0.3); C.world.burst(C.world.cx, C.world.cy, col, 40, 1.5);
    C.world.floater(C.world.cx, C.world.cy - 70, `${m.name}: ${m.power.name}`, col);
    for (const f of m.power.fx) {
      if (f.t === 'burst') { const old = a2.buffs.find((b) => b.id === id && b.k === f.k); if (old) old.t = f.dur; else a2.buffs.push({ id, n: m.power.name, k: f.k, m: f.m, t: f.dur }); }
      if (f.t === 'gain') { const gain = pps() * f.secs; A.earn(a2, gain); C.world.floater(C.world.cx, C.world.cy - 40, `+${fmt(gain)} ✦`, '#fff'); }
    }
    updateHud(); updateBuffs(); buildDock();
  }

  // ── Oberfläche: Leiste, Liste, Dock ────────────────────────
  function updateHud() {
    const a2 = a(), S = st();
    $('amount').textContent = fmt(a2.wissen);
    $('rate').textContent = `+${fmtRate(pps())} /s`;
    $('universeLabel').textContent = `UNIVERSUM ${S.universe} · DER ORDEN${a2.dim ? ` · DIMENSION ${a2.dim}` : ''}`;
    $('epochLabel').textContent = `${cur().name} · ${cur().grad}`;
    document.documentElement.style.setProperty('--accent', cur().color);
  }
  function updateBuffs() {
    const a2 = a();
    $('buffs').innerHTML = a2.buffs.map((b) => `<b>${b.n} ×${fmt(b.m)} · ${Math.ceil(b.t)} s</b>`).join('');
  }
  function buildDock() {
    const a2 = a(), dock = $('dock'); dock.innerHTML = '';
    const mk = (id, ic, col, label, cd, max) => {
      const b = document.createElement('button');
      b.className = 'av' + (cd <= 0 ? ' ready' : ''); b.dataset.id = id; b.style.setProperty('--c', col); b.style.setProperty('--p', Math.max(0, cd / max * 100).toFixed(1));
      b.setAttribute('aria-label', label); b.innerHTML = `<span>${ic}</span>`;
      C.onTap(b, id === '_ritual' ? startRitual : () => firePower(id));
      dock.appendChild(b);
    };
    for (const id of a2.mentors) { const m = MENTORS.find((x) => x.id === id); mk(id, m.ic, AGES[m.age].color, `${m.name}: ${m.power.name}`, a2.mcd[id] || 0, m.power.cd); }
    mk('_ritual', 'R', '#ffd166', 'Ritual: Die Sequenz', a2.ritCd, A.T2.ritualCd);
  }
  function updateDock() {
    const a2 = a();
    for (const b of $('dock').children) {
      const id = b.dataset.id, cd = id === '_ritual' ? a2.ritCd : (a2.mcd[id] || 0), max = id === '_ritual' ? A.T2.ritualCd : MENTORS.find((x) => x.id === id).power.cd;
      b.classList.toggle('ready', cd <= 0); b.style.setProperty('--p', Math.max(0, cd / max * 100).toFixed(1));
    }
  }
  function buildGens() {
    const a2 = a(), list = $('a2Gens'); list.innerHTML = '';
    const idx = []; for (let i = 10; i >= 0; i--) if (nodeVisible(i) && A.genUnlocked(a2, i)) idx.push(i);
    genKey = idx.join(',');
    const h = document.createElement('div'); h.className = 'ep-head'; h.textContent = 'DIE SEPHIROTH'; list.appendChild(h);
    for (const i of idx) {
      const s = SEPHIROTH[i], b = document.createElement('button');
      b.className = 'gen'; b.dataset.i = i; b.style.setProperty('--c', s.color);
      b.innerHTML = `<div class="ic">${s.n || '✦'}</div><div><div class="nm">${s.name} · ${s.unit}</div><div class="ds">${s.desc}</div><div class="pr"></div><div class="ms"><i></i></div></div><div class="buy"><b></b><small></small></div>`;
      C.onTap(b, () => buyNode(i, C.world.cx, C.world.cy));
      list.appendChild(b);
    }
    refreshGens();
  }
  function refreshGens() {
    const a2 = a(); if (!fx) return;
    const want = []; for (let i = 10; i >= 0; i--) if (nodeVisible(i) && A.genUnlocked(a2, i)) want.push(i);
    if (want.join(',') !== genKey) { buildGens(); return; }
    for (const b of $('a2Gens').querySelectorAll('.gen')) {
      const i = +b.dataset.i, n = buyAmount(i), cost = A.genCost(a2, fx, i, n), own = a2.owned[i];
      b.classList.toggle('can', a2.wissen >= cost); b.classList.toggle('off', a2.wissen < cost && own === 0);
      b.querySelector('.buy b').textContent = fmt(cost) + ' ✦'; b.querySelector('.buy small').textContent = `${own} Stück · ×${n}`;
      b.querySelector('.pr').textContent = own ? `${fmtRate(A.genProd(a2, fx, i) * A.globalMult(a2, fx))} /s${fx.seph[i] > 1 ? ` · Resonanz ×${fx.seph[i].toFixed(2).replace('.', ',')}` : ''}` : '';
      const nxt = SACRED.find((m) => m > own), prv = [...SACRED].reverse().find((m) => m <= own) || 0;
      b.querySelector('.ms i').style.width = nxt ? `${(own - prv) / (nxt - prv) * 100}%` : '100%';
    }
  }
  function updateLeap() {
    const a2 = a(), box = $('a2Leap'); if (!fx) return;
    const cost = A.leapCost(a2), ready = a2.wissen >= cost, final = a2.age === A.LAST_AGE;
    if (!box.firstChild) {
      box.innerHTML = '<button class="leap"><div class="k"></div><div class="n"></div><div class="bar"><i></i></div><div class="c"><span></span><b></b></div></button>';
      C.onTap(box.firstChild, doLeap);
    }
    const el = box.firstChild;
    el.classList.toggle('ready', ready);
    el.querySelector('.k').textContent = final ? 'DIE TRANSZENDENTE SINGULARITÄT' : `EINWEIHUNG ${a2.age + 1}/8 · NÄCHSTER GRAD: ${AGES[a2.age + 1].grad.toUpperCase()}`;
    el.querySelector('.n').textContent = final ? 'Die Große Stille' : cur().leap;
    el.querySelector('.bar i').style.width = `${Math.min(100, a2.wissen / cost * 100)}%`;
    el.querySelector('.c span').textContent = `${fmt(Math.min(a2.wissen, cost))} / ${fmt(cost)} ✦`;
    el.querySelector('.c b').textContent = ready ? 'BEREIT' : '';
  }
  function buildMentors() {
    const a2 = a(), box = $('a2-lehrer');
    box.innerHTML = MENTORS.map((m) => {
      if (!a2.mentors.includes(m.id)) return `<div class="a2card locked">Ein Lehrer wartet im Zeitalter ${AGES[m.age].name}.</div>`;
      return `<div class="a2card" style="border-color:${hexA(AGES[m.age].color, 0.4)}"><h4 style="color:${AGES[m.age].color}">${m.name}</h4><small style="margin:-4px 0 8px">${m.title}</small>
        <div class="rd"><p><i>${m.story}</i></p></div>
        ${m.lehren.map((l, k) => `<div class="rd"><b>Lehre ${k + 1}</b><p>${l}</p></div>`).join('')}
        <div class="rd-fx">${m.aura.text} · „${m.power.name}": ${m.power.text} (alle ${m.power.cd} s)</div></div>`;
    }).join('');
  }
  function buildFate() {
    const a2 = a(), box = $('a2-schicksal');
    let html = `<div class="rd-note" style="margin:6px 2px 10px">${HINWEIS}</div>`;
    if (ana) {
      const h = ana.heute;
      html += `<div class="a2card"><h4>Der Himmel heute</h4><div class="rd"><p>${h.phase.name} (${Math.round(h.phase.lit * 100)} % beleuchtet) · Sonne in ${SIGNS[h.sun]} · Mond in ${SIGNS[h.moon]}</p></div>${(fx.sky || []).map((s) => `<div class="rd-fx" style="margin:4px 0">${s}</div>`).join('')}</div>`;
      for (let i = 0; i < a2.layers; i++) {
        const r = lesen(i, ana);
        html += `<div class="a2card"><h4>${i + 1}/7 · ${r.title}</h4>${r.blocks.map((b) => `<div class="rd"><b>${b.h}</b><p>${b.p}</p></div>`).join('')}<div class="rd-world">${r.world}</div>${fx.lines[i] ? `<div class="rd-fx">${fx.lines[i]}</div>` : ''}</div>`;
      }
      if (a2.layers < 7) html += `<div class="a2card locked">Die nächste Ebene („${LAYER_TITLES[a2.layers]}") wird beim Beginn des nächsten Durchgangs enthüllt.</div>`;
      else html += `<div class="a2card locked">Alle sieben Ebenen sind enthüllt. Jede Dimension vertieft, was du gesehen hast.</div>`;
    }
    html += '<button class="btn ghost" id="a2EditData">Meine Daten ändern</button>';
    box.innerHTML = html;
    if ($('a2EditData')) C.onTap($('a2EditData'), () => showEinweihung(true));
  }
  function refreshAll() {
    updateHud(); updateBuffs(); buildDock(); buildGens(); updateLeap(); buildMentors(); buildFate();
  }
  function setTab(k) {
    tab = k;
    document.querySelectorAll('#a2panel .tab').forEach((b) => b.classList.toggle('active', b.dataset.a2tab === k));
    for (const id of ['orden', 'lehrer', 'schicksal']) $('a2-' + id).classList.toggle('hidden', id !== k);
    if (k === 'lehrer') buildMentors();
    if (k === 'schicksal') buildFate();
  }
  document.querySelectorAll('#a2panel .tab').forEach((b) => C.onTap(b, () => setTab(b.dataset.a2tab)));
  document.querySelectorAll('#a2Buy button').forEach((b) => C.onTap(b, () => {
    buyN = b.dataset.n === 'max' ? 'max' : +b.dataset.n;
    document.querySelectorAll('#a2Buy button').forEach((x) => x.classList.toggle('active', x === b));
    if (active) refreshGens();
  }));
  window.addEventListener('resize', () => { if (active) layout(); });

  // ── Fenster ─────────────────────────────────────────────────
  function ask(html, label = 'Weiter') {
    return new Promise((res) => {
      C.openModal(`${html}<button class="btn" id="a2ok">${label}</button>`, false);
      $('a2ok').onclick = () => { C.closeModal(); res(); };
    });
  }
  async function cine(lines, hold = 2300) {
    const ov = $('overlay'); ov.classList.remove('hidden'); document.body.classList.add('cine-mode');
    for (const l of lines) { ov.innerHTML = `<div class="cine">${l}</div>`; await wait(60); ov.firstChild.classList.add('on'); await wait(hold); ov.firstChild.classList.remove('on'); await wait(1300); }
    ov.classList.add('hidden'); ov.innerHTML = ''; document.body.classList.remove('cine-mode');
  }

  // Einweihung: Name, Geburtsdatum, optional Uhrzeit
  function showEinweihung(edit) {
    const a2 = a(), p = a2.prof || {};
    const pad = (n) => String(n).padStart(2, '0');
    const dv = p.y ? `${p.y}-${pad(p.m)}-${pad(p.d)}` : '', tv = p.h !== undefined && p.h !== null ? `${pad(p.h)}:${pad(p.min || 0)}` : '';
    busy = true;
    C.openModal(`<div class="kicker" style="color:#ffd166">DIE EINWEIHUNG</div><h2>${edit ? 'Deine Daten' : 'Wer tritt in den Orden ein?'}</h2>
      <p class="quote">${edit ? 'Was du hier änderst, verändert die Deutungen und ihre Wirkung.' : 'Thoth sieht dich lange an. „Wir nennen uns die Erleuchteten, die Illuminaten. Sterne und Zahlen sind die Sprache unseres Ordens. Nenne mir deinen Namen und den Tag, an dem du kamst."'}</p>
      <label class="field">Name<input id="pfName" type="text" autocomplete="off" maxlength="40" placeholder="Dein vollständiger Name" value="${(p.name || '').replace(/"/g, '&quot;')}"></label>
      <label class="field">Geburtsdatum<input id="pfDate" type="date" value="${dv}"></label>
      <label class="field">Geburtszeit (optional, macht den Mond genauer)<input id="pfTime" type="time" value="${tv}"></label>
      <div class="rd-note" id="pfErr" style="color:#ff9bab"></div>
      <p class="rd-note">Alles bleibt auf deinem Gerät und wird nirgends hingesendet. Berechnet werden Sonnen- und Mondstand, Zahlen und Lebenszyklen (ohne Geburtsort). Der Orden in diesem Spiel ist eine erfundene Geschichte. ${HINWEIS}</p>
      <button class="btn" id="pfGo">${edit ? 'Speichern' : 'Einweihen'}</button>${edit ? '<button class="btn ghost" id="pfCancel">Abbrechen</button>' : ''}`, false);
    if (edit) $('pfCancel').onclick = () => { C.closeModal(); busy = false; };
    $('pfGo').onclick = () => {
      const name = $('pfName').value.trim(), dstr = $('pfDate').value, tstr = $('pfTime').value;
      const err = (m) => { $('pfErr').textContent = m; C.vibrate(30); };
      if (name.replace(/[^A-Za-zÄÖÜäöüß]/g, '').length < 2) return err('Bitte gib deinen Namen ein (mindestens 2 Buchstaben).');
      const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dstr);
      if (!m) return err('Bitte wähle dein Geburtsdatum.');
      const y = +m[1], mo = +m[2], d = +m[3];
      if (y < 1900 || new Date(y, mo - 1, d) > new Date()) return err('Das Datum liegt außerhalb des Möglichen.');
      const prof = { name, y, m: mo, d };
      if (tstr) { const [hh, mm] = tstr.split(':').map(Number); prof.h = hh; prof.min = mm; }
      a2.prof = prof; recalc(); C.closeModal(); busy = false; save();
      refreshAll();
      C.say(edit ? ['Die Zeichen werden neu gelesen.'] : ['Der Orden kennt nun deinen Namen.'], 'plural');
    };
  }

  // Schicksalsebene enthüllen
  async function showLayer(idx) {
    const a2 = a(); busy = true;
    const r = lesen(idx, ana);
    const tmp = { ...a2, layers: idx + 1 }, tfx = A.computeFx(tmp, ana);
    C.music.boom(); C.world.doFlash('#c77dff', 0.4);
    await ask(`<div class="kicker" style="color:#c77dff">SCHICKSALSEBENE ${idx + 1}/7 · DIE ZEICHEN SPRECHEN</div><h2>${r.title}</h2>
      ${r.blocks.map((b) => `<div class="rd"><b>${b.h}</b><p>${b.p}</p></div>`).join('')}
      <div class="rd-world"><b style="font-style:normal;color:#c77dff">Die Welt und du</b><br>${r.world}</div>
      <div class="rd-fx"><b>Wirkung im Spiel:</b> ${tfx.lines[idx] || '—'}</div><div class="rd-note">${r.note}</div>`, 'Verstanden');
    if (a2.layers === idx) a2.layers = idx + 1;
    a2.pendingLayer = null; busy = false; recalc(); refreshAll(); save();
  }
  async function showMentor(age) {
    const a2 = a(), m = MENTORS[age]; busy = true;
    C.music.boom(); C.world.doFlash(AGES[age].color, 0.4);
    await ask(`<div class="kicker" style="color:${AGES[age].color}">EIN LEHRER ERSCHEINT · ${AGES[age].name.toUpperCase()}</div><h2>${m.name}</h2><p class="quote">${m.title}<br><br>${m.story}</p><div class="rd"><b>Erste Lehre</b><p>${m.lehren[0]}</p></div><div class="rd-fx">${m.aura.text} · „${m.power.name}": ${m.power.text}</div>`, 'Willkommen im Orden');
    if (!a2.mentors.includes(m.id)) { a2.mentors.push(m.id); a2.mcd[m.id] = 0; }
    a2.pendingMentor = 0; busy = false; recalc(); buildDock(); buildMentors(); updateHud(); save();
  }
  function showEvent(age) {
    const a2 = a(), ev = AGE_EVENTS[age]; busy = true;
    C.music.boom(); C.vibrate([30, 40, 60]);
    const opt = (k) => `<button class="choice-btn" data-k="${k}"><b>${ev[k].label}</b><span>${ev[k].sub}</span><em>${ev[k].effect}</em></button>`;
    C.openModal(`<div class="kicker" style="color:${AGES[age].color}">DIE WELT WÄHLT · ${AGES[age].name.toUpperCase()}</div><h2>${ev.title}</h2><p>${ev.text}</p>${opt('a')}${opt('b')}`, false);
    for (const b of $('modalCard').querySelectorAll('.choice-btn')) b.onclick = () => {
      const k = b.dataset.k; a2.events[age] = k; a2.weg += k === 'a' ? 1 : -1; a2.pendingEvent = 0;
      C.closeModal(); busy = false; C.world.doFlash(AGES[age].color, 0.4); C.vibrate(40);
      recalc(); refreshAll(); save();
    };
  }
  function queue() {
    const a2 = a();
    if (busy || C.modalOpen() || ritual || !active) return;
    if (!a2.prof) { showEinweihung(false); return; }
    if (a2.pendingLayer !== null && a2.pendingLayer !== undefined) { showLayer(a2.pendingLayer); return; }
    if (a2.pendingMentor) { showMentor(a2.pendingMentor - 1); return; }
    if (a2.pendingEvent) { showEvent(a2.pendingEvent); return; }
  }

  // ── Einweihung in das nächste Zeitalter, Finale, Transzendenz ──
  function doLeap() {
    const a2 = a();
    if (busy || !fx || C.modalOpen()) return;
    const cost = A.leapCost(a2);
    if (a2.wissen < cost) { C.vibrate(20); return; }
    a2.wissen -= cost;
    if (a2.age === A.LAST_AGE) { finale(); return; }
    a2.age++; a2.pendingMentor = a2.age + 1; if (AGE_EVENTS[a2.age]) a2.pendingEvent = a2.age;
    const col = cur().color;
    C.music.riser && C.music.riser(0.4); C.music.boom(); C.vibrate(40); C.world.doFlash(col, 0.8); C.world.shake = 0.5;
    C.world.burst(C.world.cx, C.world.cy, col, 70, 2);
    recalc(); refreshAll(); save();
    C.say([`${AGES[a2.age].name}. ${AGES[a2.age].years}. Der Grad „${AGES[a2.age].grad}" öffnet sich.`], 'plural');
  }
  async function finale() {
    const a2 = a(), S = st();
    busy = true; a2.finished = true; save();
    C.music.boom(true); C.world.doFlash('#ffffff', 1);
    await cine(['Alle zehn Sphären leuchten zugleich.', 'Was der Orden wusste, erkennt sich selbst.', 'Kether öffnet sich.']);
    const key = A.endingKey(a2), en = ORDEN_ENDEN[key];
    await ask(`<div class="kicker" style="color:#ffd166">DAS ENDE DES ORDENS</div><h2>${en.name}</h2><p class="quote">${en.text}</p>`, 'Weiter');
    const d = DIMENSIONS[Math.min(a2.dim, DIMENSIONS.length - 1)];
    const special = a2.dim === 0 ? '<p>Daath, die verborgene Sphäre, wird im Baum sichtbar: das Wissen, das es nicht gibt und das alles verbindet.</p>' : '';
    await ask(`<div class="kicker" style="color:#fff">DIE TRANSZENDENTE SINGULARITÄT</div><h2>${d.name}</h2><p class="quote">Das Bewusstsein geht über sich hinaus. Eine neue Dimension entsteht.</p><p>${d.text}</p>${special}<div class="rd-fx">Dauerhaft: Produktion ×1,25 · ${d.effect}</div>`, 'Eintreten');
    if (!a2.preview) C.pushChronik({ u: S.universe, akt: 2, run: a2.run, dim: a2.dim + 1, ending: en.name, min: Math.round(a2.playTime / 60), mentors: a2.mentors.map((id) => MENTORS.find((m) => m.id === id).name), layers: a2.layers });
    a2.dim++; a2.run++; if (!a2.preview) S.universe++; A.resetRun(a2);
    startRun(); recalc(); layout(); refreshAll(); busy = false; save();
    C.world.doFlash('#ffffff', 1);
    C.say([`Universum ${S.universe}. Der Orden beginnt von vorn, aber du bist nicht mehr derselbe.`], 'plural');
  }
  function startRun() {
    const a2 = a();
    if (a2.layers < Math.min(7, a2.run) && (a2.pendingLayer === null || a2.pendingLayer === undefined)) a2.pendingLayer = a2.layers;
    if (!a2.mentors.includes('thoth')) a2.pendingMentor = 1;
  }

  // ── Zustand betreten/verlassen, Takt ────────────────────────
  function enter(preview = false) {
    const S = st();
    S.akt = 2; if (!S.a2) S.a2 = A.newA2();
    S.a2.preview = (!!preview || !!S.a2.preview) && S.universe < 155;   // Vorschau: Akt I bleibt unberührt, Rückweg möglich
    active = true; busy = false; ritual = null;
    document.body.classList.add('akt2'); cv.classList.remove('hidden'); $('a2panel').classList.remove('hidden');
    C.world.mode = 'a2'; C.world.z = 7; C.world.zTarget = 7; C.world.zMax = 7;
    C.music.setLevel(8);
    layout(); recalc(); startRun(); refreshAll(); setTab('orden'); save();
  }
  function leave() {
    const S = st(); active = false; busy = false; ritual = null;
    S.akt = 1; document.body.classList.remove('akt2'); cv.classList.add('hidden'); $('a2panel').classList.add('hidden');
    $('dock').innerHTML = ''; $('buffs').innerHTML = '';
    save();
  }
  function save() { C.save(); }
  function frame(dt) {
    if (!active) return;
    const a2 = a(); t += dt;
    if (!fx) { recalc(); }
    if (a2.prof && !a2.finished && !busy) {
      A.earn(a2, pps() * dt); a2.playTime += dt;
      for (const b of a2.buffs) b.t -= dt;
      const n = a2.buffs.length; a2.buffs = a2.buffs.filter((b) => b.t > 0); if (a2.buffs.length !== n) updateBuffs();
      for (const id of a2.mentors) if (a2.mcd[id] > 0) a2.mcd[id] = Math.max(0, a2.mcd[id] - dt * fx.cd);
      if (a2.ritCd > 0) a2.ritCd = Math.max(0, a2.ritCd - dt);
    }
    if (ritual) {
      if (ritual.phase === 'show') { ritual.t += dt; if (ritual.t > ritual.len * 0.8 + 0.5) { ritual.phase = 'input'; } }
      else { ritual.left -= dt; if (ritual.left <= 0) ritualEnd(false); }
    }
    uiT += dt; saveT += dt;
    if (uiT > 0.25) {
      uiT = 0; updateHud(); updateDock(); refreshGens(); updateLeap(); if (a2.buffs.length) updateBuffs(); queue();
    }
    if (saveT > 10) { saveT = 0; save(); }
  }
  function offline(sec) {
    const a2 = a(); if (!active || !a2.prof || !fx || a2.finished) return;
    const away = Math.min(sec, A.T2.offlineHours * 3600);
    if (away < 30) return;
    const gain = pps() * away * A.offlineEff(fx); A.earn(a2, gain);
    for (const id of a2.mentors) if (a2.mcd[id] > 0) a2.mcd[id] = Math.max(0, a2.mcd[id] - away * fx.cd);
    a2.ritCd = Math.max(0, a2.ritCd - away);
    C.world.floater(C.world.cx, C.world.cy, `+${fmt(gain)} ✦ (offline)`, '#fff3b0');
  }

  return {
    enter, leave, frame, draw, offline, layout, recalc, refreshAll,
    get active() { return active; },
    // für Tests und Entwickler
    dev: { get fx() { return fx; }, get ana() { return ana; }, get ritual() { return ritual; }, nodePos, buyNode, doLeap, startRitual, ritualTap, firePower, queue, finale, showEinweihung, buyAmount: () => buyN },
  };
}
