// ─────────────────────────────────────────────────────────────
//  THE SINGULARITY x.144 — Spielablauf & Oberfläche
// ─────────────────────────────────────────────────────────────
import { EPOCHS, GENERATORS, LEAPS, EVENTS, VOICE, FRAGMENTS, CONSTANTS, CONST_MAX, INTENTS, MILESTONES, TRAITS, MUTATIONS, AVATARS, AVATAR_OPTS, AVATAR_NEED, RELIC_TEXT, LAWS, LETTERS, MOMENTS, MYTH_EPOCHS, MYTHS, DOGMAS, ENDINGS, PARADOX_TEXT } from './data.js';
import * as E from './economy.js';
import { World } from './render.js';
import { Soundtrack } from './audio.js';
import { fmt, fmtRate } from './format.js';
import { createAkt2 } from './akt2.js';
import { AGES } from './akt2data.js';
import * as SI from './sicherung.js';
import * as KO from './kosmos.js';

const SAVE_KEY = 'singularity-x144';
const SNAP_KEY = 'singularity-x144-snap';
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
const COSMOS_ON = !location.search.includes('dev') || location.search.includes('cosmos');   // Tests nicht stören
let nextCosmic = KO.cosmosWait(true), lastCosmic = null, cosmic = null;   // V6.1: kosmische Ereignisse
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
let restoring = false;      // V6: während des Einspielens einer Sicherung darf nichts mehr gespeichert werden
function save() {
  if (restoring) return;
  S.lastSeen = Date.now();
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch { /* voll/privat */ }
}

