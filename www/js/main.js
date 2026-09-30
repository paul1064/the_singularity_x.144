// ─────────────────────────────────────────────────────────────
//  THE SINGULARITY x.144 — Spielablauf & Oberfläche
// ─────────────────────────────────────────────────────────────
import { EPOCHS, GENERATORS, LEAPS, EVENTS, VOICE, FRAGMENTS, CONSTANTS, CONST_MAX, INTENTS, MILESTONES, TRAITS, MUTATIONS } from './data.js';
import * as E from './economy.js';
import { World } from './render.js';
import { Soundtrack } from './audio.js';
import { fmt, fmtRate } from './format.js';

const SAVE_KEY = 'singularity-x144';
const $ = (id) => document.getElementById(id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (a) => a[Math.floor(Math.random() * a.length)];

let S = load();
const world = new World($('world'));
const music = new Soundtrack();
let buyN = 1;
let tab = 'evo';
let running = false;        // Spielschleife aktiv (nach Startbildschirm)
let cinematic = false;      // Zwischensequenz läuft
let nextGlitch = 60 + Math.random() * 60;
let nextVoice = 25;
let acc = 0;
let res = 0;                // V2: Resonanz 0–1 (nicht gespeichert)
let lastTapAt = 0;
let nextMut = 18;           // V2: Sekunden bis zur nächsten Mutation (die erste kommt früh)

// ── Speichern / Laden ─────────────────────────────────────────
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const s = Object.assign(E.newState(), JSON.parse(raw));
      s.settings = Object.assign(E.newState().settings, s.settings);
      return s;
    }
  } catch { /* beschädigter Speicherstand → neu */ }
  return E.newState();
}
function save() {
  S.lastSeen = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch { /* voll/privat */ }
}

// ── Hilfen ────────────────────────────────────────────────────
const creator = () => S.runsDone > 0;
const genName = (i) => (S.choices.asteroid === 'b' && GENERATORS[i].alt) ? GENERATORS[i].alt : GENERATORS[i].name;
const genDesc = (i) => (S.choices.asteroid === 'b' && GENERATORS[i].altDesc) ? GENERATORS[i].altDesc : GENERATORS[i].desc;
function vibrate(ms) { if (S.settings.vibrate && navigator.vibrate) try { navigator.vibrate(ms); } catch {} }
function setAccent(e) {
  document.documentElement.style.setProperty('--accent', EPOCHS[e].color);
}
function addTimeline(text, kind = 'leap', color) {
  S.timeline.push({ u: S.universe, text, kind, c: color || EPOCHS[S.epoch].color });
  if (tab === 'time') renderTimeline();
}

// ── Die Stimme ────────────────────────────────────────────────
let voiceQ = [], voiceBusy = false;
function say(lines, style) {
  voiceQ.push(...lines.map((t) => ({ t, style })));
  if (!voiceBusy) nextLine();
}
async function nextLine() {
  const v = $('voice');
  const item = voiceQ.shift();
  if (!item) { voiceBusy = false; return; }
  voiceBusy = true;
  const primal = !creator() && S.epoch <= 1 && !item.style;
  v.className = item.style || (primal ? 'primal' : '');
  v.textContent = '';
  requestAnimationFrame(() => v.classList.add('show'));
  for (const ch of item.t) { v.textContent += ch; await wait(primal ? 70 : 38); }
  await wait(2600 + item.t.length * 35);
  v.classList.remove('show');
  await wait(1300);
  nextLine();
}
function voiceSet() { return creator() ? VOICE.run2 : VOICE.run1; }
function voiceEnter(e) {
  const key = `${S.universe}:${e}`;
  if (S.voiceEntered.includes(key)) return;
  S.voiceEntered.push(key);
  say(voiceSet()[e].enter);
}

// ── Aufbau der Oberfläche ─────────────────────────────────────
function buildRail() {
  const rail = $('rail'); rail.innerHTML = '';
  EPOCHS.forEach((ep, e) => {
    const b = document.createElement('button');
    b.style.setProperty('--c', ep.color);
    b.setAttribute('aria-label', ep.scale);
    b.innerHTML = '<i></i>';
    b.onclick = () => { if (e <= S.epoch) { world.zTarget = e; world.userZoom = e !== S.epoch; world.zRate = 3; } };
    rail.appendChild(b);
  });
  updateRail();
}
function updateRail() {
  const cur = Math.round(world.zTarget);
  [...$('rail').children].forEach((b, e) => {
    b.className = e > S.epoch ? 'locked' : 'unlocked' + (e === cur ? ' current' : '');
  });
}

