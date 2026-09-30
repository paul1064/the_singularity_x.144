"""V3-Test: Kaufen bei gehaltenen Fingern, Relikte/Echo/Vermächtnis. Aufruf: python3 tools/test_erbe.py [ordner]"""
import glob, json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/erbe'; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8147'], cwd=os.path.join(os.path.dirname(__file__), '..', 'www'),
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
         'moments': [1, 2, 3, 4, 5, 6, 7], 'letters': 10, 'pendingLaw': False,
         'myths': [{'e': 4, 'id': 'stille', 'name': 'Stub', 'dogma': None}, {'e': 5, 'id': 'stille', 'name': 'Stub', 'dogma': None}, {'e': 6, 'id': 'stille', 'name': 'Stub', 'dogma': None}], 'law': 'nebel'}
    s.update(kw); return s

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0])
    def open_page(state, port=8147):
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        ctx.add_init_script(f"if(!sessionStorage.__s){{localStorage.setItem('singularity-x144', JSON.stringify({json.dumps(state)}));sessionStorage.__s=1}}")
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and '404' not in m.text else None)
        pg.goto(f'http://localhost:{port}/?dev'); pg.wait_for_timeout(1200)
        pg.mouse.click(195, 500); pg.wait_for_timeout(1500)
        pg.evaluate('window.__dev.world.mutation=null;window.__dev.world.glitch=null')
        return ctx, pg

    # ── 1) Kaufen, während drei Finger weitertippen ─────────────
    ctx, pg = open_page(base())
    cdp = ctx.new_cdp_session(pg)
    touch = lambda kind, pts: cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': pts})
    S = lambda expr: pg.evaluate(f'window.__dev.S.{expr}')
    r = pg.evaluate("(()=>{const r=document.querySelector('#genList .gen').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
    three = [{'x': 60, 'y': 300, 'id': 1}, {'x': 120, 'y': 300, 'id': 2}, {'x': 180, 'y': 300, 'id': 3}]
    t0, o0 = S('taps'), S('owned[0]')
    p4 = {'x': r['x'], 'y': r['y'], 'id': 4}
    touch('touchStart', three)                                   # 3 Finger tippen und bleiben unten
    touch('touchStart', three + [p4])                            # 4. Finger auf das Upgrade …
    touch('touchEnd', [p4])                                      # … und wieder los (touchEnd beendet nur die genannten Finger)
    pg.wait_for_timeout(100)
    check('Upgrade gekauft, obwohl 3 Finger gedrückt bleiben', S('owned[0]') == o0 + 1, f'{o0} → {S("owned[0]")}')
    check('die 3 Finger haben getippt', S('taps') - t0 == 3, f'+{S("taps") - t0}')
    # Finger 3 hebt ab und tippt erneut, währenddessen zweiter Kauf
    touch('touchEnd', [three[2]]); touch('touchStart', three)
    touch('touchStart', three + [p4]); touch('touchEnd', [p4])
    pg.wait_for_timeout(100)
    check('zweiter Kauf parallel', S('owned[0]') == o0 + 2, str(S('owned[0]')))
    check('Finger 3 tippte erneut', S('taps') - t0 == 4, f'+{S("taps") - t0}')
    touch('touchEnd', [])
    # Scrollen (Finger wandert weit) kauft nichts
    o1 = S('owned[0]')
    touch('touchStart', [{'x': r['x'], 'y': r['y'], 'id': 1}])
    for k in range(1, 6): touch('touchMove', [{'x': r['x'], 'y': r['y'] - k * 15, 'id': 1}])
    touch('touchEnd', [])
    pg.wait_for_timeout(100)
    check('Wischen über das Upgrade kauft nichts', S('owned[0]') == o1, str(S('owned[0]')))
    # Tabs & Kaufmodus per Touch
    tb = pg.evaluate("(()=>{const r=document.querySelector('.tab[data-tab=time]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
    touch('touchStart', [{'x': tb['x'], 'y': tb['y'], 'id': 1}]); touch('touchEnd', [])
    pg.wait_for_timeout(200)
    check('Tab-Wechsel per Touch', pg.evaluate("!document.getElementById('tab-time').classList.contains('hidden')"))
    ctx.close()

    # ── 2) Relikte im Durchlauf 2 ───────────────────────────────
    owned = [0] * 24; owned[0:9] = [20, 15, 10, 6, 5, 4, 4, 3, 2]
    ctx, pg = open_page(base(universe=145, runsDone=1, epoch=2, owned=owned, complexity=1e6, runEarned=1e7,
                             legacy=[{'u': 144, 'id': 'mutter'}, {'u': 144, 'id': 'leviathan'}, {'u': 144, 'id': 'heiler'}]))
    cdp = ctx.new_cdp_session(pg)
    touch = lambda kind, pts: cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': pts})
    S = lambda expr: pg.evaluate(f'window.__dev.S.{expr}')
    rel = pg.evaluate('window.__dev.world.relics.map(r=>({id:r.id,e:r.e,x:r.x,y:r.y}))')
    check('Relikte erscheinen für erreichte Epochen (nicht für Zukunft)', sorted(x['id'] for x in rel) == ['leviathan', 'mutter'], json.dumps([x['id'] for x in rel]))
    check('Rail-Hinweis auf Relikt-Ebene', pg.evaluate("document.querySelectorAll('#rail button.relic').length") == 2)
    # Relikt der Zellebene (e=1) ist nur auf Zoom-Ebene 1 sichtbar/findbar
    rm = next(x for x in rel if x['id'] == 'mutter')
    pg.evaluate('window.__dev.world.z=2;window.__dev.world.zTarget=2')
    pg.evaluate('window.__dev.world.mutation=null;window.__dev.world.glitch=null')   # zufällige Glimmer dürfen den Tipp nicht schlucken
    c0 = S('taps'); touch('touchStart', [{'x': rm['x'], 'y': rm['y'], 'id': 1}]); touch('touchEnd', [])
    check('auf falscher Ebene nicht findbar (zählt als Tipp)', S('relics') == [] and S('taps') == c0 + 1, f"{S('relics')} taps+{S('taps') - c0} z={pg.evaluate('window.__dev.world.z')} rel={rel}")
    pg.evaluate('window.__dev.world.z=1;window.__dev.world.zTarget=1'); pg.wait_for_timeout(200)
    pg.screenshot(path=f'{out}/1-relikt.png')
    print('   Relikt-Position', rm, 'z=', pg.evaluate('window.__dev.world.z'))
    pg.evaluate('window.__dev.world.mutation=null;window.__dev.world.glitch=null')
    touch('touchStart', [{'x': rm['x'], 'y': rm['y'], 'id': 1}]); touch('touchEnd', [])
    pg.wait_for_timeout(300)
    check('Relikt eingesammelt', S('relics') == ['mutter'], json.dumps(S('relics')))
    check('Relikt-Fenster mit Lore', 'relikt' in pg.inner_text('#modalCard').lower() and 'universum 144' in pg.inner_text('#modalCard').lower())
    pg.screenshot(path=f'{out}/2-relikt-fenster.png')
    pg.evaluate("document.querySelector('#modalCard .btn').click()"); pg.wait_for_timeout(200)
    check('Relikt ist danach weg', pg.evaluate('window.__dev.world.relics.length') == 1)
    pg.click('.tab[data-tab="time"]'); pg.wait_for_timeout(300)
    check('Zeitlinie zeigt RELIKTE', 'RELIKTE 1/3' in pg.inner_text('#tab-time'), pg.inner_text('#tab-time')[:60].replace('\n', ' '))
    pg.screenshot(path=f'{out}/3-zeitlinie.png')
    # Echo: Mutterzelle +6 % Produktion → halbe Stärke ≈ +3 %
    pps_a = pg.evaluate("(async()=>{const m=await import('./js/economy.js');const s=JSON.parse(JSON.stringify(window.__dev.S));s.relics=[];const a=m.prodPerSec(s);s.relics=['mutter'];return m.prodPerSec(s)/a})()")
    check('Echo wirkt mit halber Stärke (≈ +3 %)', abs(pps_a - 1.03) < 0.005, f'×{pps_a:.4f}')

    # ── 3) Vermächtnis: Avatare werden beim Urknall zu Relikten ──
    pg.evaluate("window.__dev.S.avatars=['erstgeborener'];window.__dev.S.epoch=7;window.__dev.S.finished=true")
    pg.evaluate("window.__dev.bigBang({g:1,s:1,em:1,c:1,x:1},'wille')"); pg.wait_for_timeout(9500)
    leg = S('legacy')
    check('Vermächtnis enthält den neuen Avatar', any(l['id'] == 'erstgeborener' and l['u'] == 145 for l in leg) and len(leg) == 4, json.dumps(leg))
    check('Neuer Durchlauf: Relikte zurückgesetzt, Universum 146', S('relics') == [] and S('universe') == 146, f"{S('relics')} {S('universe')}")
    ctx.close()
    b.close()
srv.terminate()
print('Konsolenfehler:', errors or 'keine')
print('FEHLGESCHLAGEN: ' + ', '.join(fails) if fails else 'Alle Tests bestanden')
sys.exit(1 if fails or errors else 0)
