"""V6.3-Test: Das Vermächtnis (Erbe-Tab, Baum, Kauf, Wirkung, Neu verteilen, Ertrag beim Urknall, Rückwirkend).
Aufruf: python3 tools/test_v63.py [ordner]"""
import glob, json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/v63'; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8159'], cwd=os.path.join(os.path.dirname(__file__), '..', 'www'), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors, fails = [], []
def check(name, ok, info=''):
    print(('OK   ' if ok else 'FAIL ') + name + (f'  [{info}]' if info else ''), flush=True)
    if not ok: fails.append(name)
owned = [0] * 24; owned[0] = 50
state = {'v': 1, 'universe': 150, 'runsDone': 6, 'complexity': 1e6, 'runEarned': 1e9, 'lifetime': 1e9, 'owned': owned, 'epoch': 3,
         'finished': False, 'choices': {}, 'pendingEvent': None, 'fragments': [], 'constants': {'g': 3, 's': 3, 'em': 3, 'c': 3, 'x': 3},
         'intent': None, 'timeline': [], 'voiceEntered': [], 'taps': 5, 'playTime': 1800, 'lastSeen': int(time.time() * 1000),
         'settings': {'music': False, 'sfx': False, 'vibrate': False}, 'introSeen': True, 'avatars': ['mutter'],
         'moments': [1, 2, 3, 4, 5, 6, 7], 'letters': 10, 'pendingLaw': False, 'law': 'nebel', 'akt': 1, 'entIntro': True}
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0])
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        ctx.add_init_script(f"if(!sessionStorage.__s){{localStorage.setItem('singularity-x144', JSON.stringify({json.dumps(state)}));sessionStorage.__s=1}}")
        pg = ctx.new_page(); pg.set_default_timeout(20000)
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and '404' not in m.text else None)
        pg.goto('http://localhost:8159/?dev&erbe'); pg.wait_for_timeout(1200); pg.mouse.click(195, 500); pg.wait_for_timeout(1500)
        ev = lambda e: pg.evaluate(e)
        S = lambda e: ev(f'window.__dev.S.{e}')
        def tapv(sel):
            ev(f"(()=>{{const e=document.querySelector('{sel}');e.dispatchEvent(new PointerEvent('pointerdown',{{bubbles:true,pointerId:1,clientX:5,clientY:5}}));e.dispatchEvent(new PointerEvent('pointerup',{{bubbles:true,pointerId:1,clientX:5,clientY:5}}))}})()")

        # Rückwirkend
        pg.wait_for_timeout(800)
        check('Rückwirkender Bonus: 6 Erbe je Universum (36)', S('erbeVP') == 36 and S('erbeTotal') == 36, str(S('erbeVP')))
        check('Anzeige-Fenster „Das Vermächtnis" mit Rückwirkend-Zeile', 'Rückwirkend' in pg.inner_text('#modalCard') and '+36 Erbe' in pg.inner_text('#modalCard'))
        pg.screenshot(path=f'{out}/gain.png'); ev("window.__dev.MU.markSeen(window.__dev.S, window.__dev.MU.newThresholds(window.__dev.S))"); ev("document.getElementById('ebNo').click()"); pg.wait_for_timeout(300)
        check('Erbe-Reiter sichtbar mit Punktezahl', ev("!document.querySelector('.tab[data-tab=erbe]').classList.contains('hidden') && document.querySelector('.tab[data-tab=erbe] .pill').textContent==='36'"))

        tapv('.tab[data-tab=erbe]'); pg.wait_for_timeout(400)
        check('Baum zeigt 13 Knoten (3×4 + Schlussstein)', ev("document.querySelectorAll('#tab-erbe .enode').length") == 13)
        check('Stufe 1 aller Äste leuchtet (kaufbar), höhere gesperrt', ev("document.querySelectorAll('#tab-erbe .enode.can').length") == 3 and ev("document.querySelectorAll('#tab-erbe .enode.lock, #tab-erbe .enode.near').length") == 10)
        p0 = ev("window.__dev.ER && (async()=>{const e=await import('./js/economy.js');return e.prodPerSec(window.__dev.S)})()")
        tapv('.enode[data-n=s1]'); pg.wait_for_timeout(200)
        check('Detail zeigt Name, Wirkung und Kosten', 'Erster Funke' in pg.inner_text('.erbe-detail') and '+10' in pg.inner_text('.erbe-detail') and '3 Erbe' in pg.inner_text('.erbe-detail'))
        tapv('#eBuy'); pg.wait_for_timeout(300)
        check('Kauf: Erbe −3, Knoten gespeichert', S('erbeVP') == 33 and ev("window.__dev.S.erbeNodes.join()") == 's1')
        p1 = ev("(async()=>{const e=await import('./js/economy.js');return e.prodPerSec(window.__dev.S)})()")
        check('Wirkung: Produktion +10 %', abs(p1 / p0 - 1.1) < 1e-6, f'{p1 / p0:.4f}')
        check('Knoten ist „erworben", Stufe 2 jetzt kaufbar', ev("document.querySelector('.enode[data-n=s1]').classList.contains('own') && document.querySelector('.enode[data-n=s2]').classList.contains('can')"))
        tapv('.enode[data-n=k]'); pg.wait_for_timeout(200)
        check('Schlussstein gesperrt mit Begründung', ev("document.getElementById('eBuy').disabled") and 'Stufe 3' in pg.inner_text('.erbe-detail'))
        for n in ('s2', 's3', 's4', 'b1', 'b2', 'b3', 'z1', 'z2', 'z3'):
            tapv(f'.enode[data-n={n}]'); pg.wait_for_timeout(120); tapv('#eBuy'); pg.wait_for_timeout(120)
        check('Schlussstein nach Stufe 3 aller Äste kaufbar', ev("!window.__dev.ER.why(window.__dev.S,'k')") or S('erbeVP') < 25, f"vp={S('erbeVP')} nodes={S('erbeNodes.length')}")
        pg.screenshot(path=f'{out}/baum.png')
        check('Zusammenfassung „Dein Vermächtnis wirkt"', 'DEIN VERMÄCHTNIS WIRKT' in pg.inner_text('#tab-erbe').upper() and 'Produktion' in pg.inner_text('.erbe-sum'))
        tapv('#eReset'); pg.wait_for_timeout(300)
        check('Neu verteilen: alles zurück, kostenlos', S('erbeVP') == 36 and ev("window.__dev.S.erbeNodes.length") == 0)

        # Ertrag beim Urknall
        ev("window.__dev.S.erbeNodes=['s1']; window.__dev.S.erbeVP=33; window.__dev.S.erbeTotal=36; window.__dev.S.myths=[{e:4,id:'kraft',name:'x',dogma:'y'},{e:5,id:'kraft',name:'y',dogma:'y'}]; window.__dev.S.runBossWins=1; window.__dev.S.runNewEnding=true; window.__dev.S.finished=true; window.__dev.S.epoch=7")
        ev("window.__dev.bigBang({g:1,s:1,em:1,c:1,x:1},'wille')"); pg.wait_for_timeout(5500)
        for _ in range(8):
            pg.mouse.click(195, 400); pg.wait_for_timeout(500)
        pg.wait_for_timeout(8000)
        vp = S('erbeVP')
        check('Urknall: Erbe 33 + 10 (2 Basis + 1 Avatar + 2 Mythen + 3 neues Ende + 2 Boss)', vp == 43, f'vp={vp} total={S("erbeTotal")}')
        check('Knoten bleiben über Universen', ev("window.__dev.S.erbeNodes.join()") == 's1' and S('universe') == 151)
        check('Durchlauf-Zähler zurückgesetzt', S('runBossWins') == 0 and S('runNewEnding') is False)
        for _ in range(12):
            if 'VERMÄCHTNIS' in (ev("document.getElementById('modalCard').textContent") or '').upper(): break
            pg.wait_for_timeout(500)
        txt = pg.inner_text('#modalCard')
        check('Fenster nennt den Ertrag und seine Quellen', '+10 Erbe' in txt and 'Boss' in txt and 'neues Ende' in txt, txt[:90].replace('\n', ' '))
        pg.screenshot(path=f'{out}/gain2.png')
        check('Konsolenfehler: keine', not errors, '; '.join(errors[:3]))
finally:
    srv.terminate()
print('Alle Tests bestanden' if not fails else f'FEHLGESCHLAGEN: {fails}'); sys.exit(1 if fails else 0)