function buildGenList() {
  const list = $('genList'); list.innerHTML = '';
  for (let e = S.epoch; e >= 0; e--) {
    const h = document.createElement('div');
    h.className = 'ep-head'; h.textContent = EPOCHS[e].name.toUpperCase();
    list.appendChild(h);
    for (let k = 0; k < 3; k++) {
      const i = e * 3 + k;
      const b = document.createElement('button');
      b.className = 'gen'; b.dataset.i = i;
      b.style.setProperty('--c', EPOCHS[e].color);
      b.innerHTML = `<div class="ic">${k + 1}</div>
        <div><div class="nm">${genName(i)}</div><div class="ds">${genDesc(i)}</div><div class="pr"></div><div class="ms"><i></i></div></div>
        <div class="buy"><b></b><small></small></div>`;
      b.onclick = () => buyGen(i);
      list.appendChild(b);
    }
  }
  updateGenList();
}
function buyAmount(i) {
  if (buyN === 'max') return Math.max(1, E.maxAffordable(S, i));
  return buyN;
}
function updateGenList() {
  for (const b of $('genList').querySelectorAll('.gen')) {
    const i = +b.dataset.i, n = buyAmount(i), cost = E.genCost(S, i, n);
    const own = S.owned[i];
    b.classList.toggle('can', S.complexity >= cost);
    b.classList.toggle('off', S.complexity < cost && own === 0);
    b.querySelector('.buy b').textContent = fmt(cost) + ' ✦';
    b.querySelector('.buy small').textContent = `${own} Stück · ×${n}`;
    const p = E.genProd(S, i);
    b.querySelector('.pr').textContent = own ? `${fmtRate(p)} /s` : '';
    const next = MILESTONES.find((m) => m > own);
    const prev = [...MILESTONES].reverse().find((m) => m <= own) || 0;
    b.querySelector('.ms i').style.width = next ? `${(own - prev) / (next - prev) * 100}%` : '100%';
  }
}

function renderLeap() {
  const card = $('leapCard');
  if (S.finished) { card.innerHTML = ''; return; }
  const cost = E.leapCost(S, S.epoch), ready = S.complexity >= cost;
  const final = S.epoch === 7;
  if (!card.firstChild) {
    card.innerHTML = `<button class="leap"><div class="k"></div><div class="n"></div><div class="bar"><i></i></div><div class="c"><span></span><b></b></div></button>`;
    card.firstChild.onclick = doLeap;
  }
  const el = card.firstChild;
  el.classList.toggle('ready', ready);
  el.querySelector('.k').textContent = final ? 'DAS ENDE ALLER EPOCHEN' : `EVOLUTIONSSPRUNG ${S.epoch + 1}/7`;
  el.querySelector('.n').textContent = LEAPS[S.epoch];
  el.querySelector('.bar i').style.width = `${Math.min(100, S.complexity / cost * 100)}%`;
  el.querySelector('.c span').textContent = `${fmt(Math.min(S.complexity, cost))} / ${fmt(cost)} ✦`;
  el.querySelector('.c b').textContent = ready ? 'BEREIT' : '';
}

function renderTimeline() {
  const box = $('timeline');
  const traitsHtml = S.traits.length ? `<div class="traits-head">MERKMALE</div>${S.traits.map((id) => { const t = TRAITS.find((x) => x.id === id); return `<div class="trait"><b>${t.name}</b><small>${t.effect}</small></div>`; }).join('')}<div class="traits-head" style="margin-top:14px">ZEITLINIE</div>` : '';
  if (!S.timeline.length) { box.innerHTML = traitsHtml + '<div class="empty">Noch ist nichts geschehen.<br>Die Geschichte dieses Universums wird hier geschrieben.</div>'; return; }
  let html = '', u = null;
  for (const t of S.timeline) {
    if (t.u !== u) { u = t.u; html += `<div class="tl-u">UNIVERSUM ${u}</div>`; }
    html += `<div class="tl ${t.kind === 'choice' ? 'choice' : ''}" style="--c:${t.c}">${t.text}</div>`;
  }
  box.innerHTML = traitsHtml + html;
  box.parentElement.scrollTop = box.parentElement.scrollHeight;
}

function renderFragments() {
  $('fragCount').textContent = S.fragments.length;
  const box = $('fragList');
  let html = '<div class="empty" style="padding:8px 4px 14px">Manchmal flackert etwas im Bild: <b>✧</b>. Tippe darauf, bevor es verschwindet.</div>';
  FRAGMENTS.forEach((f, i) => {
    html += S.fragments.includes(i)
      ? `<div class="frag"><small>FRAGMENT ${i + 1}/${FRAGMENTS.length}</small>${f}</div>`
      : `<div class="frag locked"><small>FRAGMENT ${i + 1}/${FRAGMENTS.length}</small>▒▒▒ ▒▒▒▒▒ ▒▒ ▒▒▒▒▒▒</div>`;
  });
  box.innerHTML = html;
}

function updateHud() {
  $('amount').textContent = fmt(S.complexity);
  $('rate').textContent = `+${fmtRate(E.prodPerSec(S))} /s`;
}
function refreshStatic() {
  $('universeLabel').textContent = `UNIVERSUM ${S.universe}${creator() ? ' · SCHÖPFER' : ''}`;
  $('epochLabel').textContent = EPOCHS[S.epoch].name;
  setAccent(S.epoch);
  world.alt = S.choices.asteroid === 'b';
  world.setDensity(S.owned);
  buildRail(); buildGenList(); renderLeap(); renderFragments();
  if (tab === 'time') renderTimeline();
}

