"""V6.4-Test: Museum der Universen (Ansicht, Vitrinen, Funde, Lore, Meldungen, Boni, Fund-Hooks, Urknall).
Aufruf: python3 tools/test_v64.py [ordner]"""
import glob, json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/v64'; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8160'], cwd=os.path.join(os.path.dirname(__file__), '..', 'www'), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors, fails = [], []
def check(name, ok, info=''):
    print(('OK   ' if ok else 'FAIL ') + name + (f'  [{info}]' if info else ''), flush=True)
    if not ok: fails.append(name)
owned = [0] * 24; owned[0] = 50
state = {'v': 1, 'universe': 150, 'runsDone': 6, 'complexity': 1e6, 'runEarned': 1e9, 'lifetime': 1e9, 'owned': owned, 'epoch': 3,
         'finished': False, 'choices': {}, 'pendingEvent': None, 'fragments': [0, 1, 2, 3, 4, 5, 6], 'constants': {'g': 3, 's': 3, 'em': 3, 'c': 3, 'x': 3},
         'intent': None, 'timeline': [], 'voiceEntered': [], 'taps': 5, 'playTime': 1800, 'lastSeen': int(time.time() * 1000),
         'settings': {'music': False, 'sfx': False, 'vibrate': False}, 'introSeen': True, 'avatars': ['mutter'], 'legacy': [{'u': 144, 'id': 'leviathan'}],
         'moments': [1, 2, 3, 4, 5, 6, 7], 'letters': 10, 'pendingLaw': False, 'law': 'nebel', 'akt': 1, 'entIntro': True, 'erbeRetro': True,
         'endings': ['lenker', 'erster']}
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0])
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        ctx.add_init_script(f"if(!sessionStorage.__s){{localStorage.setItem('singularity-x144', JSON.stringify({json.dumps(state)}));sessionStorage.__s=1}}")
        pg = ctx.new_page(); pg.set_default_timeout(20000)
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and '404' not in m.text else None)
        pg.goto('http://localhost:8160/?dev&erbe'); pg.wait_for_timeout(1200); pg.mouse.click(195, 500); pg.wait_for_timeout(1500)
        ev = lambda e: pg.evaluate(e)
        S = lambda e: ev(f'window.__dev.S.{e}')
        def tapv(sel):
            ev(f"(()=>{{const e=document.querySelector('{sel}');e.dispatchEvent(new PointerEvent('pointerdown',{{bubbles:true,pointerId:1,clientX:5,clientY:5}}));e.dispatchEvent(new PointerEvent('pointerup',{{bubbles:true,pointerId:1,clientX:5,clientY:5}}))}})()")
        modal = lambda: ev("document.getElementById('modalCard').textContent")

        # Meldung neuer Schwellen (aus bestehenden Daten abgeleitet)
        for _ in range(20):
            if 'DAS MUSEUM' in modal().upper(): break
            pg.wait_for_timeout(400)
        txt = modal()
        check('Meldung beim Start: Briefe vollständig, Fragmente zur Hälfte', 'DAS MUSEUM' in txt.upper() and 'Briefe der Vorgänger' in txt and 'Splitter von x.144' in txt, txt[:100])
        pg.screenshot(path=f'{out}/meldung.png'); ev("document.getElementById('muNo').click()"); pg.wait_for_timeout(300)
        check('Schwellen als gemeldet gespeichert', ev("window.__dev.S.museum.seen.includes('brief:2') && window.__dev.S.museum.seen.includes('frag:1')"))

        # Ansicht
        tapv('.tab[data-tab=erbe]'); pg.wait_for_timeout(300)
        tapv('.vswitch button[data-v=museum]'); pg.wait_for_timeout(300)
        check('Museum-Ansicht mit 8 Vitrinen', ev("document.querySelectorAll('#tab-erbe .mu-card').length") == 8)
        tot = ev("window.__dev.MU.totals(window.__dev.S)")
        check('Funde-Zähler stimmt (7 Splitter + 10 Briefe + 2 Relikte + 2 Enden + Gesetz = 22)', tot['found'] == 22 and f"{tot['found']} / 75" in pg.inner_text('#tab-erbe'), json.dumps(tot))
        check('Bonus-Status: Briefe ✓ vollständig', ev("[...document.querySelectorAll('.mu-card')][1].querySelectorAll('.mu-bon .on').length") == 2)
        pg.screenshot(path=f'{out}/museum.png')
        tapv('.mu-top[data-v=brief]'); pg.wait_for_timeout(300)
        check('Vitrine aufklappen zeigt 10 Briefe', ev("document.querySelectorAll('.mu-item').length") == 10 and ev("document.querySelectorAll('.mu-item.f').length") == 10)
        tapv('.mu-item[data-i="brief:0"]'); pg.wait_for_timeout(300)
        check('Fund antippen: Lore im Fenster', 'Wir, die 143' in modal() and 'Zurück zum Museum' in modal(), modal()[:60])
        pg.screenshot(path=f'{out}/lore.png'); ev("document.getElementById('muOk').click()"); pg.wait_for_timeout(200)
        tapv('.mu-top[data-v=himmel]'); pg.wait_for_timeout(300)
        check('Ungefundenes: ??? und Hinweis statt Lore', ev("[...document.querySelectorAll('.mu-item span')].filter(x=>x.textContent==='???').length") == 8)
        tapv('.mu-item[data-i="boss:zerfall"]'); pg.wait_for_timeout(300)
        check('Hinweis nennt, wie man es findet', 'Besiege' in modal() and 'Noch nicht gefunden' in modal())
        ev("document.getElementById('muOk').click()")

        # Fund-Hooks
        ev("window.__dev.startCosmic('sturm')"); pg.wait_for_timeout(300)
        check('Kosmisches Ereignis wird als Fund vermerkt', ev("!!window.__dev.S.museum.ids['cos:sturm']"))
        ev("document.getElementById('cos-abwehren').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:1,clientX:5,clientY:5}));document.getElementById('cos-abwehren').dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:1,clientX:5,clientY:5}))")
        pg.wait_for_timeout(300)
        ev("window.__dev.collect('schub')"); pg.wait_for_timeout(200)
        check('Mutation wird als Fund vermerkt', ev("!!window.__dev.S.museum.ids['mut:schub']"))
        ev("window.__dev.museumFund('boss:zerfall')")
        check('Fund-Gleitzeile erscheint, doppelt nicht', ev("window.__dev.MU.fund(window.__dev.S,'boss:zerfall')") is False and ev("window.__dev.S.museum.ids['boss:zerfall']") == 150)

        # Bonus wirkt
        base = ev("(async()=>{const e=await import('./js/economy.js');window.__p0=e.prodPerSec(window.__dev.S);return window.__p0})()")
        ev("window.__dev.S.legacy=window.__dev.MU.all()[2].items.map(i=>({u:144,id:i.id.split(':')[1]}))")
        p1 = ev("(async()=>{const e=await import('./js/economy.js');return e.prodPerSec(window.__dev.S)})()")
        check('Relikte vollständig: Produktion ×1,155', abs(p1 / base - 1.155) < 1e-6, f'{p1 / base:.4f}')
        tapv('.vswitch button[data-v=baum]'); pg.wait_for_timeout(300)
        check('Erbe-Zusammenfassung zeigt Museumsbonus', 'Produktion' in pg.inner_text('.erbe-sum'))

        # Urknall behält die Funde
        ev("window.__dev.S.finished=true; window.__dev.S.epoch=7")
        ev("window.__dev.bigBang({g:1,s:1,em:1,c:1,x:1},'wille')"); pg.wait_for_timeout(5500)
        for _ in range(8):
            pg.mouse.click(195, 400); pg.wait_for_timeout(500)
        pg.wait_for_timeout(8000)
        check('Funde bleiben über Universen', S('universe') == 151 and ev("!!window.__dev.S.museum.ids['boss:zerfall'] && !!window.__dev.S.museum.ids['mut:schub']"))
        check('Konsolenfehler: keine', not errors, '; '.join(errors[:3]))
finally:
    srv.terminate()
print('Alle Tests bestanden' if not fails else f'FEHLGESCHLAGEN: {fails}'); sys.exit(1 if fails else 0)
