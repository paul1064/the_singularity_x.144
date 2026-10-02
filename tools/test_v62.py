"""V6.2-Test: Entropie (Anstieg, Entlastung, Stufen, Risse, Optik), Boss-Kämpfe (Sieg, Niederlage), Kollaps.
Aufruf: python3 tools/test_v62.py [ordner]   (dauert ca. 1,5 Minuten)"""
import glob, json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/v62'; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8157'], cwd=os.path.join(os.path.dirname(__file__), '..', 'www'), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors, fails = [], []
def check(name, ok, info=''):
    print(('OK   ' if ok else 'FAIL ') + name + (f'  [{info}]' if info else ''), flush=True)
    if not ok: fails.append(name)
owned = [0] * 24; owned[0] = 5; owned[3] = 5
state = {'v': 1, 'universe': 150, 'runsDone': 6, 'complexity': 1e12, 'runEarned': 1e9, 'lifetime': 1e9, 'owned': owned, 'epoch': 2,
         'finished': False, 'choices': {}, 'pendingEvent': None, 'fragments': [], 'constants': {'g': 3, 's': 3, 'em': 3, 'c': 3, 'x': 3},
         'intent': None, 'timeline': [], 'voiceEntered': [], 'taps': 0, 'playTime': 1800, 'lastSeen': int(time.time() * 1000),
         'settings': {'music': False, 'sfx': False, 'vibrate': False}, 'introSeen': True, 'avatars': [],
         'moments': [1, 2, 3, 4, 5, 6, 7], 'letters': 10, 'pendingLaw': False, 'law': 'nebel', 'akt': 1}
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0])
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        ctx.add_init_script(f"if(!sessionStorage.__s){{localStorage.setItem('singularity-x144', JSON.stringify({json.dumps(state)}));sessionStorage.__s=1}}")
        pg = ctx.new_page(); pg.set_default_timeout(20000)
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and '404' not in m.text else None)
        pg.goto('http://localhost:8157/?dev&ent'); pg.wait_for_timeout(1200); pg.mouse.click(195, 500); pg.wait_for_timeout(1500)
        ev = lambda e: pg.evaluate(e)
        kicker = lambda: ev("(document.querySelector('#modalCard .kicker')||{}).textContent||''")
        S = lambda e: ev(f'window.__dev.S.{e}')
        def spam(n, x=195, y=330):
            ev(f"(()=>{{const c=document.getElementById('world');for(let i=0;i<{n};i++){{c.dispatchEvent(new PointerEvent('pointerdown',{{bubbles:true,pointerId:100+i%4,clientX:{x},clientY:{y}}}));c.dispatchEvent(new PointerEvent('pointerup',{{bubbles:true,pointerId:100+i%4,clientX:{x},clientY:{y}}}))}}}})()")

        # Einführung
        pg.wait_for_timeout(800)
        check('Einführung der Entropie erscheint einmalig', 'GEGENSPIELER' in kicker() and 'Etwas hat dich bemerkt' in pg.inner_text('#modalCard'), kicker())
        pg.screenshot(path=f'{out}/intro.png'); ev("document.getElementById('entOk').click()"); pg.wait_for_timeout(500)
        check('Einführung als gesehen gespeichert', S('entIntro') is True)

        # Anstieg, HUD, Entlastung
        ev("window.__dev.S.entropy = 20"); pg.wait_for_timeout(3200)
        e1 = S('entropy')
        check('Entropie steigt von selbst', e1 > 20.1, f'{e1:.2f}')
        check('Entropie-Leiste im HUD sichtbar', ev("document.getElementById('ent').classList.contains('on') && document.querySelector('#ent span').textContent.includes('ENTROPIE')"), ev("document.querySelector('#ent span').textContent"))
        ev("window.__dev.S.entropy = 40"); spam(25)
        e2 = S('entropy'); check('Tippen drängt sie zurück (25 Taps ≈ −1 %)', 38.5 < e2 < 39.5, f'{e2:.2f}')
        b0 = S('entropy'); ev("window.__dev.S.owned[0]=0; window.__dev.buyAll(1)")  # kein Kauf-Relief über buyAll; Kauf per UI folgt im Boss-Teil

        # Stufe 2 (Risse), Optik, Rissversiegeln
        ev("window.__dev.S.entropy = 49.9"); pg.wait_for_timeout(1500)
        check('Stufenwechsel: Zeitleisten-Eintrag „Die Entropie"', ev("window.__dev.S.timeline.some(t=>t.text.includes('Die Entropie'))"))
        ev("window.__dev.S.entropy = 80"); pg.wait_for_timeout(600)
        check('Welt bleicht aus (Filter)', 'saturate' in ev("document.getElementById('world').style.filter"), ev("document.getElementById('world').style.filter"))
        check('Welt-Ranken/Vignette aktiv', ev("window.__dev.world.entropy") > 0.6)
        pg.screenshot(path=f'{out}/entropie80.png')
        ev("window.__dev.world.cracks=[]; window.__dev.world.spawnCrack()"); pg.wait_for_timeout(900)
        c = ev("window.__dev.world.cracks[0]"); e3 = S('entropy')
        pg.mouse.click(c['x'], c['y']); pg.wait_for_timeout(300)
        check('Riss antippen versiegelt ihn (−6 %)', ev("window.__dev.world.cracks.length") == 0 and S('entropy') < e3 - 5, f"{e3:.1f} → {S('entropy'):.1f}")
        ev("window.__dev.world.spawnCrack()"); pg.screenshot(path=f'{out}/riss.png'); ev("window.__dev.world.cracks=[]")
        ev("window.__dev.S.entropy = 80; window.__dev.world.cracks=[]; window.__dev.EN.tick(window.__dev.S,0,0)")
        # Auto-Spawn der Risse
        ev("window.__dev.S.entropy = 60"); pg.wait_for_timeout(13500)
        check('Risse entstehen von selbst ab 50 %', ev("window.__dev.world.cracks.length") >= 1)
        ev("window.__dev.world.cracks=[]")

        # Boss vor dem Sprung (Epoche 2 → 3)
        ev("window.__dev.S.entropy = 20"); ev("(()=>{window.__dev.leapNow(); return 1})()"); pg.wait_for_timeout(800)
        check('Boss „Der Zerfall" stellt sich in den Weg', ev("!document.getElementById('bossBar').classList.contains('hidden') && window.__dev.world.moment && window.__dev.world.moment.kind==='boss'") and 'Zerfall' in pg.inner_text('#bossBar'))
        check('Sprung wartet auf den Kampf (Epoche noch 2)', S('epoch') == 2)
        pg.wait_for_timeout(2500); pg.screenshot(path=f'{out}/boss.png')
        hp0 = ev("window.__dev.world.moment.hp")
        spam(10); pg.wait_for_timeout(100)
        check('Tippen verursacht Schaden', ev("window.__dev.world.moment.hp") < hp0 - 5, f"{hp0} → {ev('window.__dev.world.moment.hp')}")
        wk = ev("window.__dev.world.moment.weaks[0] || null")
        if wk:
            h1 = ev("window.__dev.world.moment.hp"); pg.mouse.click(wk['x'], wk['y']); pg.wait_for_timeout(100)
            check('Schwachpunkt macht 10 Schaden', ev("window.__dev.world.moment.hp") <= h1 - 9, f"{h1} → {ev('window.__dev.world.moment.hp')}")
        else: check('Schwachpunkt erschienen', False)
        spam(200); pg.wait_for_timeout(1500)
        check('Boss besiegt: Leiste weg, Sieg gezählt', S('bossWins') == 1 and ev("document.getElementById('bossBar').classList.contains('hidden')"))
        pg.wait_for_timeout(4200)
        check('danach geht der Evolutionssprung weiter (Epoche 3)', S('epoch') == 3 and 2 in ev("window.__dev.S.bossDone"), f"epoche={S('epoch')}")
        check('Belohnung: Entropie 8 % (−15 % Sprung ⇒ 0–8), Triumph-Buff', S('entropy') < 9 and ev("window.__dev.S.buffs.some(b=>b.id==='boss')"), f"{S('entropy'):.1f}")
        check('Sieg in der Zeitleiste', ev("window.__dev.S.timeline.some(t=>t.text.includes('Sieg') && t.text.includes('Zerfall'))"))
        check('Produktionsbonus durch Sieg (+1,5 %)', abs(ev("(async()=>{const m=await import('./js/entropie.js');return m.bossBonus(window.__dev.S)})()") - 1.015) < 1e-9)

        # Zweiter Sprung in derselben Epoche nicht nochmal Boss; Epoche 4: Niederlage durch Nichtstun
        ev("window.__dev.S.epoch = 4; window.__dev.S.entropy = 30"); pg.wait_for_timeout(300)
        ev("(()=>{window.__dev.leapNow(); return 1})()"); pg.wait_for_timeout(700)
        check('Boss „Die Große Stille" bei Epoche 4', 'Stille' in pg.inner_text('#bossBar'))
        pg.wait_for_timeout(23500)
        check('Niederlage: Boss weg, Sieg nicht gezählt', S('bossWins') == 1 and ev("document.getElementById('bossBar').classList.contains('hidden')"))
        pg.wait_for_timeout(4000)
        check('Sprung läuft trotz Niederlage weiter (Epoche 5), Entropie +25 −15', S('epoch') == 5 and 35 < S('entropy') < 50, f"epoche={S('epoch')} e={S('entropy'):.1f}")

        # Kollaps bei 100 %
        ev("window.__dev.S.pendingEvent=null; document.getElementById('modal').classList.add('hidden')"); pg.wait_for_timeout(300)
        c0 = S('complexity'); ev("window.__dev.S.entropy = 99.99"); pg.wait_for_timeout(1500)
        check('Bei 100 % bricht sie durch: Kollaps-Boss', ev("window.__dev.world.moment && window.__dev.world.moment.key==='kollaps'") and 'Kollaps' in pg.inner_text('#bossBar'))
        pg.wait_for_timeout(23500)
        check('Kollaps verloren: −20 % Komplexität, Entropie 60 %', S('entropy') >= 59 and S('complexity') < c0 * 0.85, f"e={S('entropy'):.1f} c={S('complexity')/c0:.2f}")
        check('Konsolenfehler: keine', not errors, '; '.join(errors[:3]))
finally:
    srv.terminate()
print('Alle Tests bestanden' if not fails else f'FEHLGESCHLAGEN: {fails}'); sys.exit(1 if fails else 0)