// ── Aktionen ──────────────────────────────────────────────────
function buyGen(i) {
  if (cinematic) return;
  const n = buyAmount(i), cost = E.genCost(S, i, n);
  if (S.complexity < cost) { vibrate(20); return; }
  const before = S.owned[i];
  S.complexity -= cost; S.owned[i] += n;
  music.buy(); vibrate(10);
  world.setDensity(S.owned);
  if (MILESTONES.some((m) => before < m && S.owned[i] >= m)) {
    world.burst(world.cx, world.cy, EPOCHS[Math.floor(i / 3)].color, 40, 1.4);
    world.floater(world.cx, world.cy - 40, `${genName(i)} ×2!`, '#ffffff');
  }
  checkInEpochEvents();
  updateGenList(); renderLeap(); updateHud();
}

async function doLeap() {
  if (cinematic || S.finished) return;
  const cost = E.leapCost(S, S.epoch);
  if (S.complexity < cost) { vibrate(20); return; }
  S.complexity -= cost;
  const from = S.epoch;
  addTimeline(`<b>${LEAPS[from]}</b><small>Evolutionssprung ${from + 1}</small>`);
  if (from === 7) { save(); return finale(); }

  cinematic = true;
  S.epoch = from + 1;
  save();
  const r = music.riser(1.6);
  vibrate(40);
  await wait(1500);
  r && r.stop();
  music.boom(); world.doFlash(EPOCHS[S.epoch].color, 0.9); world.shake = 0.6;
  world.setEpoch(S.epoch, true);
  music.setLevel(S.epoch + 1);
  refreshStatic();
  voiceEnter(S.epoch);
  await wait(2600);
  cinematic = false;
  const ev = EVENTS.find((x) => x.afterLeap === from);
  if (ev && !S.choices[ev.id]) { S.pendingEvent = ev.id; save(); }
  // erst das Merkmal wählen, danach ggf. der Kataklysmus
  offerTrait(() => { if (S.pendingEvent) { const pe = EVENTS.find((x) => x.id === S.pendingEvent); if (pe) showEvent(pe); } });
}

function checkInEpochEvents() {
  for (const ev of EVENTS) {
    if (ev.inEpoch === undefined || S.choices[ev.id] || S.pendingEvent || S.epoch !== ev.inEpoch) continue;
    const e = ev.inEpoch, n = S.owned[e * 3] + S.owned[e * 3 + 1] + S.owned[e * 3 + 2];
    if (n >= ev.needOwned) { S.pendingEvent = ev.id; save(); setTimeout(() => showEvent(ev), 600); }
  }
}

// ── Kataklysmen ───────────────────────────────────────────────
function showEvent(ev) {
  music.boom(); vibrate([30, 40, 60]);
  const kicker = creator() ? 'DU ENTSCHEIDEST' : 'DIE EVOLUTION WÄHLT';
  const opt = (k) => `<button class="choice-btn" data-k="${k}"><b>${ev[k].label}</b><span>${ev[k].sub}</span><em>${ev[k].effect}</em></button>`;
  openModal(`<div class="kicker">⚠ KATAKLYSMUS · ${kicker}</div><h2>${ev.title}</h2><p>${ev.text}</p>${opt('a')}${opt('b')}`, false);
  for (const b of $('modalCard').querySelectorAll('.choice-btn')) b.onclick = () => resolveEvent(ev, b.dataset.k);
}
function resolveEvent(ev, k) {
  closeModal();
  S.choices[ev.id] = k; S.pendingEvent = null;
  if (k === 'a' && ev.id === 'oxygen') E.catastropheLoss(S, 0.5);
  if (k === 'a' && ev.id === 'asteroid') { E.catastropheLoss(S, 0.6); world.shake = 1.4; music.boom(true); world.doFlash('#ff7a3d', 1); }
  else world.doFlash('#ffffff', 0.5);
  addTimeline(ev[k].tag, 'choice', '#fff3b0');
  vibrate(60);
  refreshStatic(); updateHud(); save();
}

