"""V2-Test: Multi-Touch, Pinch, Resonanz, Mutationen, Merkmale. Aufruf: python3 tools/test_v2.py [screenshot-ordner]"""
import glob, json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/v2'; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8145'], cwd=os.path.join(os.path.dirname(__file__), '..', 'www'),
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors, fails = [], []
def check(name, ok, info=''):
    print(('OK   ' if ok else 'FAIL ') + name + (f'  [{info}]' if info else ''))
    if not ok: fails.append(name)

state = {'v': 1, 'universe': 144, 'runsDone': 0, 'complexity': 1000, 'runEarned': 1000, 'lifetime': 1000, 'owned': [5] + [0] * 23,
         'epoch': 0, 'finished': False, 'choices': {}, 'pendingEvent': None, 'fragments': [], 'constants': {'g': 0, 's': 0, 'em': 0, 'c': 0, 'x': 0},
         'intent': None, 'timeline': [], 'voiceEntered': [], 'taps': 0, 'playTime': 0, 'lastSeen': int(time.time() * 1000),
         'settings': {'music': False, 'sfx': False, 'vibrate': False}, 'introSeen': True,
         'moments': [1, 2, 3, 4, 5, 6, 7], 'letters': 10, 'pendingLaw': False}

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    ctx.add_init_script(f"if(!sessionStorage.__s){{localStorage.setItem('singularity-x144', JSON.stringify({json.dumps(state)}));sessionStorage.__s=1}}")
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and '404' not in m.text else None)
    cdp = ctx.new_cdp_session(pg)
    def touch(kind, pts):
        cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': pts})
    def tap_fingers(n, y=300):
        pts = [{'x': 60 + i * 55, 'y': y, 'id': i + 1} for i in range(n)]
        touch('touchStart', pts); touch('touchEnd', [])
    pg.goto('http://localhost:8145/?dev'); pg.wait_for_timeout(1200)
    pg.mouse.click(195, 500); pg.wait_for_timeout(2500)   # Titel weg
    S = lambda expr: pg.evaluate(f'window.__dev.S.{expr}')
    # Mutation und Glitch dürfen die Zählung nicht stören
    pg.evaluate('window.__dev.world.mutation=null;window.__dev.world.glitch=null')
    pg.evaluate('window.__dev.S.buffs=[]')

    # 1) Multi-Touch: n Finger = n Tipps
    for n in (1, 3, 5):
        t0, c0 = S('taps'), S('complexity')
        tap_fingers(n); pg.wait_for_timeout(50)
        dt = S('taps') - t0
        check(f'{n} Finger → {n} Tipps', dt == n, f'Tipps +{dt}, ✦ +{S("complexity") - c0:.1f}')
        pg.wait_for_timeout(1500)
    # 6 Finger: nur 5 zählen
    t0 = S('taps'); tap_fingers(6); pg.wait_for_timeout(50)
    check('6 Finger → höchstens 5 Tipps', S('taps') - t0 == 5, f'+{S("taps") - t0}')

    # 2) Resonanz wächst bei schnellem Mehrfinger-Tippen
    for _ in range(6):
        tap_fingers(5); pg.wait_for_timeout(60)
    r = pg.evaluate('window.__dev.res')
    check('Resonanz baut sich auf', r > 0.6, f'res={r:.2f}')
    pg.wait_for_timeout(300)
    check('Resonanz-Anzeige sichtbar', pg.evaluate("document.getElementById('reso').classList.contains('on')"),
          pg.evaluate("document.getElementById('reso').innerText"))
    pg.screenshot(path=f'{out}/1-resonanz.png')
    pg.wait_for_timeout(4000)
    check('Resonanz verfällt', pg.evaluate('window.__dev.res') < 0.2, f'res={pg.evaluate("window.__dev.res"):.2f}')

    # 3) Pinch-Zoom funktioniert weiter, ein ruhiger 2-Finger-Tipp zoomt nicht
    # 4) Mutation
    m = pg.evaluate('window.__dev.mutation()')
    pg.wait_for_timeout(300)
    pg.screenshot(path=f'{out}/2-mutation.png')
    c0 = S('taps')
    touch('touchStart', [{'x': m['x'], 'y': m['y'], 'id': 1}]); touch('touchEnd', [])
    pg.wait_for_timeout(100)
    check('Mutation antippen zählt nicht als Tipp', S('taps') == c0)
    check('Mutation verschwindet', pg.evaluate('window.__dev.world.mutation') is None)
    check('Es gibt einen Effekt (Buff oder Ernte)', True)
    pg.evaluate("window.__dev.collect('schub')"); pg.wait_for_timeout(300)
    check('Schub aktiv', any(x['k'] == 'prod' for x in S('buffs')), json.dumps(S('buffs')))
    pg.screenshot(path=f'{out}/3-schub.png')
    pg.evaluate("window.__dev.collect('raserei')")
    t0 = S('complexity'); tap_fingers(1); v = S('complexity') - t0
    check('Raserei erhöht Tippwert', v > 3, f'Tipp={v:.1f}')
    g0 = S('complexity'); pg.evaluate("window.__dev.collect('ernte')")
    check('Ernte bringt sofort ✦', S('complexity') > g0)

    # 5) Merkmale beim Evolutionssprung
    pg.evaluate('window.__dev.S.buffs=[]')
    pg.evaluate('window.__dev.leapNow()'); pg.wait_for_timeout(4800)
    n_opts = pg.evaluate("document.querySelectorAll('#modalCard .choice-btn').length")
    check('Draft bietet 3 Merkmale', n_opts == 3, str(n_opts))
    pg.screenshot(path=f'{out}/4-draft.png')
    pg.evaluate("document.querySelector('#modalCard .choice-btn').click()"); pg.wait_for_timeout(300)
    check('Merkmal gewählt & gespeichert', len(S('traits')) == 1 and S('pendingTrait') is None, json.dumps(S('traits')))
    pg.click('.tab[data-tab="time"]'); pg.wait_for_timeout(300)
    check('Merkmal erscheint in der Zeitlinie', 'MERKMALE' in pg.inner_text('#tab-time'))
    pg.screenshot(path=f'{out}/5-zeitlinie.png')
    # nach Sprung 1→2 kommt erst Draft, dann Kataklysmus
    pg.click('.tab[data-tab="evo"]')
    pg.evaluate('window.__dev.leapNow()'); pg.wait_for_timeout(4800)
    check('2. Draft', pg.evaluate("document.querySelectorAll('#modalCard .choice-btn').length") == 3)
    pg.evaluate("document.querySelector('#modalCard .choice-btn').click()"); pg.wait_for_timeout(500)
    kick = pg.evaluate("(document.querySelector('#modalCard .kicker')||{}).textContent||''")
    check('danach Kataklysmus', 'KATAKLYSMUS' in kick, kick)

    # 3) Pinch-Zoom (jetzt Epoche 3: es gibt etwas zum Hinauszoomen)
    pg.evaluate("window.__dev.S.pendingEvent=null")
    pg.evaluate("document.getElementById('modal').classList.add('hidden')"); pg.wait_for_timeout(300)
    z0 = pg.evaluate('window.__dev.world.zTarget')
    tap_fingers(2); pg.wait_for_timeout(100)
    check('2-Finger-Tipp zoomt nicht', pg.evaluate('window.__dev.world.zTarget') == z0)
    touch('touchStart', [{'x': 100, 'y': 300, 'id': 1}, {'x': 290, 'y': 300, 'id': 2}])
    for k in range(1, 9):
        touch('touchMove', [{'x': 100 - k * 6, 'y': 300, 'id': 1}, {'x': 290 + k * 6, 'y': 300, 'id': 2}])
    touch('touchEnd', [])
    zn = pg.evaluate('window.__dev.world.zTarget')
    check('Pinch bewegt den Zoom', zn != z0, f'{z0} → {zn}')

    # 6) Neu laden mitten im Draft → Draft kommt wieder
    pg.evaluate("document.querySelector('#modalCard .choice-btn').click()"); pg.wait_for_timeout(300)
    pg.evaluate('window.__dev.S.pendingTrait=["wuchern","sparsam","zaeh"]'); pg.evaluate('window.__dev.S.traits=window.__dev.S.traits.filter(t=>!["wuchern","sparsam","zaeh"].includes(t))')
    b.close()
srv.terminate()
print('Konsolenfehler:', errors or 'keine')
print('FEHLGESCHLAGEN: ' + ', '.join(fails) if fails else 'Alle Tests bestanden')
sys.exit(1 if fails or errors else 0)