// ── Hilfen ────────────────────────────────────────────────────
// Tippen auf Buttons über pointerup statt click: Android erzeugt kein click, solange andere Finger
// (z. B. beim Mehrfinger-Tippen auf der Welt) gedrückt sind. Scrollen löst pointercancel aus → kein Kauf.
function onTap(el, fn) {
  let id = null, x0 = 0, y0 = 0;
  el.addEventListener('pointerdown', (e) => { id = e.pointerId; x0 = e.clientX; y0 = e.clientY; });
  el.addEventListener('pointerup', (e) => { if (e.pointerId !== id) return; id = null; if (Math.hypot(e.clientX - x0, e.clientY - y0) < 14) fn(e); });
  el.addEventListener('pointercancel', () => { id = null; });
  el.addEventListener('click', (e) => { if (e.detail === 0) fn(e); });   // Tastatur / Screenreader
}
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
    onTap(b, () => { if (e <= S.epoch) { world.zTarget = e; world.userZoom = e !== S.epoch; world.zRate = 3; } });
    rail.appendChild(b);
  });
  updateRail();
}
function updateRail() {
  const cur = Math.round(world.zTarget);
  [...$('rail').children].forEach((b, e) => {
    b.className = e > S.epoch ? 'locked' : 'unlocked' + (e === cur ? ' current' : '') + (world.relics.some((r) => r.e === e) ? ' relic' : '');
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
      onTap(b, () => buyGen(i));
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
    onTap(card.firstChild, doLeap);
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
  const traitsHtml = S.traits.length ? `<div class="traits-head">MERKMALE</div>${S.traits.map((id) => { const t = TRAITS.find((x) => x.id === id); return `<div class="trait"><b>${t.name}</b><small>${t.effect}</small></div>`; }).join('')}` : '';
  const relHtml = S.relics.length ? `<div class="traits-head">RELIKTE ${S.relics.length}/${E.legacyIds(S).length}</div>${S.relics.map((id) => { const o = AVATAR_OPTS[id]; return `<div class="av-card" style="--c:#ffb347"><b>${o.name}</b><small>Echo: die Hälfte von „${o.aura.text}“</small></div>`; }).join('')}` : '';
  const lawHtml = S.law ? (() => { const l = LAWS.find((x) => x.id === S.law); return `<div class="traits-head">GESETZ DES UNIVERSUMS</div><div class="law-card"><b>${l.name}</b><small>${l.text}</small></div>`; })() : '';
  const avHtml = S.avatars.length ? `<div class="traits-head">AVATARE</div>${S.avatars.map((id) => { const o = AVATAR_OPTS[id]; return `<div class="av-card" style="--c:${EPOCHS[o.epoch].color}"><b>${o.name}</b><small>${o.aura.text}</small><small>„${o.power.name}": ${o.power.text} · alle ${o.power.cd} s</small></div>`; }).join('')}` : '';
  if (!S.timeline.length) { box.innerHTML = lawHtml + avHtml + relHtml + traitsHtml + '<div class="empty">Noch ist nichts geschehen.<br>Die Geschichte dieses Universums wird hier geschrieben.</div>' + '<button class="btn ghost" id="chronikBtn" style="margin:14px 0 0">Chronik ansehen &amp; teilen</button>'; onTap($('chronikBtn'), openChronik); return; }
  let html = '', u = null;
  for (const t of S.timeline) {
    if (t.u !== u) { u = t.u; html += `<div class="tl-u">UNIVERSUM ${u}</div>`; }
    html += `<div class="tl ${t.kind === 'choice' ? 'choice' : ''}" style="--c:${t.c}">${t.text}</div>`;
  }
  box.innerHTML = lawHtml + avHtml + relHtml + traitsHtml + ((lawHtml || avHtml || relHtml || traitsHtml) ? '<div class="traits-head" style="margin-top:14px">ZEITLINIE</div>' : '') + html + '<button class="btn ghost" id="chronikBtn" style="margin:14px 0 0">Chronik ansehen &amp; teilen</button>';
  onTap($('chronikBtn'), openChronik);
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
  if (S.letters) {
    html += `<div class="traits-head" style="margin-top:16px">BRIEFE DER VORGÄNGER ${S.letters}/${LETTERS.length}</div>`;
    html += LETTERS.slice(0, S.letters).map((L, i) => `<div class="frag letter"><small>UNIVERSUM ${L.from} · ${L.title.toUpperCase()}</small>${letterBody(i)}${S.letterChoices[i] ? `<br><br><small>Deine Antwort: ${L.choice[S.letterChoices[i]].label}</small>` : ''}</div>`).join('');
  }
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
  buildRail(); buildGenList(); renderLeap(); renderFragments(); buildDock(); syncRelics(); buildParadox();
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
  music.boom(); world.doFlash(EPOCHS[S.epoch].color, 0.9); world.shake = KO.leapShake(S.epoch); vibrate(KO.leapHaptik(S.epoch));
  world.setEpoch(S.epoch, true);
  music.setLevel(S.epoch + 1);
  refreshStatic();
  voiceEnter(S.epoch);
  await wait(2600);
  cinematic = false;
  queueStory();
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
    ${S.akt === 1 ? '<button class="btn ghost" id="a2Preview">Akt II: Der Orden (Vorschau)</button>' : (S.a2 && S.a2.preview ? '<button class="btn ghost" id="a2Back">Zurück zu Akt I</button>' : '')}
    <button class="btn ghost" id="chronikSet">Chronik ansehen &amp; teilen</button>
    <button class="btn ghost" id="backupSet">Spielstand sichern <small style="opacity:.6">· zuletzt ${SI.ageText(S.lastBackup)}</small></button>
    <button class="btn ghost" id="closeSet">Schließen</button>
    <button class="btn danger" id="resetBtn">Spielstand löschen</button>`);
  for (const b of $('modalCard').querySelectorAll('.switch')) b.onclick = () => {
    const k = b.dataset.k; S.settings[k] = !S.settings[k]; b.classList.toggle('on', S.settings[k]);
    music.setMusic(S.settings.music); music.setSfx(S.settings.sfx); save();
  };
  $('closeSet').onclick = closeModal;
  $('chronikSet').onclick = openChronik;
  $('backupSet').onclick = openBackup;
  if ($('a2Preview')) $('a2Preview').onclick = () => { closeModal(); A2.enter(true); };
  if ($('a2Back')) $('a2Back').onclick = () => { closeModal(); A2.leave(); enterPlay(); };
  let armed = false;
  $('resetBtn').onclick = (e) => {
    if (!armed) { armed = true; e.target.textContent = 'Wirklich alles löschen? Nochmal tippen'; return; }
    localStorage.removeItem(SAVE_KEY); location.reload();
  };
}

// ── V6: Spielstand sichern ────────────────────────────────────
const snaps = () => { try { return JSON.parse(localStorage.getItem(SNAP_KEY)) || []; } catch { return []; } };
function takeSnapshot(save, force = false) {       // „save" = Spielstand-Objekt; Ring aus 3 Schnappschüssen
  try { localStorage.setItem(SNAP_KEY, JSON.stringify(SI.addSnapshot(snaps(), save, Date.now(), force))); } catch { /* voll */ }
}
const dateStr = (ts) => new Date(ts).toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const infoLine = (i) => `Universum ${i.universe}${i.akt === 2 ? ' · Akt II' : ''} · ${i.runsDone} Durchläufe${i.orakelTage ? ` · ${i.orakelTage} Orakel-Tage` : ''}`;

async function exportBackup() {
  save(); const b = SI.packBackup(S), text = SI.toText(b);
  const name = `singularity-x144-u${S.universe}-${new Date().toISOString().slice(0, 10)}.json`;
  const P = window.Capacitor && window.Capacitor.Plugins;
  let how = 'fail';
  try {
    if (P && P.Filesystem && P.Share) {
      const f = await P.Filesystem.writeFile({ path: name, data: text, directory: 'CACHE', encoding: 'utf8' });
      await P.Share.share({ title: 'Sicherung – The Singularity x.144', url: f.uri, dialogTitle: 'Sicherung speichern oder senden' }); how = 'shared';
    } else {
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name;
      document.body.appendChild(a); a.click(); a.remove(); how = 'download';
    }
  } catch (e) { if (e && (e.name === 'AbortError' || /cancel/i.test(e.message || ''))) return 'cancel'; how = 'fail'; }
  if (how === 'fail') { try { await navigator.clipboard.writeText(SI.toCode(b)); how = 'copied'; } catch { /* */ } }
  if (how !== 'fail') { S.lastBackup = Date.now(); save(); }
  return how;
}
function openBackup() {
  const sn = snaps();
  openModal(`<div class="kicker">SICHERUNG</div><h2>Spielstand sichern</h2>
    <p style="font-size:13px;color:var(--muted);margin:0 0 10px">Dein Spielstand liegt nur auf diesem Gerät. Sichere ihn als Datei (z. B. an Google Drive, Mail oder dich selbst senden), bevor du die App neu installierst oder das Handy wechselst.<br>Zuletzt gesichert: <b>${SI.ageText(S.lastBackup)}</b></p>
    <button class="btn" id="bkExport">Als Datei sichern / senden</button>
    <button class="btn ghost" id="bkCode">Code kopieren</button>
    <button class="btn ghost" id="bkImport">Sicherung einspielen …</button>
    ${sn.length ? `<div class="kicker" style="margin-top:14px">AUTOMATISCHE SCHNAPPSCHÜSSE</div>${sn.map((x, i) => `<div class="row"><span style="font-size:12.5px">${dateStr(x.at)}<br><small style="color:var(--muted)">${infoLine(x.info)}</small></span><button class="btn ghost" data-snap="${i}" style="width:auto;margin:0;padding:6px 12px">Laden</button></div>`).join('')}` : ''}
    <div id="bkMsg" style="font-size:12.5px;color:var(--muted);min-height:18px;margin:8px 0"></div>
    <button class="btn ghost" id="bkClose">Zurück</button>`);
  $('bkClose').onclick = openSettings;
  $('bkExport').onclick = async () => {
    const r = await exportBackup();
    $('bkMsg').textContent = r === 'cancel' ? 'Abgebrochen.' : r === 'fail' ? 'Sichern hat nicht geklappt.' : r === 'copied' ? 'Teilen nicht möglich: Der Code liegt in der Zwischenablage.' : 'Gesichert ✓';
  };
  $('bkCode').onclick = async () => {
    save(); try { await navigator.clipboard.writeText(SI.toCode(SI.packBackup(S))); S.lastBackup = Date.now(); save(); $('bkMsg').textContent = 'Code kopiert ✓ (in einer Notiz oder Mail aufbewahren).'; }
    catch { $('bkMsg').textContent = 'Kopieren nicht möglich. Nutze „Als Datei sichern".'; }
  };
  $('bkImport').onclick = openImport;
  for (const b of $('modalCard').querySelectorAll('[data-snap]')) b.onclick = () => { const x = sn[+b.dataset.snap]; previewRestore(SI.packBackup(x.save, x.at), openBackup); };
}
function openImport() {
  openModal(`<div class="kicker">SICHERUNG EINSPIELEN</div><h2>Wiederherstellen</h2>
    <p style="font-size:13px;color:var(--muted);margin:0 0 10px">Wähle die Sicherungsdatei oder füge den Code ein (beginnt mit SX144:).</p>
    <label class="btn ghost" style="display:block;text-align:center">Datei wählen<input type="file" id="bkFile" accept=".json,application/json,text/plain" style="display:none"></label>
    <textarea id="bkText" rows="4" placeholder="SX144:…" style="width:100%;box-sizing:border-box;margin:8px 0;background:rgba(255,255,255,.06);color:var(--text,#fff);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px;font-size:12px"></textarea>
    <div id="bkMsg" style="font-size:12.5px;color:#ff8a8a;min-height:18px;margin-bottom:8px"></div>
    <button class="btn" id="bkRead">Prüfen</button><button class="btn ghost" id="bkBack">Zurück</button>`);
  $('bkBack').onclick = openBackup;
  const go = (text) => { const r = SI.parseBackup(text); if (!r.ok) { $('bkMsg').textContent = r.error; return; } previewRestore(r.backup, openImport); };
  $('bkRead').onclick = () => go($('bkText').value);
  $('bkFile').onchange = async (e) => { const f = e.target.files[0]; if (f) go(await f.text()); };
}
function previewRestore(b, back) {
  const cur = infoLine(SI.info(S));
  openModal(`<div class="kicker">SICHERUNG GEFUNDEN</div><h2>Diesen Stand laden?</h2>
    <div class="row"><span><small style="color:var(--muted)">Sicherung (${dateStr(b.exportedAt)})</small><br><b>${infoLine(b.info)}</b></span></div>
    <div class="row"><span><small style="color:var(--muted)">Aktuell auf diesem Gerät</small><br>${cur}</span></div>
    <p style="font-size:12.5px;color:var(--muted)">Der aktuelle Stand wird vorher automatisch als Schnappschuss abgelegt, du kannst also zurück.</p>
    <button class="btn" id="bkGo">Sicherung laden</button><button class="btn ghost" id="bkNo">Abbrechen</button>`);
  $('bkNo').onclick = back;
  $('bkGo').onclick = () => {
    save(); takeSnapshot(S, true);
    const s = Object.assign({}, b.save, { lastBackup: Date.now() });
    restoring = true;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch { restoring = false; $('bkGo').textContent = 'Speichern nicht möglich'; return; }
    restoring = true; location.reload();
  };
}
// Sanfte Erinnerung: höchstens alle 3 Tage, wenn die letzte Sicherung ≥ 7 Tage her ist
function backupReminder() {
  if (location.search.includes('dev') && !location.search.includes('remind')) return;   // Tests nicht stören
  if (!SI.needsReminder(S)) return;
  const t = setInterval(() => {
    if (modalOpen() || cinematic) return;
    clearInterval(t); S.backupAsked = Date.now(); save();
    openModal(`<div class="kicker">KLEINE ERINNERUNG</div><h2>Spielstand sichern?</h2>
      <p style="font-size:13px;color:var(--muted)">Dein Spielstand liegt nur auf diesem Handy. ${S.lastBackup ? `Die letzte Sicherung ist ${SI.ageText(S.lastBackup)}.` : 'Du hast ihn noch nie gesichert.'} Es dauert nur einen Moment.</p>
      <button class="btn" id="rmGo">Jetzt sichern</button><button class="btn ghost" id="rmNo">Später</button>`);
    $('rmNo').onclick = closeModal; $('rmGo').onclick = openBackup;
  }, 6000);
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
  if (world.moment && world.hitMoment(e.clientX, e.clientY)) return;
  const rel = world.hitRelic(e.clientX, e.clientY);
  if (rel) { collectRelic(rel.id); return; }
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
  if (now - lastTap > 60) vibrate(KO.tapHaptik(S.epoch));
  lastTap = now;
}

// ── V2: Mutationen ────────────────────────────────────────────
function pickMutation() {
  const total = MUTATIONS.reduce((a, m) => a + m.w, 0);
  let r = Math.random() * total;
  for (const m of MUTATIONS) { r -= m.w; if (r <= 0) return m; }
  return MUTATIONS[0];
}
function collectMutation(forced, fromPower) {
  const m = forced || pickMutation();
  if (!fromPower) S.acts.mutation++;
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
    if (old) old.t = m.dur; else S.buffs.push({ id: m.id, n: m.name, k: m.kind, m: mult, t: m.dur });
    text = `×${fmt(mult)} ${m.kind === 'prod' ? 'Produktion' : 'Tippen'}`;
  }
  world.floater(world.cx, world.cy - 70, `${m.name}: ${text}`, '#7cf29c');
  updateHud(); updateBuffs(); save();
}
function updateBuffs() {
  $('buffs').innerHTML = S.buffs.map((b) => `<b>${b.n || b.id} ×${fmt(b.m)} · ${Math.ceil(b.t)} s</b>`).join('');
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

// ── V2: Avatare (je Epoche erwacht eine Gestalt, zwei Wege) ───
const epochOwned = (e) => S.owned[e * 3] + S.owned[e * 3 + 1] + S.owned[e * 3 + 2];
const avatarOf = (e) => S.avatars.find((id) => AVATAR_OPTS[id].epoch === e);
function checkAvatars() {
  if (S.pendingAvatar || S.pendingEvent || S.pendingTrait || cinematic || modalOpen()) return;
  for (let e = 1; e <= S.epoch; e++) {
    if (AVATARS[e] && !avatarOf(e) && epochOwned(e) >= AVATAR_NEED) { S.pendingAvatar = e; save(); showAvatar(e); return; }
  }
}
function powerText(o) { return `${o.aura.text} · „${o.power.name}": ${o.power.text} (alle ${o.power.cd} s)`; }
function showAvatar(e) {
  const av = AVATARS[e];
  music.boom(); vibrate([30, 40, 80]); world.doFlash(EPOCHS[e].color, 0.5);
  const opt = (o) => `<button class="choice-btn" data-id="${o.id}" style="--c:${EPOCHS[e].color}"><b>${o.name}</b><span>${o.sub}</span><em>${powerText(o)}</em></button>`;
  openModal(`<div class="kicker">✦ EIN AVATAR ERWACHT · ${creator() ? 'DU LENKST' : 'DIE EVOLUTION BRINGT HERVOR'}</div><h2>${av.title}</h2><p>${av.lore}</p>${av.options.map(opt).join('')}`, false);
  for (const b of $('modalCard').querySelectorAll('.choice-btn')) b.onclick = () => chooseAvatar(b.dataset.id);
}
function chooseAvatar(id) {
  const o = AVATAR_OPTS[id];
  S.avatars.push(id); S.pendingAvatar = null; S.avatarCd[id] = 0;
  closeModal();
  addTimeline(`Avatar: <b>${o.name}</b><small>${o.aura.text} · ${o.power.name}</small>`, 'choice', EPOCHS[o.epoch].color);
  world.doFlash(EPOCHS[o.epoch].color, 0.6); world.burst(world.cx, world.cy, EPOCHS[o.epoch].color, 60, 1.8); vibrate([40, 30, 40]);
  say([AVATARS[o.epoch].voice]);
  refreshStatic(); updateHud(); save();
}
function buildDock() {
  const dock = $('dock'); dock.innerHTML = '';
  for (const id of S.avatars) {
    const o = AVATAR_OPTS[id], b = document.createElement('button');
    b.className = 'av'; b.dataset.id = id; b.style.setProperty('--c', EPOCHS[o.epoch].color);
    b.setAttribute('aria-label', `${o.name}: ${o.power.name}`);
    b.innerHTML = `<span>${o.ic}</span>`;
    onTap(b, () => firePower(id));
    dock.appendChild(b);
  }
  updateDock();
}
function updateDock() {
  for (const b of $('dock').children) {
    const id = b.dataset.id, cd = S.avatarCd[id] || 0, max = AVATAR_OPTS[id].power.cd;
    b.classList.toggle('ready', cd <= 0);
    b.style.setProperty('--p', Math.max(0, cd / max * 100).toFixed(1));
  }
}
function firePower(id) {
  if (cinematic || S.finished || modalOpen() || world.moment) return;
  const o = AVATAR_OPTS[id], cd = S.avatarCd[id] || 0;
  if (cd > 0) { vibrate(15); world.floater(world.cx, world.cy - 60, `${o.power.name} · noch ${Math.ceil(cd)} s`, '#ffffff'); return; }
  S.avatarCd[id] = o.power.cd; S.acts.kraft++;
  const col = EPOCHS[o.epoch].color;
  music.boom(); vibrate([20, 30, 60]); world.doFlash(col, 0.35); world.burst(world.cx, world.cy, col, 50, 1.6);
  world.floater(world.cx, world.cy - 80, `${o.name}: ${o.power.name}`, col);
  for (const fx of o.power.fx) {
    if (fx.t === 'burst') {
      const old = S.buffs.find((b) => b.id === id && b.k === fx.k);
      if (old) old.t = fx.dur; else S.buffs.push({ id, n: o.power.name, k: fx.k, m: fx.m, t: fx.dur });
    } else if (fx.t === 'gain') {
      const gain = E.prodPerSec(S) * fx.secs + E.tapValue(S, undefined, 0) * 20;
      E.earn(S, gain); world.floater(world.cx, world.cy - 40, `+${fmt(gain)} ✦`, '#ffffff');
    } else if (fx.t === 'mutation') {
      collectMutation(undefined, true);
    } else if (fx.t === 'fragment') {
      if (fragmentPool().length && !world.glitch) world.spawnGlitch();
      else { const gain = E.prodPerSec(S) * 60; E.earn(S, gain); world.floater(world.cx, world.cy - 40, `+${fmt(gain)} ✦`, '#ffffff'); }
    }
  }
  updateHud(); updateBuffs(); updateDock(); save();
}
// Abklingzeiten laufen mit der Spielzeit (und offline)
function tickAvatarCd(sec) { const r = sec * E.auraMult(S, 'cd'); for (const id of S.avatars) if (S.avatarCd[id] > 0) S.avatarCd[id] = Math.max(0, S.avatarCd[id] - r); }

// ── V3: Story-Warteschlange (Gesetz → Brief → Moment → Avatar) ─
function checkQueue() {
  if (!running || S.finished || cinematic || modalOpen() || world.moment || S.pendingEvent || S.pendingTrait || S.pendingAvatar) return;
  if (S.pendingLaw) { showLaw(); return; }
  if (S.pendingLetter !== null) { showLetter(S.pendingLetter); return; }
  if (S.pendingMoment) { startMoment(S.pendingMoment); return; }
  if (S.pendingMyth) { showMyth(S.pendingMyth); return; }
  checkAvatars();
}
// beim Eintritt in eine Epoche: Brief der Vorgänger (ab Durchlauf 2, in Landgang und Technosphäre) und Epochen-Moment vormerken
function queueStory() {
  if (creator() && (S.epoch === 3 || S.epoch === 6) && S.pendingLetter === null && S.letters < LETTERS.length) S.pendingLetter = S.letters;
  if (MOMENTS[S.epoch] && !S.moments.includes(S.epoch)) S.pendingMoment = S.epoch;
  if (creator() && MYTHS[S.epoch] && !S.myths.some((m) => m.e === S.epoch)) S.pendingMyth = S.epoch;
  save();
}

// ── V4: Mythologie ────────────────────────────────────────────
function showMyth(e) {
  const type = E.dominantAct(S), def = MYTHS[e][type];
  music.boom(); vibrate([20, 40, 20]); world.doFlash('#e9b3ff', 0.35);
  const dog = Object.entries(DOGMAS).filter(([, d]) => d.e === e);
  openModal(`<div class="kicker" style="color:#e9b3ff">MYTHOS · ${MYTH_EPOCHS[e].toUpperCase()}</div><h2>${def.name}</h2><p class="quote">${def.text}</p><p style="font-size:13px;color:var(--muted);margin:10px 0 6px">Die Menschen haben deine Eingriffe gedeutet. Welches Dogma wächst daraus?</p>${dog.map(([id, d]) => `<button class="choice-btn" data-id="${id}"><b>${d.name}</b><em>${d.text}</em></button>`).join('')}`, false);
  for (const b of $('modalCard').querySelectorAll('.choice-btn')) b.onclick = () => finishMyth(e, type, b.dataset.id);
}
function finishMyth(e, type, dogmaId) {
  const def = MYTHS[e][type], d = DOGMAS[dogmaId];
  S.myths.push({ e, id: type, name: def.name, dogma: dogmaId }); S.pendingMyth = null;
  if (!S.pantheon.some((g) => g.name === def.name)) S.pantheon.push({ u: S.universe, name: def.name });
  closeModal();
  addTimeline(`Mythos: <b>${def.name}</b><small>Dogma „${d.name}": ${d.text}</small>`, 'choice', '#e9b3ff');
  world.doFlash('#e9b3ff', 0.5); vibrate(40);
  updateHud(); save(); if (tab === 'time') renderTimeline();
}

// ── V4: Zeitparadox ───────────────────────────────────────────
const paradoxOpen = () => S.epoch >= 3 && !S.finished;
function buildParadox() {
  const box = $('paradoxCard');
  if (!paradoxOpen()) { box.innerHTML = ''; return; }
  box.innerHTML = `<div class="paradox"><div class="ph"><b>ZEITPARADOX</b><span class="pv"></span></div><div class="pbar"><i></i></div><div class="pbtns"></div><small class="phint">Sende Wissen in eine frühere Epoche: Sie produziert +100 % je Sendung (max. ${E.TUNING.sendMax}), alles +${E.TUNING.sendBonus * 100} %. Kosten ${E.TUNING.sendCost * 100} % deiner ✦. Bei über 100 % Paradox reißt die Zeit und alle Sendungen gehen verloren.</small></div>`;
  const btns = box.querySelector('.pbtns');
  for (let e = 0; e < S.epoch; e++) {
    const b = document.createElement('button'); b.dataset.e = e;
    b.innerHTML = `<span>${EPOCHS[e].name}</span><small></small>`;
    onTap(b, () => sendKnowledge(e));
    btns.appendChild(b);
  }
  updateParadox();
}
function updateParadox() {
  const box = $('paradoxCard'); if (!box.firstChild) return;
  const p = Math.round(S.paradox);
  box.querySelector('.pv').textContent = `Paradox ${p} %`;
  const bar = box.querySelector('.pbar i'); bar.style.width = `${Math.min(100, S.paradox)}%`; bar.classList.toggle('hot', S.paradox > 75);
  for (const b of box.querySelectorAll('.pbtns button')) {
    const n = S.sent[b.dataset.e] || 0;
    b.querySelector('small').textContent = `${n}/${E.TUNING.sendMax} gesendet · ×${n + 1}`;
    b.classList.toggle('maxed', n >= E.TUNING.sendMax);
  }
}
function sendKnowledge(e) {
  if (cinematic || S.finished || modalOpen() || world.moment || !paradoxOpen()) return;
  if ((S.sent[e] || 0) >= E.TUNING.sendMax) { vibrate(20); return; }
  const cost = S.complexity * E.TUNING.sendCost;
  S.complexity -= cost; S.sent[e] = (S.sent[e] || 0) + 1; S.paradox += E.TUNING.paradoxPerSend; S.acts.kraft++;
  music.boom(); vibrate([20, 30, 40]); world.doFlash('#c77dff', 0.3); world.burst(world.cx, world.cy, '#c77dff', 40, 1.5);
  world.floater(world.cx, world.cy - 60, `Wissen → ${EPOCHS[e].name}`, '#c77dff');
  say([PARADOX_TEXT[e]], 'plural');
  if (S.paradox > 100) ripParadox();
  updateParadox(); updateHud(); save();
}
function ripParadox() {
  S.sent = {}; S.paradox = 0; S.complexity *= 0.6;
  world.shake = 1.2; world.doFlash('#ff6b81', 0.9); music.boom(true); vibrate([80, 40, 160]);
  world.floater(world.cx, world.cy - 20, 'Die Zeit reißt!', '#ff6b81');
  addTimeline('Zeitparadox: <b>Die Zeit riss</b><small>Alle Sendungen gingen verloren, 40 % der ✦ auch.</small>', 'choice', '#ff6b81');
  say(['Die Zeit reißt. Was wir sendeten, ist nie geschehen.'], 'plural');
  updateParadox(); updateHud();
}

// ── V4: Enden ─────────────────────────────────────────────────
function showEnding(fresh) {
  const en = ENDINGS[S.ending], ids = Object.keys(ENDINGS);
  return new Promise((res) => {
    music.boom(true); world.doFlash('#ffffff', 0.8); vibrate([60, 40, 120]);
    const row = ids.map((id) => `<div class="chronik-row${id === S.ending ? ' now' : ''}" style="margin-bottom:5px"><b style="font-size:12.5px">${S.endings.includes(id) ? ENDINGS[id].name : '▒▒▒ ▒▒▒▒▒▒'}</b></div>`).join('');
    openModal(`<div class="kicker" style="color:#fff3b0">DAS ENDE · SIEGEL ${S.endings.length}/${ids.length}</div><h2>${en.name}</h2><p class="quote">${en.text}</p><p style="font-size:13px;color:#fff3b0">${fresh ? 'Neues Siegel: +3 % Produktion in allen künftigen Universen.' : 'Dieses Ende kennst du bereits.'}</p><div style="margin:10px 0 12px">${row}</div><button class="btn">Den Gedanken denken</button>`, false);
    $('modalCard').querySelector('.btn').onclick = () => { closeModal(); res(); };
  });
}

// ── V4: Chronik ───────────────────────────────────────────────
const stripHtml = (h) => h.replace(/<small>/g, ' – ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
function chronikEntry() {
  if (S.akt === 2 && S.a2) { const a2 = S.a2; return { u: S.universe, akt: 2, run: a2.run, dim: a2.dim, ending: null, min: Math.round(a2.playTime / 60), mentors: a2.mentors.map((id) => id), layers: a2.layers, avatars: [], myths: [], relics: 0 }; }
  return { u: S.universe, law: S.law, ending: S.ending, avatars: S.avatars.map((id) => AVATAR_OPTS[id].name), myths: S.myths.map((m) => m.name),
    min: Math.round(S.playTime / 60), ethik: S.ethik, letters: S.letters, relics: S.relics.length, sent: E.totalSent(S) };
}
function entryLines(en, live) {
  if (en.akt === 2) { const o = ['Akt II: Der Orden']; if (en.dim) o.push(`Dimension: ${en.dim}`); if (typeof en.ending === 'string' && en.ending) o.push(`Ende: ${en.ending}`); o.push(`Schicksalsebenen: ${en.layers}/7`); o.push(`${live ? 'Bisher' : 'Dauer'}: ${en.min} min`); return o; }
  const law = en.law ? LAWS.find((l) => l.id === en.law)?.name : null;
  const out = [];
  out.push(`Gesetz: ${law || 'keines'}`);
  if (en.ending) out.push(`Ende: ${ENDINGS[en.ending].name}`);
  if (en.avatars.length) out.push(`Avatare: ${en.avatars.join(', ')}`);
  if (en.myths.length) out.push(`Mythen: ${en.myths.join(', ')}`);
  if (en.relics) out.push(`Relikte gefunden: ${en.relics}`);
  out.push(`${live ? 'Bisher' : 'Dauer'}: ${en.min} min`);
  return out;
}
function chronikText() {
  const L = [`THE SINGULARITY x.144 · CHRONIK`, ''];
  const missing = S.universe - 144 - S.chronik.length;
  if (missing > 0) L.push(`Universum 144–${144 + missing - 1}: vor Beginn der Chronik`, '');
  for (const en of S.chronik) { L.push(`Universum ${en.u}`); entryLines(en).forEach((x) => L.push(`  ${x}`)); L.push(''); }
  L.push(`Universum ${S.universe} (aktuell, ${S.akt === 2 && S.a2 ? AGES[S.a2.age].name : EPOCHS[S.epoch].name})`);
  entryLines({ ...chronikEntry(), ending: S.ending }, true).forEach((x) => L.push(`  ${x}`));
  const tl = S.timeline.filter((t) => t.u === S.universe).map((t) => stripHtml(t.text)).slice(-14);
  if (tl.length) { L.push('  Zeitleiste:'); tl.forEach((t) => L.push(`   · ${t}`)); }
  L.push('', `Siegel: ${S.endings.length}/${Object.keys(ENDINGS).length} Enden · Pantheon: ${S.pantheon.length} Götter · Briefe: ${S.letters}/${LETTERS.length} · Ethik: ${S.ethik > 0 ? '+' : ''}${S.ethik}`);
  return L.join('\n');
}
async function shareText(title, text) {
  const cs = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share;
  try {
    if (cs) { await cs.share({ title, text, dialogTitle: 'Chronik teilen' }); return 'shared'; }
    if (navigator.share) { await navigator.share({ title, text }); return 'shared'; }
  } catch (e) { if (e && (e.name === 'AbortError' || /cancel/i.test(e.message || ''))) return 'cancel'; }
  try { await navigator.clipboard.writeText(text); return 'copied'; } catch { /* kein Zugriff */ }
  return 'fail';
}
function openChronik() {
  const missing = S.universe - 144 - S.chronik.length;
  const card = (en, live) => `<div class="chronik-row${live ? ' now' : ''}"><b>Universum ${en.u}${live ? ' · aktuell' : ''}</b>${entryLines(en, live).join('<br>')}</div>`;
  openModal(`<div class="kicker">CHRONIK</div><h2>Deine Universen</h2>
    ${missing > 0 ? `<div class="chronik-row">Universum 144–${144 + missing - 1}<br>vor Beginn der Chronik</div>` : ''}
    ${S.chronik.map((en) => card(en)).join('')}${card({ ...chronikEntry(), ending: S.ending }, true)}
    <p style="font-size:12.5px;color:var(--muted);margin:10px 0">Siegel ${S.endings.length}/${Object.keys(ENDINGS).length} · Pantheon ${S.pantheon.length} · Briefe ${S.letters}/${LETTERS.length}</p>
    <button class="btn" id="shareBtn">Chronik teilen</button><button class="btn ghost" id="closeChr">Schließen</button>`);
  $('closeChr').onclick = closeModal;
  $('shareBtn').onclick = async (e) => {
    const r = await shareText('Meine Chronik – The Singularity x.144', chronikText());
    e.target.textContent = r === 'copied' ? 'In die Zwischenablage kopiert ✓' : r === 'fail' ? 'Teilen nicht möglich' : 'Chronik teilen';
  };
}

// ── V3: Kosmische Gesetze ─────────────────────────────────────
function ensureLaw() {
  if (!creator() || S.law) return;
  S.law = pick(LAWS.filter((l) => l.id !== S.lastLaw)).id; S.pendingLaw = true; save();
}
function showLaw() {
  const l = LAWS.find((x) => x.id === S.law);
  music.boom(); world.doFlash('#c77dff', 0.3);
  openModal(`<div class="kicker" style="color:#c77dff">DAS GESETZ VON UNIVERSUM ${S.universe}</div><h2>${l.name}</h2><p>${l.text}</p><p style="font-size:12.5px;color:var(--muted)">Jedes Universum, das du denkst, folgt seinem eigenen Gesetz.</p><button class="btn">Verstanden</button>`, false);
  $('modalCard').querySelector('.btn').onclick = () => { S.pendingLaw = false; closeModal(); save(); if (tab === 'time') renderTimeline(); };
}

// ── V3: Briefe der Vorgänger ──────────────────────────────────
function letterBody(i) {
  const L = LETTERS[i];
  if (!L.final) return L.text;
  const k = S.ethik > 0 ? 'pos' : S.ethik < 0 ? 'neg' : 'zero';
  return `${L.text}<br><br>${L.tail[k]}<br><br>${L.last}`;
}
function showLetter(idx) {
  const L = LETTERS[idx];
  if (!L) { S.pendingLetter = null; return; }
  music.boom(); vibrate([20, 40, 20]);
  const head = `<div class="kicker" style="color:#ffd166">BRIEF · AUS UNIVERSUM ${L.from}</div><h2>${L.title}</h2><p class="quote">${letterBody(idx)}</p>`;
  if (L.choice) {
    openModal(`${head}<p style="font-size:13px;color:var(--muted);margin:10px 0 6px">${L.choice.q}</p><button class="choice-btn" data-k="a"><b>${L.choice.a.label}</b></button><button class="choice-btn" data-k="b"><b>${L.choice.b.label}</b></button>`, false);
    for (const b of $('modalCard').querySelectorAll('.choice-btn')) b.onclick = () => finishLetter(idx, b.dataset.k);
  } else {
    openModal(`${head}<button class="btn">Weiter</button>`, false);
    $('modalCard').querySelector('.btn').onclick = () => finishLetter(idx);
  }
}
function finishLetter(idx, k) {
  const L = LETTERS[idx];
  if (S.letters === idx) S.letters = idx + 1;
  S.pendingLetter = null;
  if (k) { S.letterChoices[idx] = k; S.ethik += L.choice[k].ethik; }
  addTimeline(`Brief aus Universum ${L.from}: <b>${L.title}</b>${k ? `<small>${L.choice[k].label}</small>` : ''}`, 'choice', '#ffd166');
  save(); renderFragments();
  if (k) {
    openModal(`<div class="kicker" style="color:#ffd166">ANTWORT AUS UNIVERSUM ${L.from}</div><p class="quote">${L.choice[k].reply}</p><button class="btn">Weiter</button>`, false);
    $('modalCard').querySelector('.btn').onclick = closeModal;
  } else closeModal();
  if (L.final) { world.doFlash('#ffffff', 1); music.boom(true); say(['Ich bin du. Ich war es immer.'], 'plural'); }
}

// ── V3: Epochen-Momente ───────────────────────────────────────
let momentTxt = '';
function startMoment(e) {
  const def = MOMENTS[e];
  world.startMoment({ ...def, e });
  document.body.classList.add('moment');
  const bar = $('momentBar'); bar.classList.remove('hidden');
  const t = bar.querySelector('b'); t.textContent = def.title; t.style.color = def.color;
  bar.querySelector('span').textContent = def.text; momentTxt = def.text;
  music.boom(); vibrate(30); world.doFlash(def.color, 0.3);
}
function updateMoment() {
  const m = world.moment; if (!m) return;
  const bar = $('momentBar');
  bar.querySelector('.bar i').style.width = `${Math.max(0, 1 - m.t / m.dur) * 100}%`;
  const txt = m.kind === 'collect' ? `${m.n - m.left} / ${m.n} Funken` : (m.prog > 0 ? `Halten … ${m.prog.toFixed(1).replace('.', ',')} / ${m.hold} s` : m.text);
  if (txt !== momentTxt) { momentTxt = txt; bar.querySelector('span').textContent = txt; }
  if (m.done || m.failed) endMoment(m.done);
}
function endMoment(win) {
  const m = world.moment; world.moment = null;
  document.body.classList.remove('moment'); $('momentBar').classList.add('hidden');
  S.moments.push(m.e); S.pendingMoment = null; if (win) S.acts.moment++;
  const r = m.reward, gain = E.prodPerSec(S) * r.secs * (win ? 1 : 0.2) + (win ? E.tapValue(S, undefined, 0) * 20 : 0);
  E.earn(S, gain);
  if (win) {
    S.buffs.push({ id: 'moment' + m.e, n: m.title, k: r.buff.k, m: r.buff.m, t: r.buff.dur });
    music.boom(true); vibrate([40, 40, 80]); world.doFlash(m.color, 0.7); world.burst(world.cx, world.cy, m.color, 70, 2);
    world.floater(world.cx, world.cy - 40, `+${fmt(gain)} ✦`, m.color);
    addTimeline(`Moment: <b>${m.title}</b><small>${m.win}</small>`, 'choice', m.color);
    say([m.win]);
  } else {
    world.floater(world.cx, world.cy - 40, `+${fmt(gain)} ✦`, '#ffffff');
    addTimeline(`Moment verpasst: <b>${m.title}</b><small>${m.lose}</small>`, 'choice', '#8a93b8');
    say([m.lose]);
  }
  updateHud(); updateBuffs(); save();
}

// ── V6.1: Kosmische Ereignisse (Entscheidung in Echtzeit) ─────
function startCosmic(def) {
  cosmic = { def, t: 0, riser: music.riser(KO.COSMOS_DUR - 1), beat: 0 };
  lastCosmic = def.id;
  const box = $('cosmicBar'); box.classList.remove('hidden');
  box.style.setProperty('--c', def.color);
  box.querySelector('b').textContent = def.title; box.querySelector('p').textContent = def.text;
  document.body.classList.add('moment');
  music.boom(); vibrate([20, 40, 20]); world.doFlash(def.color, 0.35);
  say([def.title + '.']);
}
function updateCosmic(dt) {
  const c = cosmic; c.t += dt;
  const f = c.t / KO.COSMOS_DUR;
  $('cosmicBar').querySelector('.bar i').style.width = `${Math.max(0, 1 - f) * 100}%`;
  // Das Ereignis spürbar machen: Wackeln und Herzschlag werden mit der Zeit stärker
  world.shake = Math.max(world.shake, 0.06 + f * 0.4);
  if (c.t > c.beat) { c.beat = c.t + 1.1 - f * 0.7; vibrate(10 + Math.round(f * 30)); }
  if (c.t >= KO.COSMOS_DUR) endCosmic(null);
}
function endCosmic(choice) {
  const c = cosmic; if (!c) return; cosmic = null;
  c.riser && c.riser.stop();
  $('cosmicBar').classList.add('hidden'); document.body.classList.remove('moment');
  const o = KO.cosmosOutcome(c.def, choice, E.prodPerSec(S), E.tapValue(S, undefined, 0), S.complexity);
  if (o.act) S.acts[o.act]++;
  if (o.gain >= 0) E.earn(S, o.gain); else S.complexity = Math.max(0, S.complexity + o.gain);
  if (o.buff) S.buffs.push({ id: 'kosmos', n: o.buff.n, k: o.buff.k, m: o.buff.m, t: o.buff.dur });
  const col = o.win ? c.def.color : (choice ? '#ff6b81' : '#8a93b8');
  if (choice) {
    music.boom(o.win); vibrate(o.win ? [40, 40, 100] : [100, 40, 200]);
    world.doFlash(o.win ? col : '#ff6b81', o.win ? 0.7 : 0.9); world.shake = o.win ? 0.8 : 1.4;
    if (o.win) world.burst(world.cx, world.cy, col, 70, 2);
    world.floater(world.cx, world.cy - 40, `${o.gain >= 0 ? '+' : '−'}${fmt(Math.abs(o.gain))} ✦`, col);
  }
  addTimeline(`Kosmos: <b>${c.def.title}</b><small>${o.text}</small>`, 'choice', col);
  say([o.text]);
  nextCosmic = KO.cosmosWait(false);
  updateHud(); updateBuffs(); save();
}
for (const k of ['abwehren', 'umlenken', 'nutzen']) onTap($('cos-' + k), () => cosmic && endCosmic(k));

// ── V6.1: Rückblick-Film vor dem Urknall ──────────────────────
async function playFilm() {
  const scenes = KO.buildFilm(S), ov = $('overlay');
  ov.classList.remove('hidden');
  const hadCine = document.body.classList.contains('cine-mode'); document.body.classList.add('cine-mode');
  ov.innerHTML = `<div class="film"><div class="film-sub"></div><div class="film-t"></div><div class="film-l"></div></div>
    <div class="film-dots">${scenes.map(() => '<i></i>').join('')}</div><div class="hint">TIPPEN ZUM ÜBERSPRINGEN</div>`;
  let skip = false; ov.onclick = () => { skip = true; };
  const q = (c) => ov.querySelector(c), dots = ov.querySelectorAll('.film-dots i');
  const sleep = async (ms) => { for (let t = 0; t < ms && !skip; t += 80) await wait(80); };
  for (let i = 0; i < scenes.length && !skip; i++) {
    const sc = scenes[i], box = q('.film');
    box.classList.remove('on');
    await wait(120);
    ov.style.background = `radial-gradient(circle at 50% 45%, ${sc.color}44, transparent 75%), rgba(2,3,10,.93)`;
    q('.film-sub').textContent = sc.sub || ''; q('.film-t').textContent = sc.title; q('.film-t').style.color = sc.color;
    q('.film-l').innerHTML = sc.lines.map((l) => `<div>${l}</div>`).join('');
    dots.forEach((d, k) => d.classList.toggle('on', k <= i));
    box.classList.add('on');
    if (sc.kind === 'ende') { music.boom(true); vibrate([40, 40, 120]); } else { music.fragment(); vibrate([10, 30, 10 + (sc.e || 0) * 4]); }
    await sleep(sc.kind === 'epoche' ? KO.FILM_MS : 2800);
  }
  ov.onclick = null; ov.style.background = ''; ov.innerHTML = '';
  if (!hadCine) document.body.classList.remove('cine-mode');
}

// ── V3: Relikte (die Avatare früherer Universen) ──────────────
// Jeder Avatar, den du je gewählt hast, liegt im nächsten Universum als Relikt auf seiner Zoom-Ebene.
function syncRelics() {
  const want = E.legacyIds(S).filter((id) => AVATAR_OPTS[id] && AVATAR_OPTS[id].epoch <= S.epoch && !S.relics.includes(id));
  const have = new Set(world.relics.map((r) => r.id));
  world.relics = world.relics.filter((r) => want.includes(r.id));
  let fresh = false;
  for (const id of want) if (!have.has(id)) { world.addRelic(id, AVATAR_OPTS[id].epoch); fresh = true; }
  if (fresh && running && !cinematic) say(['Etwas liegt hier begraben. Es gehört uns.']);
  updateRail();
}
function collectRelic(id) {
  const o = AVATAR_OPTS[id], leg = [...S.legacy].reverse().find((l) => l.id === id);
  S.relics.push(id);
  world.relics = world.relics.filter((r) => r.id !== id);
  music.fragment(); vibrate([15, 30, 15]); world.doFlash('#ffb347', 0.35);
  world.burst(world.cx, world.cy, '#ffb347', 40, 1.5);
  addTimeline(`Relikt: <b>${o.name}</b><small>aus Universum ${leg ? leg.u : '?'}</small>`, 'choice', '#ffb347');
  openModal(`<div class="kicker" style="color:#ffb347">RELIKT · AUS UNIVERSUM ${leg ? leg.u : '?'}</div><h2>${o.name}</h2><p class="quote">${RELIC_TEXT[o.epoch]}</p><p style="font-size:13px;color:#ffb347">Echo für dieses Universum: die Hälfte von „${o.aura.text}“</p><button class="btn">Weiter</button>`);
  $('modalCard').querySelector('.btn').onclick = closeModal;
  updateRail(); updateHud(); save();
  if (tab === 'time') renderTimeline();
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

document.querySelectorAll('#panel .tab').forEach((b) => onTap(b, () => {
  tab = b.dataset.tab;
  document.querySelectorAll('#panel .tab').forEach((x) => x.classList.toggle('active', x === b));
  ['evo', 'time', 'frag'].forEach((t) => $('tab-' + t).classList.toggle('hidden', t !== tab));
  if (tab === 'time') renderTimeline();
  if (tab === 'frag') renderFragments();
}));
document.querySelectorAll('#buyMode button').forEach((b) => onTap(b, () => {
  buyN = b.dataset.n === 'max' ? 'max' : +b.dataset.n;
  document.querySelectorAll('#buyMode button').forEach((x) => x.classList.toggle('active', x === b));
  updateGenList();
}));
onTap($('settingsBtn'), openSettings);

// ── Spielschleife ─────────────────────────────────────────────
let last = performance.now(), uiT = 0, saveT = 0;
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (S.akt === 2 && A2.active) {       // Akt II: Der Orden
    A2.frame(dt); world.update(dt); world.draw(); A2.draw();
    requestAnimationFrame(loop); return;
  }
  if (running && world.mode === 'play' && !S.finished) {
    const pps = E.prodPerSec(S);
    E.earn(S, pps * dt);
    S.playTime += dt;
    // Resonanz verfällt, Mutations-Effekte laufen ab
    if (performance.now() - lastTapAt > 350) res = Math.max(0, res - E.TUNING.resDecay * dt);
    tickAvatarCd(dt);
    if (S.paradox > 0) S.paradox = Math.max(0, S.paradox - E.TUNING.paradoxDecay * dt);
    if (S.buffs.length) { for (const b of S.buffs) b.t -= dt; const n = S.buffs.length; S.buffs = S.buffs.filter((b) => b.t > 0); if (S.buffs.length !== n) updateBuffs(); }
    if (cosmic) updateCosmic(dt);
    else if (COSMOS_ON && !cinematic && !modalOpen() && !world.moment && S.epoch >= 1 && !S.pendingEvent && !S.pendingTrait && !S.pendingAvatar) {
      nextCosmic -= dt;
      if (nextCosmic <= 0) { const d = KO.pickCosmos(S.epoch, lastCosmic); if (d) startCosmic(d); else nextCosmic = 60; }
    }
    if (!cinematic && !modalOpen() && !world.moment && !cosmic) {
      nextMut -= dt;
      if (nextMut <= 0 && !world.mutation) { world.spawnMutation(E.mutationLife(S)); nextMut = E.mutationInterval(S); }
    }
    uiT += dt; saveT += dt;
    if (uiT > 0.2) { uiT = 0; updateHud(); updateResonance(); updateDock(); updateParadox(); checkQueue(); if (S.buffs.length) updateBuffs(); if (tab === 'evo') { updateGenList(); renderLeap(); } if (!cinematic && !modalOpen() && !world.moment) checkInEpochEvents(); }
    if (saveT > 10) { saveT = 0; save(); }
    // Fragmente & Stimme
    if (!cinematic && !modalOpen() && !world.moment) {
      nextGlitch -= dt;
      if (nextGlitch <= 0 && !world.glitch && fragmentPool().length) {
        world.spawnGlitch();
        nextGlitch = (100 + Math.random() * 110) / (S.intent === 'neugier' ? 2 : 1) / E.auraMult(S, 'frag');
      }
      nextVoice -= dt;
      if (nextVoice <= 0 && !voiceBusy) { say([pick(voiceSet()[S.epoch].idle)]); nextVoice = 45 + Math.random() * 40; }
    }
  }
  world.touches = [...pointers.values()];
  world.update(dt);
  updateMoment();
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
  S.finished = true;
  S.ending = E.endingOf(S);
  const freshEnding = !S.endings.includes(S.ending);
  if (freshEnding) S.endings.push(S.ending);
  save();
  renderLeap();
  world.zMax = 7; world.zTarget = 7;
  world.mode = 'converge'; world.converge = 0;
  music.setLevel(8);
  const conv = setInterval(() => { world.converge = Math.min(0.55, world.converge + 0.01); }, 150);
  for (const l of VOICE.finale) { say([l], 'plural'); }
  await wait(VOICE.finale.length * 5200);
  clearInterval(conv);
  await showEnding(freshEnding);
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

  await playFilm();        // V6.1: das alte Universum läuft als Zeitraffer ab

  // Neues Universum
  addTimeline('<b>Der Gedanke</b><small>Das Kollektiv dachte einen neuen Urknall.</small>', 'leap', '#fff3b0');
  const keep = {
    universe: S.universe + 1, runsDone: S.runsDone + 1, lifetime: S.lifetime,
    fragments: S.fragments, constants: k, intent, timeline: S.timeline,
    settings: S.settings, voiceEntered: S.voiceEntered, introSeen: true,
    letters: S.letters, letterChoices: S.letterChoices, ethik: S.ethik, lastLaw: S.law,
    pantheon: S.pantheon, endings: S.endings, chronik: [...S.chronik, chronikEntry()],
    akt: S.universe + 1 >= 155 ? 2 : S.akt, a2: S.a2,
    legacy: [...S.legacy, ...S.avatars.map((id) => ({ u: S.universe, id }))],   // V3: Avatare werden zu Relikten
  };
  S = Object.assign(E.newState(), keep);
  save();
  ov.classList.remove('hidden');
  ov.innerHTML = `<div class="cine">Diesmal war jemand da.</div><div class="title">UNIVERSUM ${S.universe}</div>`;
  await wait(60); ov.children[0].classList.add('on'); ov.children[1].classList.add('on');
  await wait(3600);
  if (S.akt === 2) { ov.innerHTML = ''; await cineLines(['Die Erde. Ein Planet, der beginnt, sich zu erinnern.', 'Der Orden der Erleuchteten erwacht: die Illuminaten.'], 2600); }
  ov.classList.add('hidden'); ov.innerHTML = '';
  document.body.classList.remove('cine-mode');
  voiceBusy = false; voiceQ = [];
  if (S.akt === 2) { cinematic = false; running = true; A2.enter(); return; }
  ensureLaw();
  enterPlay(0.9);
  cinematic = false;
  voiceEnter(0);
}

// ── Lebenszyklus (App im Hintergrund) ─────────────────────────
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { save(); music.suspend(); }
  else {
    const away = Math.min((Date.now() - S.lastSeen) / 1000, E.offlineCapSec(S));
    if (S.akt === 2) A2.offline((Date.now() - S.lastSeen) / 1000);
    else if (running && away > 30 && !S.finished) {
      const gain = E.prodPerSec(S) * away * E.offlineEfficiency(S);
      E.earn(S, gain); tickAvatarCd(away);
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

// ── Akt II: Der Orden (ab Universum 155) ─────────────────────
const A2 = createAkt2({ getS: () => S, save, $, onTap, openModal, closeModal, modalOpen, world, music, say, vibrate,
  pushChronik: (e) => { S.chronik.push(e); } });

// ── Start ─────────────────────────────────────────────────────
(async function boot() {
  requestAnimationFrame(loop);
  if (!S.introSeen) { await firstIntro(); return; }
  // Offline-Ertrag
  const away = Math.min((Date.now() - S.lastSeen) / 1000, E.offlineCapSec(S));
  let offline = 0;
  const rawAway = (Date.now() - S.lastSeen) / 1000;
  if (S.akt !== 2 && !S.finished && away > 30) { offline = E.prodPerSec(S) * away * E.offlineEfficiency(S); E.earn(S, offline); tickAvatarCd(away); }
  world.mode = 'play'; world.setEpoch(S.epoch); world.z = S.epoch;
  refreshStatic();
  try { const raw = localStorage.getItem(SAVE_KEY); if (raw) takeSnapshot(JSON.parse(raw)); } catch { /* */ }   // V6: täglicher Schnappschuss
  await titleScreen(offline);
  backupReminder();
  if (S.akt === 2) { cinematic = false; running = true; A2.enter(); A2.offline(rawAway); return; }
  if (S.finished) { running = true; music.setLevel(8); world.zMax = 7; thoughtScreen(); return; }
  enterPlay();
  ensureLaw();
  const showPending = () => { if (S.pendingEvent) { const ev = EVENTS.find((x) => x.id === S.pendingEvent); if (ev) showEvent(ev); } };
  if (S.pendingTrait) offerTrait(showPending); else if (S.pendingAvatar) showAvatar(S.pendingAvatar); else showPending();
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
    fire(id) { firePower(id); },
    bigBang(k, i) { return bigBang(k, i); },
    queue: checkQueue,
    A2,
    film: playFilm,
    startCosmic(id) { startCosmic(KO.COSMOS.find((c) => c.id === id) || KO.COSMOS[0]); },
    endCosmic,
    get cosmic() { return cosmic; },
    music,
    SI,
    takeSnapshot,
    send(e) { sendKnowledge(e); },
    chronikText,
    openChronik,
    checkAvatars,
    get res() { return res; },
    world,
  };
}