// ── Fragmente ─────────────────────────────────────────────────
function fragmentPool() {
  const limit = Math.min(FRAGMENTS.length, 7 + 5 * S.runsDone);
  const pool = [];
  for (let i = 0; i < limit; i++) if (!S.fragments.includes(i)) pool.push(i);
  return pool;
}
function collectFragment() {
  const pool = fragmentPool(); if (!pool.length) return;
  const i = pool[0];
  S.fragments.push(i);
  music.fragment(); vibrate([15, 30, 15]);
  save(); renderFragments();
  openModal(`<div class="kicker">FRAGMENT ${i + 1}/${FRAGMENTS.length}</div><h2>Ein Riss im Bild</h2><p class="quote">${FRAGMENTS[i]}</p><button class="btn">Weiter</button>`);
  $('modalCard').querySelector('.btn').onclick = closeModal;
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(html, closable = true) {
  $('modalCard').innerHTML = html;
  $('modal').classList.remove('hidden');
  $('modal').onclick = closable ? (e) => { if (e.target.id === 'modal') closeModal(); } : null;
}
function closeModal() { $('modal').classList.add('hidden'); }
const modalOpen = () => !$('modal').classList.contains('hidden');

function openSettings() {
  const sw = (k, label) => `<div class="row"><span>${label}</span><button class="switch ${S.settings[k] ? 'on' : ''}" data-k="${k}" aria-label="${label}"></button></div>`;
  openModal(`<div class="kicker">EINSTELLUNGEN</div><h2>Universum ${S.universe}</h2>
    ${sw('music', 'Musik')}${sw('sfx', 'Soundeffekte')}${sw('vibrate', 'Vibration')}
    <p style="margin-top:14px;font-size:12.5px;color:var(--muted)">Durchläufe abgeschlossen: ${S.runsDone} · Fragmente: ${S.fragments.length}/${FRAGMENTS.length}<br>Tipp: Mit zwei Fingern zoomen oder die Punkte rechts antippen, um frühere Größenordnungen zu besuchen.</p>
    <button class="btn ghost" id="closeSet">Schließen</button>
    <button class="btn danger" id="resetBtn">Spielstand löschen</button>`);
  for (const b of $('modalCard').querySelectorAll('.switch')) b.onclick = () => {
    const k = b.dataset.k; S.settings[k] = !S.settings[k]; b.classList.toggle('on', S.settings[k]);
    music.setMusic(S.settings.music); music.setSfx(S.settings.sfx); save();
  };
  $('closeSet').onclick = closeModal;
  let armed = false;
  $('resetBtn').onclick = (e) => {
    if (!armed) { armed = true; e.target.textContent = 'Wirklich alles löschen? Nochmal tippen'; return; }
    localStorage.removeItem(SAVE_KEY); location.reload();
  };
}

// ── Eingabe: Multi-Touch-Tippen (bis zu 5 Finger), Pinch-Zoom ──
// Jeder Finger, der das Feld berührt, zählt als voller Tipp. Gezoomt wird erst, wenn sich
// zwei Finger spürbar auseinander- oder zusammenbewegen (Schwelle PINCH_MIN).
const MAX_FINGERS = 5, PINCH_MIN = 18;
const pointers = new Map();
let pinchDist = 0, pinchStart = 0, pinching = false;
const cv = $('world');
cv.addEventListener('pointerdown', (e) => {
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinchDist = pinchStart = Math.hypot(a.x - b.x, a.y - b.y); pinching = false;
  }
  if (!running || cinematic || world.mode !== 'play' || pointers.size > MAX_FINGERS) return;
  if (world.hitGlitch(e.clientX, e.clientY)) { collectFragment(); return; }
  if (world.hitMutation(e.clientX, e.clientY)) { collectMutation(); return; }
  tap(e.clientX, e.clientY);
});
cv.addEventListener('pointermove', (e) => {
  if (!pointers.has(e.pointerId)) return;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pointers.size === 2 && pinchDist > 0) {
    const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
    if (!pinching && Math.abs(d - pinchStart) < PINCH_MIN) return;
    pinching = true;
    world.zoomBy(-Math.log10(d / pinchDist) * 1.6); pinchDist = d; updateRail();
  }
});
const up = (e) => { pointers.delete(e.pointerId); if (pointers.size < 2) { pinchDist = 0; pinching = false; } };
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
cv.addEventListener('wheel', (e) => { e.preventDefault(); world.zoomBy(e.deltaY * 0.0015); updateRail(); }, { passive: false });
let lastTap = 0, lastSfx = 0;
function tap(x, y) {
  const v = E.tapValue(S, undefined, res);
  E.earn(S, v); S.taps++;
  res = Math.min(1, res + E.resonanceGain(S)); lastTapAt = performance.now();
  world.burst(x, y, EPOCHS[S.epoch].color, 8);
  world.floater(x + (Math.random() - 0.5) * 40, y - 14 - Math.random() * 16, '+' + fmt(v), '#ffffff');
  const now = performance.now();
  if (now - lastSfx > 45) { music.tap(); lastSfx = now; }
  if (now - lastTap > 60) vibrate(6);
  lastTap = now;
}

