"""V6.1-Test: Kosmische Ereignisse, Rückblick-Film (auch im Urknall-Ablauf), Haptik.
Aufruf: python3 tools/test_v61.py [ordner]"""
import glob, json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/v61'; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8156'], cwd=os.path.join(os.path.dirname(__file__), '..', 'www'), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors, fails = [], []
def check(name, ok, info=''):
    print(('OK   ' if ok else 'FAIL ') + name + (f'  [{info}]' if info else ''), flush=True)
    if not ok: fails.append(name)
owned = [0] * 24; owned[0] = 5
state = {'v': 1, 'universe': 150, 'runsDone': 6, 'complexity': 100000, 'runEarned': 1e9, 'lifetime': 1e9, 'owned': owned, 'epoch': 3,
         'finished': False, 'choices': {}, 'pendingEvent': None, 'fragments': [], 'constants': {'g': 3, 's': 3, 'em': 3, 'c': 3, 'x': 3},
         'intent': None, 'timeline': [], 'voiceEntered': [], 'taps': 777, 'playTime': 1800, 'lastSeen': int(time.time() * 1000),
         'settings': {'music': False, 'sfx': False, 'vibrate': True}, 'introSeen': True, 'avatars': ['mutter'],
         'moments': [1, 2, 3, 4, 5, 6, 7], 'letters': 10, 'pendingLaw': False, 'law': 'nebel', 'akt': 1, 'ending': 'lenker',
         'myths': [{'e': 4, 'id': 'kraft', 'name': 'Die Formende Hand', 'dogma': 'x'}]}
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0])
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        ctx.add_init_script(f"""if(!sessionStorage.__s){{localStorage.setItem('singularity-x144', JSON.stringify({json.dumps(state)}));sessionStorage.__s=1}}
          window.__vib=[]; navigator.vibrate=(p)=>{{window.__vib.push(p);return true}};""")
        pg = ctx.new_page(); pg.set_default_timeout(20000)
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and '404' not in m.text else None)
        pg.goto('http://localhost:8156/?dev'); pg.wait_for_timeout(1200); pg.mouse.click(195, 500); pg.wait_for_timeout(1500)
        ev = lambda e: pg.evaluate(e)
        tapv = lambda sel: pg.evaluate(f"(()=>{{const e=document.querySelector('{sel}');e.dispatchEvent(new PointerEvent('pointerdown',{{bubbles:true,pointerId:1,clientX:5,clientY:5}}));e.dispatchEvent(new PointerEvent('pointerup',{{bubbles:true,pointerId:1,clientX:5,clientY:5}}))}})()")

        # Kosmische Ereignisse
        check('im Dev-Modus keine zufälligen Ereignisse', ev("window.__dev.cosmic") is None)
        ev("window.__dev.S.buffs=[]; window.__dev.startCosmic('sturm')"); pg.wait_for_timeout(500)
        check('Ereignis-Leiste sichtbar mit Titel', ev("!document.getElementById('cosmicBar').classList.contains('hidden') && document.querySelector('#cosmicBar b').textContent.includes('Sonnensturm')"))
        check('Herzschlag-Vibration läuft', ev("window.__vib.length>0"))
        pg.wait_for_timeout(1500); pg.screenshot(path=f'{out}/kosmos.png')
        c0 = ev("window.__dev.S.complexity"); a0 = ev("window.__dev.S.acts.kraft")
        tapv('#cos-abwehren'); pg.wait_for_timeout(400)
        check('Abwehren: Leiste weg, Ertrag, Eingriff „Kraft" +1', ev("document.getElementById('cosmicBar').classList.contains('hidden')") and ev("window.__dev.S.complexity") > c0 and ev("window.__dev.S.acts.kraft") == a0 + 1)
        check('Kosmos-Eintrag in der Zeitleiste', ev("window.__dev.S.timeline.some(t=>t.text.includes('Kosmos'))"))
        ev("window.__dev.startCosmic('komet')"); pg.wait_for_timeout(300); m0 = ev("window.__dev.S.acts.mutation")
        tapv('#cos-nutzen'); pg.wait_for_timeout(300)
        check('Nutzen: Tipp-Buff ×3, Eingriff „Funke" +1', ev("window.__dev.S.buffs.some(b=>b.k==='tap'&&b.m===3)") and ev("window.__dev.S.acts.mutation") == m0 + 1)
        ev("window.__dev.startCosmic('nova')"); pg.wait_for_timeout(300)
        k0 = ev("window.__dev.S.complexity")
        ev("Math.random=()=>0.99"); tapv('#cos-umlenken'); pg.wait_for_timeout(300)
        check('Umlenken (Fehlschlag): Verlust 6 %', abs(ev("window.__dev.S.complexity") / k0 - 0.94) < 0.02, str(ev("window.__dev.S.complexity") / k0))
        ev("window.__dev.startCosmic('komet')"); pg.wait_for_timeout(12800)
        check('Verstreichen lassen: endet von selbst ohne Strafe', ev("window.__dev.cosmic") is None and ev("document.getElementById('cosmicBar').classList.contains('hidden')"))

        # Haptik
        ev("window.__vib.length=0; window.__dev.S.epoch=0; document.body.focus()")
        pg.mouse.click(195, 400); pg.wait_for_timeout(200)
        v0 = ev("window.__vib.slice(-1)[0]")
        check('Tipp-Haptik der Ursuppe (4 ms)', v0 == 4, str(v0))

        # Rückblick-Film
        ev("window.__dev.S.epoch=7; window.__dev.S.finished=true")
        ev("(()=>{window.__film = window.__dev.film(); return 1})()"); pg.wait_for_timeout(1400)
        check('Film läuft: Startszene', 'Universum 150' in pg.inner_text('#overlay'), pg.inner_text('#overlay')[:50].replace('\n', ' '))
        pg.screenshot(path=f'{out}/film1.png'); pg.wait_for_timeout(3600)
        txt = pg.inner_text('#overlay')
        check('Film zeigt Epochen mit Namen', any(n in txt for n in ('Ursuppe', 'Erste Zellen', 'Das Meer erwacht')), txt[:60].replace('\n', ' '))
        pg.screenshot(path=f'{out}/film2.png')
        pg.mouse.click(195, 400); pg.wait_for_timeout(600)
        check('Antippen überspringt den Film', ev("document.getElementById('overlay').innerHTML===''"))
        # Film-Dauer bei vollem Durchlauf ohne Überspringen ≈ 20 s
        t0 = time.time(); ev("(()=>{window.__filmDone=false; window.__dev.film().then(()=>window.__filmDone=true); return 1})()")
        while not ev("window.__filmDone===true") and time.time() - t0 < 40: pg.wait_for_timeout(500)
        dur = time.time() - t0
        check('Film dauert etwa 20–30 s', 18 < dur < 32, f'{dur:.1f}s')
        check('Konsolenfehler: keine', not errors, '; '.join(errors[:3]))
finally:
    srv.terminate()
print('Alle Tests bestanden' if not fails else f'FEHLGESCHLAGEN: {fails}'); sys.exit(1 if fails else 0)
