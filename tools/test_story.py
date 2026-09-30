"""V3-Story-Test: Gesetze, Briefe, Epochen-Momente (collect/hold/5 Finger). Aufruf: python3 tools/test_story.py [ordner]"""
import glob, json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/story'; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8149'], cwd=os.path.join(os.path.dirname(__file__), '..', 'www'),
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors, fails = [], []
def check(name, ok, info=''):
    print(('OK   ' if ok else 'FAIL ') + name + (f'  [{info}]' if info else ''))
    if not ok: fails.append(name)

def base(**kw):
    owned = [0] * 24; owned[0] = 5
    s = {'v': 1, 'universe': 144, 'runsDone': 0, 'complexity': 5000, 'runEarned': 1e4, 'lifetime': 1e4, 'owned': owned, 'epoch': 0,
         'finished': False, 'choices': {}, 'pendingEvent': None, 'fragments': [], 'constants': {'g': 0, 's': 0, 'em': 0, 'c': 0, 'x': 0},
         'intent': None, 'timeline': [], 'voiceEntered': [], 'taps': 0, 'playTime': 600, 'lastSeen': int(time.time() * 1000),
         'settings': {'music': False, 'sfx': False, 'vibrate': False}, 'introSeen': True,
         'moments': [1, 2, 3, 4, 5, 6, 7], 'letters': 10, 'pendingLaw': False}
    s.update(kw); return s

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0])
    def open_page(state, wait_title=True):
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        ctx.add_init_script(f"if(!sessionStorage.__s){{localStorage.setItem('singularity-x144', JSON.stringify({json.dumps(state)}));sessionStorage.__s=1}}")
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and '404' not in m.text else None)
        pg.goto('http://localhost:8149/?dev'); pg.wait_for_timeout(1200)
        pg.mouse.click(195, 500); pg.wait_for_timeout(1500)
        pg.evaluate('window.__dev.world.mutation=null;window.__dev.world.glitch=null')
        return ctx, pg
    modal_open = lambda pg: pg.evaluate("!document.getElementById('modal').classList.contains('hidden')")
    kicker = lambda pg: pg.evaluate("(document.querySelector('#modalCard .kicker')||{}).textContent||''")
    def click_first(pg):
        pg.evaluate("(()=>{const c=document.querySelector('#modalCard .choice-btn')||document.querySelector('#modalCard .btn');c&&c.click()})()")
    def drain(pg, stop, limit=12):
        """Fenster wegklicken (Merkmale, Kataklysmen …), bis stop() wahr wird."""
        for _ in range(limit):
            if stop(): return True
            if modal_open(pg): click_first(pg)
            pg.wait_for_timeout(450)
        return stop()

    # ── 1) Kosmisches Gesetz ────────────────────────────────────
    ctx, pg = open_page(base(universe=147, runsDone=3, epoch=1, pendingLaw=False, law=None, lastLaw='eile'))
    S = lambda e: pg.evaluate(f'window.__dev.S.{e}')
    pg.wait_for_timeout(600)
    check('Gesetz wird vergeben und angekündigt', S('law') is not None and 'GESETZ' in kicker(pg), f"{S('law')} / {kicker(pg)}")
    check('nicht dasselbe Gesetz wie zuvor', S('law') != 'eile')
    pg.screenshot(path=f'{out}/1-gesetz.png')
    click_first(pg); pg.wait_for_timeout(300)
    check('Gesetz bestätigt', S('pendingLaw') is False and not modal_open(pg))
    pg.click('.tab[data-tab="time"]'); pg.wait_for_timeout(300)
    check('Zeitlinie zeigt das Gesetz', 'GESETZ' in pg.inner_text('#tab-time'))
    # Wirkung: Wasserwelt verdoppelt Epoche 1
    r = pg.evaluate("""(async()=>{const m=await import('./js/economy.js');const s=JSON.parse(JSON.stringify(window.__dev.S));
      s.law=null;const a=m.genProd(s,0);s.law='wasser';const b=m.genProd(s,0);s.law='eile';const c=m.leapCost(s,0);s.law=null;const d=m.leapCost(s,0);return [b/a,c/d]})()""")
    check('Gesetz-Wirkung (Wasserwelt ×2, Eile −30 % Sprung)', abs(r[0] - 2) < 1e-6 and abs(r[1] - 0.7) < 1e-6, str(r))
    e = pg.evaluate("(async()=>{const m=await import('./js/economy.js');const s=m.newState();const a=m.leapCost(s,0);s.runsDone=2;return m.leapCost(s,0)/a})()")
    check('Entropie: +50 % je Durchlauf', abs(e - 2) < 1e-6, str(e))
    ctx.close()

    # ── 2) Briefe der Vorgänger ─────────────────────────────────
    ctx, pg = open_page(base(universe=145, runsDone=1, epoch=2, letters=0, law='nebel', complexity=1e9, runEarned=1e9))
    S = lambda e: pg.evaluate(f'window.__dev.S.{e}')
    pg.evaluate('window.__dev.leapNow()'); pg.wait_for_timeout(4800)
    ok = drain(pg, lambda: 'BRIEF' in kicker(pg))
    check('Brief 1 kommt beim Eintritt in den Landgang (nach Merkmal)', ok, kicker(pg))
    check('Brief aus Universum 143', 'UNIVERSUM 143' in kicker(pg))
    pg.screenshot(path=f'{out}/2-brief.png')
    click_first(pg); pg.wait_for_timeout(400)
    check('Brief gelesen, Zähler 1', S('letters') == 1 and S('pendingLetter') is None, f"{S('letters')}")
    # danach Moment 3 (Hold) wird ausgelöst
    pg.evaluate('window.__dev.S.moments=[1,2,4,5,6,7]')   # Moment 3 darf kommen
    # Brief 2 mit Entscheidung: zweiter Brief beim Eintritt in Technosphäre
    pg.evaluate("window.__dev.S.moments=[1,2,3,4,5,6,7];window.__dev.S.epoch=5;window.__dev.S.pendingMoment=null")
    pg.evaluate('window.__dev.leapNow()'); pg.wait_for_timeout(4800)
    ok = drain(pg, lambda: 'BRIEF' in kicker(pg))
    check('Brief 2 beim Eintritt in die Technosphäre', ok and 'UNIVERSUM 141' in kicker(pg), kicker(pg))
    check('Brief 2 bietet zwei Antworten', pg.evaluate("document.querySelectorAll('#modalCard .choice-btn').length") == 2)
    pg.screenshot(path=f'{out}/3-brief-wahl.png')
    pg.evaluate("document.querySelector('#modalCard .choice-btn[data-k=a]').click()"); pg.wait_for_timeout(400)
    check('Antwort gespeichert, Ethik +1', S('ethik') == 1 and S("letterChoices['1']") == 'a', f"ethik={S('ethik')}")
    check('Antwort des Kollektivs erscheint', 'ANTWORT' in kicker(pg), kicker(pg))
    click_first(pg); pg.wait_for_timeout(300)
    pg.click('.tab[data-tab="frag"]'); pg.wait_for_timeout(300)
    check('Briefarchiv im Fragmente-Tab', 'BRIEFE DER VORGÄNGER 2/10' in pg.inner_text('#tab-frag') and 'Die Zuschauer'.upper() in pg.inner_text('#tab-frag'))
    ctx.close()

    # Finale: letzter Brief je nach Ethik
    for eth, needle in ((1, 'zugesehen'), (-1, 'eingegriffen'), (0, 'beides')):
        ctx, pg = open_page(base(universe=150, runsDone=5, epoch=3, letters=9, ethik=eth, law='nebel'))
        pg.evaluate('window.__dev.S.pendingLetter=9;window.__dev.queue()'); pg.wait_for_timeout(500)
        txt = pg.inner_text('#modalCard')
        check(f'Schlussbrief (Ethik {eth:+d}) enthält Variante „{needle}"', 'Ich bin du' in txt and needle in txt and 'Du. Gerade eben' in txt)
        if eth == 1: pg.screenshot(path=f'{out}/4-schlussbrief.png')
        ctx.close()

    # ── 3) Moment: Funken sammeln (Der Blitz) ───────────────────
    ctx, pg = open_page(base(epoch=0, complexity=1e9, runEarned=1e9, moments=[2, 3, 4, 5, 6, 7]))
    cdp = ctx.new_cdp_session(pg)
    touch = lambda kind, pts: cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': pts})
    S = lambda e: pg.evaluate(f'window.__dev.S.{e}')
    pg.evaluate('window.__dev.leapNow()'); pg.wait_for_timeout(4800)
    drain(pg, lambda: pg.evaluate('!!window.__dev.world.moment'))
    check('Moment „Der Blitz" startet nach dem Merkmal', pg.evaluate('!!window.__dev.world.moment') and pg.evaluate("document.body.classList.contains('moment')"))
    pg.wait_for_timeout(500)
    pg.screenshot(path=f'{out}/5-moment-blitz.png')
    items = pg.evaluate('window.__dev.world.moment.items.map(i=>({x:i.x,y:i.y}))')
    check('5 Funken', len(items) == 5)
    g0 = S('complexity')
    for it in items[:-1]:
        touch('touchStart', [{'x': it['x'], 'y': it['y'], 'id': 1}]); touch('touchEnd', [])
    pg.wait_for_timeout(150)
    check('nach 4 Funken läuft der Moment noch', pg.evaluate('!!window.__dev.world.moment') and pg.evaluate('window.__dev.world.moment.left') == 1)
    last = pg.evaluate('window.__dev.world.moment.items.find(i=>i.alive)')
    touch('touchStart', [{'x': last['x'], 'y': last['y'], 'id': 1}]); touch('touchEnd', [])
    pg.wait_for_timeout(300)
    check('Moment geschafft', pg.evaluate('window.__dev.world.moment') is None and 1 in S('moments'))
    check('Belohnung: Buff ×3 Produktion', any(x['k'] == 'prod' and x['m'] == 3 for x in S('buffs')), json.dumps(S('buffs')))
    check('Panel wieder da', not pg.evaluate("document.body.classList.contains('moment')"))
    # Verpassen
    pg.evaluate("window.__dev.S.moments=[2,3,4,5,6,7];window.__dev.S.pendingMoment=1;window.__dev.S.buffs=[];window.__dev.queue()"); pg.wait_for_timeout(500)
    pg.evaluate('window.__dev.world.moment.t=999'); pg.wait_for_timeout(400)
    check('verpasst: kein Buff, Moment gilt als gespielt', pg.evaluate('window.__dev.world.moment') is None and S('buffs') == [] and 1 in S('moments'))
    ctx.close()

    # ── 4) Moment: Halten mit 2 Fingern ─────────────────────────
    ctx, pg = open_page(base(epoch=3, complexity=1e6, runEarned=1e6, moments=[1, 2, 4, 5, 6, 7]))
    cdp = ctx.new_cdp_session(pg)
    touch = lambda kind, pts: cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': pts})
    S = lambda e: pg.evaluate(f'window.__dev.S.{e}')
    pg.evaluate('window.__dev.S.pendingMoment=3;window.__dev.queue()'); pg.wait_for_timeout(500)
    rings = pg.evaluate('window.__dev.world.moment.items.map(i=>({x:i.x,y:i.y}))')
    check('2 Ringe (Hold)', len(rings) == 2)
    pg.screenshot(path=f'{out}/6-moment-halten.png')
    pts = [{'x': r['x'], 'y': r['y'], 'id': i + 1} for i, r in enumerate(rings)]
    touch('touchStart', pts); pg.wait_for_timeout(1200)
    pr1 = pg.evaluate('window.__dev.world.moment.prog')
    check('Fortschritt wächst bei 2 Fingern', pr1 > 0.7, f'{pr1:.2f}')
    pg.screenshot(path=f'{out}/7-moment-halten-aktiv.png')
    touch('touchEnd', [pts[1]]); pg.wait_for_timeout(700)    # einen Finger heben
    pr2 = pg.evaluate('window.__dev.world.moment.prog')
    check('Fortschritt fällt, wenn ein Finger fehlt', pr2 < pr1, f'{pr1:.2f} → {pr2:.2f}')
    touch('touchStart', pts); pg.wait_for_timeout(3200)
    check('Halten geschafft', pg.evaluate('window.__dev.world.moment') is None and 3 in S('moments') and any(x['k'] == 'tap' for x in S('buffs')), json.dumps(S('buffs')))
    touch('touchEnd', [])
    ctx.close()

    # ── 5) Moment mit 5 Fingern (Der Gedanke formt sich) ────────
    ctx, pg = open_page(base(epoch=7, complexity=1e6, runEarned=1e6, moments=[1, 2, 3, 4, 5, 6]))
    cdp = ctx.new_cdp_session(pg)
    touch = lambda kind, pts: cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': pts})
    S = lambda e: pg.evaluate(f'window.__dev.S.{e}')
    pg.evaluate('window.__dev.S.pendingMoment=7;window.__dev.queue()'); pg.wait_for_timeout(500)
    rings = pg.evaluate('window.__dev.world.moment.items.map(i=>({x:i.x,y:i.y}))')
    check('5 Ringe', len(rings) == 5)
    pts = [{'x': r['x'], 'y': r['y'], 'id': i + 1} for i, r in enumerate(rings)]
    touch('touchStart', pts); pg.wait_for_timeout(1500)
    pg.screenshot(path=f'{out}/8-moment-5finger.png')
    pg.wait_for_timeout(2200)
    check('5-Finger-Moment geschafft', pg.evaluate('window.__dev.world.moment') is None and 7 in S('moments') and any(x['m'] == 6 for x in S('buffs')), json.dumps(S('buffs')))
    touch('touchEnd', [])
    ctx.close()
    b.close()
srv.terminate()
print('Konsolenfehler:', errors or 'keine')
print('FEHLGESCHLAGEN: ' + ', '.join(fails) if fails else 'Alle Tests bestanden')
sys.exit(1 if fails or errors else 0)