// ── V2: Mutationen ────────────────────────────────────────────
function pickMutation() {
  const total = MUTATIONS.reduce((a, m) => a + m.w, 0);
  let r = Math.random() * total;
  for (const m of MUTATIONS) { r -= m.w; if (r <= 0) return m; }
  return MUTATIONS[0];
}
function collectMutation(forced) {
  const m = forced || pickMutation();
  music.fragment(); vibrate([10, 20, 10]);
  world.doFlash('#7cf29c', 0.25);
  let text = m.text;
  if (m.kind === 'gain') {
    const secs = E.mutationPower(S, m.secs);
    const gain = E.prodPerSec(S) * secs + E.tapValue(S, undefined, 0) * 20;
    E.earn(S, gain); text = `+${fmt(gain)} ✦`;
  } else {
    const mult = E.mutationPower(S, m.mult);
    const old = S.buffs.find((b) => b.k === m.kind && b.id === m.id);
    if (old) old.t = m.dur; else S.buffs.push({ id: m.id, k: m.kind, m: mult, t: m.dur });
    text = `×${fmt(mult)} ${m.kind === 'prod' ? 'Produktion' : 'Tippen'}`;
  }
  world.floater(world.cx, world.cy - 70, `${m.name}: ${text}`, '#7cf29c');
  updateHud(); updateBuffs(); save();
}
function updateBuffs() {
  $('buffs').innerHTML = S.buffs.map((b) => `<b>${MUTATIONS.find((m) => m.id === b.id)?.name || b.id} ×${fmt(b.m)} · ${Math.ceil(b.t)} s</b>`).join('');
}
function updateResonance() {
  const el = $('reso');
  const on = res > 0.03;
  el.classList.toggle('on', on);
  if (on) {
    el.querySelector('i').style.width = `${res * 100}%`;
    el.querySelector('span').textContent = `RESONANZ ×${fmt(E.resonanceMult(S, res))}`;
  }
}

// ── V2: Merkmale (Draft bei jedem Evolutionssprung) ───────────
function offerTrait(after) {
  if (!S.pendingTrait) {
    const pool = TRAITS.filter((t) => !S.traits.includes(t.id)).map((t) => t.id);
    if (!pool.length) { after && after(); return; }
    const offer = [];
    while (offer.length < 3 && pool.length) offer.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    S.pendingTrait = offer; save();
  }
  showDraft(after);
}
function showDraft(after) {
  music.boom(); vibrate([20, 30, 40]);
  const kicker = creator() ? 'DU WÄHLST EIN MERKMAL' : 'DIE EVOLUTION PROBIERT';
  const opt = (id) => { const t = TRAITS.find((x) => x.id === id); return `<button class="choice-btn" data-id="${id}"><b>${t.name}</b><span>${t.sub}</span><em>${t.effect}</em></button>`; };
  openModal(`<div class="kicker">✦ NEUES MERKMAL · ${kicker}</div><h2>Was bleibt?</h2><p>Jedes Leben trägt etwas weiter. Dieses Merkmal begleitet dein Universum bis zum Ende.</p>${S.pendingTrait.map(opt).join('')}`, false);
  for (const b of $('modalCard').querySelectorAll('.choice-btn')) b.onclick = () => {
    const t = TRAITS.find((x) => x.id === b.dataset.id);
    S.traits.push(t.id); S.pendingTrait = null;
    closeModal();
    addTimeline(`Merkmal: <b>${t.name}</b><small>${t.effect}</small>`, 'choice', '#7cf29c');
    world.doFlash('#7cf29c', 0.4); vibrate(40);
    refreshStatic(); updateHud(); save();
    after && after();
  };
}

document.querySelectorAll('.tab').forEach((b) => b.onclick = () => {
  tab = b.dataset.tab;
  document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === b));
  ['evo', 'time', 'frag'].forEach((t) => $('tab-' + t).classList.toggle('hidden', t !== tab));
  if (tab === 'time') renderTimeline();
  if (tab === 'frag') renderFragments();
});
document.querySelectorAll('#buyMode button').forEach((b) => b.onclick = () => {
  buyN = b.dataset.n === 'max' ? 'max' : +b.dataset.n;
  document.querySelectorAll('#buyMode button').forEach((x) => x.classList.toggle('active', x === b));
  updateGenList();
});
$('settingsBtn').onclick = openSettings;

// ── Spielschleife ─────────────────────────────────────────────
let last = performance.now(), uiT = 0, saveT = 0;
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (running && world.mode === 'play' && !S.finished) {
    const pps = E.prodPerSec(S);
    E.earn(S, pps * dt);
    S.playTime += dt;
    // Resonanz verfällt, Mutations-Effekte laufen ab
    if (performance.now() - lastTapAt > 350) res = Math.max(0, res - E.TUNING.resDecay * dt);
    if (S.buffs.length) { for (const b of S.buffs) b.t -= dt; const n = S.buffs.length; S.buffs = S.buffs.filter((b) => b.t > 0); if (S.buffs.length !== n) updateBuffs(); }
    if (!cinematic && !modalOpen()) {
      nextMut -= dt;
      if (nextMut <= 0 && !world.mutation) { world.spawnMutation(E.mutationLife(S)); nextMut = E.mutationInterval(S); }
    }
    uiT += dt; saveT += dt;
    if (uiT > 0.2) { uiT = 0; updateHud(); updateResonance(); if (S.buffs.length) updateBuffs(); if (tab === 'evo') { updateGenList(); renderLeap(); } if (!cinematic && !modalOpen()) checkInEpochEvents(); }
    if (saveT > 10) { saveT = 0; save(); }
    // Fragmente & Stimme
    if (!cinematic && !modalOpen()) {
      nextGlitch -= dt;
      if (nextGlitch <= 0 && !world.glitch && fragmentPool().length) {
        world.spawnGlitch();
        nextGlitch = (100 + Math.random() * 110) / (S.intent === 'neugier' ? 2 : 1);
      }
      nextVoice -= dt;
      if (nextVoice <= 0 && !voiceBusy) { say([pick(voiceSet()[S.epoch].idle)]); nextVoice = 45 + Math.random() * 40; }
    }
  }
  world.update(dt);
  if (Math.abs(world.z - world.zTarget) > 0.01 && Math.random() < 0.1) updateRail();
  world.draw();
  requestAnimationFrame(loop);
}

// ── Intro & Startbildschirm ───────────────────────────────────
async function cineLines(lines, holdMs = 2600) {
  const ov = $('overlay');
  for (const l of lines) {
    ov.innerHTML = `<div class="cine">${l}</div>`;
    await wait(60); ov.firstChild.classList.add('on');
    await wait(holdMs);
    ov.firstChild.classList.remove('on');
    await wait(1400);
  }
}
function waitTap(hint = 'BERÜHREN') {
  return new Promise((res) => {
    const ov = $('overlay');
    const h = document.createElement('div'); h.className = 'hint'; h.textContent = hint;
    ov.appendChild(h);
    ov.onclick = () => { ov.onclick = null; h.remove(); res(); };
  });
}

async function firstIntro() {
  cinematic = true;
  document.body.classList.add('cine-mode');
  const ov = $('overlay'); ov.classList.remove('hidden');
  world.mode = 'void';
  ov.innerHTML = '';
  await waitTap('BERÜHREN');
  startAudio();
  await cineLines(['Vor dem Anfang gab es kein Vorher.']);
  await cineLines(['Niemand hat es gewollt.'], 2000);
  music.boom(true); vibrate([80, 60, 200]);
  world.startBang(EPOCHS.map((e) => e.color));
  world.doFlash('#ffffff', 1);
  await wait(2400);
  ov.innerHTML = `<div class="cine">Und doch geschah es.</div><div class="title">UNIVERSUM 144</div>`;
  await wait(60); ov.children[0].classList.add('on'); ov.children[1].classList.add('on');
  await wait(3200);
  ov.classList.add('hidden'); ov.innerHTML = '';
  document.body.classList.remove('cine-mode');
  enterPlay(0.9);
  S.introSeen = true; save();
  cinematic = false;
  voiceEnter(0);
  setTimeout(() => say([creator() ? 'Berühre die Welt.' : '…berühren…'], 'primal'), 7000);
}

function enterPlay(fromZ = null) {
  world.mode = 'play'; world.bang = null;
  world.setEpoch(S.epoch);
  if (fromZ !== null) { world.z = S.epoch + fromZ; world.zRate = 0.7; }
  music.setLevel(S.epoch + 1);
  refreshStatic(); updateHud();
  running = true;
}

function titleScreen(offline) {
  document.body.classList.add('cine-mode');
  const ov = $('overlay'); ov.classList.remove('hidden');
  ov.innerHTML = `<div class="big-title">THE SINGULARITY<br><span>x.${S.universe}</span></div>
    <div class="title on">${creator() ? 'DER SCHÖPFER KEHRT ZURÜCK' : 'EVOLUTION OHNE SCHÖPFER'}</div>
    ${offline > 0 ? `<p class="cine on" style="font-size:20px;margin-top:34px">Während du fort warst, wuchs das Universum um<br><b style="font-family:'Space Grotesk';font-style:normal">${fmt(offline)} ✦</b></p>` : ''}`;
  return waitTap('TIPPEN ZUM FORTFAHREN').then(() => { ov.classList.add('hidden'); ov.innerHTML = ''; document.body.classList.remove('cine-mode'); startAudio(); });
}

function startAudio() {
  music.musicOn = S.settings.music; music.sfxOn = S.settings.sfx;
  music.level = S.epoch + 1;
  music.start();
}

// ── Das Finale: Singularität & Der Gedanke ────────────────────
async function finale() {
  cinematic = true; running = true;
  S.finished = true; save();
  renderLeap();
  world.zMax = 7; world.zTarget = 7;
  world.mode = 'converge'; world.converge = 0;
  music.setLevel(8);
  const conv = setInterval(() => { world.converge = Math.min(0.55, world.converge + 0.01); }, 150);
  for (const l of VOICE.finale) { say([l], 'plural'); }
  await wait(VOICE.finale.length * 5200);
  clearInterval(conv);
  thoughtScreen();
}

function thoughtScreen() {
  cinematic = true;
  world.mode = 'converge'; world.converge = Math.max(world.converge, 0.4);
  const power = E.thoughtPower(S);
  const k = { ...S.constants };
  const spent = () => Object.values(k).reduce((a, b) => a + b, 0);
  // Vorbelegung: gleichmäßig verteilen
  if (spent() > power || spent() === 0) {
    CONSTANTS.forEach((c) => (k[c.id] = 0));
    for (let i = 0; i < power; i++) k[CONSTANTS[i % 5].id]++;
  }
  let intent = S.intent || null;
  document.body.classList.add('cine-mode');
  const ov = $('overlay'); ov.classList.remove('hidden');

  const render = () => {
    const left = power - spent(), st = E.stability(k);
    const stColor = st >= 70 ? '#7cf29c' : st >= E.STABILITY_MIN ? '#ffd166' : '#ff6b81';
    ov.innerHTML = `<div class="thought">
      <div class="kicker" style="font-size:10px;letter-spacing:.28em;color:#fff3b0;font-weight:700">UNIVERSUM ${S.universe} ERKALTET</div>
      <h2>Der Gedanke</h2>
      <div class="sub">Alles Bewusstsein ist eins geworden. Wir können einen neuen Anfang denken. Verteile die Gedankenkraft auf die Kräfte des nächsten Universums.</div>
      <div class="power"><span>Freie Gedankenkraft</span><b>${left} <small style="font-size:13px;color:var(--muted)">von ${power}</small></b></div>
      ${CONSTANTS.map((c) => `<div class="konst" style="--c:${c.color}">
        <div class="top"><div><div class="nm" style="color:${c.color}">${c.name}</div><div class="ef">${c.effect}</div></div>
        <div class="stepper"><button data-c="${c.id}" data-d="-1">−</button><b>${k[c.id]}</b><button data-c="${c.id}" data-d="1">+</button></div></div>
        <div class="pips">${Array.from({ length: CONST_MAX }, (_, i) => `<i class="${i < k[c.id] ? 'on' : ''}"></i>`).join('')}</div></div>`).join('')}
      <div class="stab"><div class="lbl"><span>Balance der Kräfte</span><b style="color:${stColor}">${st} %</b></div>
        <div class="bar"><i style="width:${st}%;background:${stColor}"></i></div>
        <div class="ef" style="font-size:11.5px;color:var(--muted);margin-top:6px">${st < E.STABILITY_MIN ? 'Zu ungleich! Dieses Universum wird zerfallen.' : 'Verteilt die Kräfte zu ungleich, zerfällt das Universum.'}</div></div>
      <div class="section-label">DIE ABSICHT</div>
      <div class="intents">${INTENTS.map((i) => `<button data-i="${i.id}" class="${intent === i.id ? 'sel' : ''}">${i.name}<small>${i.effect}</small></button>`).join('')}</div>
      <button class="hold" id="holdBtn" ${intent ? '' : 'disabled'}><i></i><span>${intent ? 'HALTEN: DEN GEDANKEN DENKEN' : 'WÄHLE EINE ABSICHT'}</span></button>
    </div>`;
    ov.querySelectorAll('.stepper button').forEach((b) => b.onclick = () => {
      const id = b.dataset.c, d = +b.dataset.d;
      if (d > 0 && (spent() >= power || k[id] >= CONST_MAX)) { vibrate(20); return; }
      if (d < 0 && k[id] <= 0) return;
      k[id] += d; music.tap(); render();
    });
    ov.querySelectorAll('.intents button').forEach((b) => b.onclick = () => { intent = b.dataset.i; music.buy(); render(); });
    const hb = $('holdBtn');
    if (intent) bindHold(hb, () => bigBang(k, intent));
  };
  render();
}

function bindHold(btn, done) {
  let t0 = 0, raf = 0, riser = null;
  const fill = btn.querySelector('i');
  const DUR = 2600;
  const step = () => {
    const p = Math.min(1, (performance.now() - t0) / DUR);
    fill.style.width = p * 100 + '%';
    world.converge = 0.4 + p * 0.6;
    if (p >= 1) { cleanup(false); done(); return; }
    raf = requestAnimationFrame(step);
  };
  const start = (e) => { e.preventDefault(); t0 = performance.now(); riser = music.riser(DUR / 1000); vibrate(30); raf = requestAnimationFrame(step); };
  const cleanup = (reset = true) => {
    cancelAnimationFrame(raf);
    if (reset) { fill.style.width = '0'; world.converge = 0.4; riser && riser.stop(); }
  };
  btn.addEventListener('pointerdown', start);
  btn.addEventListener('pointerup', () => cleanup());
  btn.addEventListener('pointerleave', () => cleanup());
  btn.addEventListener('pointercancel', () => cleanup());
}

async function bigBang(k, intent) {
  const ov = $('overlay'); ov.innerHTML = '';
  const st = E.stability(k);
  const colors = [];
  CONSTANTS.forEach((c) => { for (let i = 0; i < Math.max(1, k[c.id]); i++) colors.push(c.color); });
  world.doFlash('#ffffff', 1.2);
  music.boom(true); vibrate([100, 50, 300]);
  world.startBang(colors);
  await wait(2600);

  if (st < E.STABILITY_MIN) {
    // Totgeburt: das Universum zerfällt
    world.mode = 'void';
    world.doFlash('#000000', 0.8);
    ov.classList.remove('hidden');
    await cineLines([`Universum ${S.universe + 1} zerfiel nach vier Sekunden.`, 'So endeten vielleicht die 143 vor uns.'], 2400);
    addTimeline(`Ein Gedanke zerfiel: Universum ${S.universe + 1} hielt nur vier Sekunden.`, 'choice', '#ff6b81');
    save();
    S.constants = k;
    thoughtScreen();
    return;
  }

  // Neues Universum
  addTimeline('<b>Der Gedanke</b><small>Das Kollektiv dachte einen neuen Urknall.</small>', 'leap', '#fff3b0');
  const keep = {
    universe: S.universe + 1, runsDone: S.runsDone + 1, lifetime: S.lifetime,
    fragments: S.fragments, constants: k, intent, timeline: S.timeline,
    settings: S.settings, voiceEntered: S.voiceEntered, introSeen: true,
  };
  S = Object.assign(E.newState(), keep);
  save();
  ov.classList.remove('hidden');
  ov.innerHTML = `<div class="cine">Diesmal war jemand da.</div><div class="title">UNIVERSUM ${S.universe}</div>`;
  await wait(60); ov.children[0].classList.add('on'); ov.children[1].classList.add('on');
  await wait(3600);
  ov.classList.add('hidden'); ov.innerHTML = '';
  document.body.classList.remove('cine-mode');
  voiceBusy = false; voiceQ = [];
  enterPlay(0.9);
  cinematic = false;
  voiceEnter(0);
}

// ── Lebenszyklus (App im Hintergrund) ─────────────────────────
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { save(); music.suspend(); }
  else {
    const away = Math.min((Date.now() - S.lastSeen) / 1000, E.offlineCapSec(S));
    if (running && away > 30 && !S.finished) {
      const gain = E.prodPerSec(S) * away * E.offlineEfficiency(S);
      E.earn(S, gain);
      world.floater(world.cx, world.cy, `+${fmt(gain)} ✦ (offline)`, '#fff3b0');
    }
    S.lastSeen = Date.now();
    music.resume();
  }
});
window.addEventListener('pagehide', save);

// Android (Capacitor): Zurück-Taste speichert und schickt die App in den Hintergrund,
// statt sie hart zu schließen. Offene Fenster werden zuerst geschlossen.
const capApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
if (capApp) {
  capApp.addListener('backButton', () => {
    if (modalOpen() && $('modal').onclick) { closeModal(); return; }
    save();
    capApp.minimizeApp();
  });
}
window.addEventListener('resize', () => world.resize());

// ── Start ─────────────────────────────────────────────────────
(async function boot() {
  requestAnimationFrame(loop);
  if (!S.introSeen) { await firstIntro(); return; }
  // Offline-Ertrag
  const away = Math.min((Date.now() - S.lastSeen) / 1000, E.offlineCapSec(S));
  let offline = 0;
  if (!S.finished && away > 30) { offline = E.prodPerSec(S) * away * E.offlineEfficiency(S); E.earn(S, offline); }
  world.mode = 'play'; world.setEpoch(S.epoch); world.z = S.epoch;
  refreshStatic();
  await titleScreen(offline);
  if (S.finished) { running = true; music.setLevel(8); world.zMax = 7; thoughtScreen(); return; }
  enterPlay();
  const showPending = () => { if (S.pendingEvent) { const ev = EVENTS.find((x) => x.id === S.pendingEvent); if (ev) showEvent(ev); } };
  if (S.pendingTrait) offerTrait(showPending); else showPending();
  say(voiceSet()[S.epoch].idle.slice(0, 1));
})();

// ── Entwickler-Hilfen (nur mit ?dev in der URL) ───────────────
if (location.search.includes('dev')) {
  window.__dev = {
    get S() { return S; },
    give(n) { E.earn(S, n); },
    leapNow() { E.earn(S, E.leapCost(S, S.epoch)); return doLeap(); },
    buyAll(n = 10) { for (let i = 0; i < (S.epoch + 1) * 3; i++) S.owned[i] += n; refreshStatic(); },
    glitch() { world.spawnGlitch(); return world.glitch; },
    mutation() { world.spawnMutation(E.mutationLife(S)); return world.mutation; },
    collect(id) { collectMutation(MUTATIONS.find((m) => m.id === id)); },
    draft() { offerTrait(); },
    get res() { return res; },
    world,
  };
}
