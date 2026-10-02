"""Akt-III-Test: Vorschau, Spiegel kaufen (Licht/Schatten), Gleichgewicht/Einklang, Ausgleichen, Brief, Finale, Neustart, Übergang aus Akt II.
Aufruf: python3 tools/test_akt3.py [ordner]   (dauert ca. 2 Minuten)"""
import glob, json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/akt3'; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8162'], cwd=os.path.join(os.path.dirname(__file__), '..', 'www'), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors, fails = [], []
def check(name, ok, info=''):
    print(('OK   ' if ok else 'FAIL ') + name + (f'  [{info}]' if info else ''), flush=True)
    if not ok: fails.append(name)
owned = [0] * 24; owned[0] = 5
state = {'v': 1, 'universe': 150, 'runsDone': 6, 'complexity': 1e6, 'runEarned': 1e9, 'lifetime': 1e9, 'owned': owned, 'epoch': 3,
         'finished': False, 'choices': {}, 'pendingEvent': None, 'fragments': [0, 1, 2, 3, 4, 5], 'constants': {'g': 3, 's': 3, 'em': 3, 'c': 3, 'x': 3},
         'intent': None, 'timeline': [], 'voiceEntered': [], 'taps': 5, 'playTime': 1800, 'lastSeen': int(time.time() * 1000),
         'settings': {'music': True, 'sfx': True, 'vibrate': False}, 'introSeen': True, 'avatars': ['mutter'],
         'moments': [1, 2, 3, 4, 5, 6, 7], 'letters': 4, 'pendingLaw': False, 'law': 'nebel', 'akt': 1, 'entIntro': True, 'erbeRetro': True,
         'endings': ['lenker']}
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0], args=['--autoplay-policy=no-user-gesture-required'])
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        ctx.add_init_script(f"if(!sessionStorage.__s){{localStorage.setItem('singularity-x144', JSON.stringify({json.dumps(state)}));sessionStorage.__s=1}}")
        pg = ctx.new_page(); pg.set_default_timeout(20000)
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and '404' not in m.text else None)
        pg.goto('http://localhost:8162/?dev'); pg.wait_for_timeout(1200); pg.mouse.click(195, 500); pg.wait_for_timeout(1500)
        ev = lambda e: pg.evaluate(e)
        S = lambda e: ev(f'window.__dev.S.{e}')
        def tapv(sel):
            ev(f"(()=>{{const e=document.querySelector('{sel}');e.dispatchEvent(new PointerEvent('pointerdown',{{bubbles:true,pointerId:1,clientX:5,clientY:5}}));e.dispatchEvent(new PointerEvent('pointerup',{{bubbles:true,pointerId:1,clientX:5,clientY:5}}))}})()")
        def tapc(x, y):
            ev(f"(()=>{{const c=document.getElementById('a3c');c.dispatchEvent(new PointerEvent('pointerdown',{{bubbles:true,pointerId:7,clientX:{x},clientY:{y}}}));c.dispatchEvent(new PointerEvent('pointerup',{{bubbles:true,pointerId:7,clientX:{x},clientY:{y}}}))}})()")
        kicker = lambda: ev("(document.querySelector('#modalCard .kicker')||{}).textContent||''")
        modal_open = lambda: ev("!document.getElementById('modal').classList.contains('hidden')")
        def wait_kicker(needle, tries=60):
            for _ in range(tries):
                if needle in kicker() and modal_open(): return True
                pg.wait_for_timeout(300)
            return False

        # Vorschau über die Einstellungen
        ev("(async()=>{const m=await import('./js/akt3econ.js');const a=m.newA3();a.introSeen=true;window.__dev.S.a3=a;return 1})()")
        pg.click('#settingsBtn'); pg.wait_for_timeout(400)
        check('Einstellungen bieten Akt III (Vorschau)', ev("!!document.getElementById('a3Preview')"))
        ev("document.getElementById('a3Preview').click()"); pg.wait_for_timeout(900)
        check('Akt III aktiv (Spiegel-Canvas, Panel, body.akt3, Akt-I-Panel weg)', ev("document.body.classList.contains('akt3') && !document.getElementById('a3c').classList.contains('hidden') && getComputedStyle(document.getElementById('panel')).display==='none' && !document.getElementById('a3panel').classList.contains('hidden')"))
        check('Kapitel-Anzeige und ein Spiegel offen', 'Splitterspiegel' in ev("document.getElementById('epochLabel').textContent") and ev("document.querySelectorAll('#a3Rows .mrow').length") == 1)
        check('Klang läuft (Akt-I-Schichten schweigen)', ev("window.__dev.music.level") == 0)
        pg.screenshot(path=f'{out}/1-start.png')

        # Tippen und Kaufen
        m0 = S('a3.mem'); [tapc(195, 330) for _ in range(5)]
        check('Tippen in der Mitte bringt Erinnerung', S('a3.mem') > m0 and S('a3.taps') == 5, f"{m0}→{S('a3.mem')}")
        ev("window.__dev.S.a3.mem = 1e6")
        tapv('#a3Rows .mrow[data-k="0"] .mbtn.licht'); tapv('#a3Rows .mrow[data-k="0"] .mbtn.schatten')
        check('Kauf über die Zeilen: Licht 1, Schatten 1', S('a3.lic[0]') == 1 and S('a3.sch[0]') == 1, f"{S('a3.lic[0]')}/{S('a3.sch[0]')}")
        pos = ev("(()=>{const r=document.getElementById('a3c').getBoundingClientRect();return null})()")
        # Kauf per Antippen des Spiegels auf dem Canvas: Position aus der Geometrie (oben im Ring = Spiegel 0)
        geo = ev("(()=>{const f=window.__dev.A3.dev; return null})()")
        # Gleichgewicht und Einklang
        ev("window.__dev.S.a3.lic[0]=5; window.__dev.S.a3.sch[0]=5; window.__dev.S.a3.einklang=0"); pg.wait_for_timeout(3200)
        e1 = S('a3.einklang'); check('Im Gleichgewicht lädt sich der Einklang auf', e1 > 2, f'{e1:.1f}')
        ev("window.__dev.S.a3.lic[0]=40"); pg.wait_for_timeout(2500)
        e2 = S('a3.einklang'); check('Aus dem Gleichgewicht zerfällt er', e2 < e1 + 0.5 and e2 < ev("window.__dev.S.a3.einklang") + 1, f'{e2:.1f}')
        pg.screenshot(path=f'{out}/2-spiel.png')
        # Ausgleichen
        ev("window.__dev.S.a3.mem=1e9"); l0, s0 = S('a3.lic[0]'), S('a3.sch[0]')
        tapv('#dock [data-id=_auto]'); pg.wait_for_timeout(200)
        check('Ausgleichen kauft auf der schwächeren Seite (Schatten)', S('a3.sch[0]') == s0 + 1 and S('a3.lic[0]') == l0, f"{s0}→{S('a3.sch[0]')}")
        # Kräfte
        tapv('#dock [data-id=licht]'); pg.wait_for_timeout(200)
        check('Erinnern: Tippen ×5 für 15 s', ev("window.__dev.S.a3.buffs.some(b=>b.k==='tap'&&b.m===5)") and S('a3.cd.licht') > 80)
        m1 = S('a3.mem'); tapv('#dock [data-id=schatten]'); pg.wait_for_timeout(200)
        check('Loslassen: sofort 150 s Produktion', S('a3.mem') > m1 and S('a3.cd.schatten') > 100)

        # Brief + Spiegelsprung
        ev("window.__dev.S.a3.lic[0]=5; window.__dev.S.a3.sch[0]=5; window.__dev.S.a3.mem=1e9")
        tapv('#a3Leap .leap'); pg.wait_for_timeout(500)
        check('Spiegelsprung öffnet den Brief (Satz 1/8)', wait_kicker('DER BRIEF · SATZ 1/8', 10) and S('a3.kap') == 1, kicker())
        pg.screenshot(path=f'{out}/3-brief.png')
        ev("document.querySelector('#modalCard .choice-btn[data-k=a]').click()"); pg.wait_for_timeout(500)
        check('Satz gewählt: Brief enthält ihn, Spiegel 2 offen', S('a3.lines.join()') == 'a' and ev("document.querySelectorAll('#a3Rows .mrow').length") == 2 and S('a3.pendingLetter') is None)
        check('Brief-Reiter zeigt den Entwurf', (tapv('#a3panel .tab[data-a3tab=brief]') or True) and 'An alle, die nach mir kommen' in ev("document.getElementById('a3-brief').textContent"))
        tapv('#a3panel .tab[data-a3tab=spiegel]')

        # Finale
        ev("(()=>{const a=window.__dev.S.a3; a.kap=7; a.lines=['c','c','a','b','c','c','a']; a.einklang=100; a.mem=1e18; for(let k=0;k<8;k++){a.lic[k]=5;a.sch[k]=5} return 1})()")
        pg.wait_for_timeout(600)
        ev("window.__dev.S.a3.einklang=100"); tapv('#a3Leap .leap'); pg.wait_for_timeout(500)
        check('Große Spiegelung: letzter Briefsatz', wait_kicker('DER BRIEF · SATZ 8/8', 10), kicker())
        ev("document.querySelector('#modalCard .choice-btn[data-k=c]').click()")
        check('Finale: Brief erscheint zum Versiegeln', wait_kicker('DER BRIEF', 40) and 'An alle, die nach mir kommen' in ev("document.getElementById('modalCard').textContent"))
        pg.screenshot(path=f'{out}/4-brief-final.png')
        ev("document.getElementById('a3ok').click()")
        check('Hinweis „Etwas fehlt noch" (Museum nicht vollständig)', wait_kicker('ETWAS FEHLT NOCH', 20))
        ev("document.getElementById('a3ok').click()")
        check('Ende „Der Gleichklang" mit neuem Siegel', wait_kicker('DAS ENDE DES SPIEGELS', 20) and 'Der Gleichklang' in ev("document.getElementById('modalCard').textContent") and 'NEUES SIEGEL' in kicker().upper(), kicker())
        pg.screenshot(path=f'{out}/5-ende.png'); ev("document.getElementById('a3ok').click()"); pg.wait_for_timeout(800)
        check('Durchgang 2: Siegel, Brief gespeichert, Spiegel zurückgesetzt', S('a3.run') == 2 and S('a3.seals.join()') == 'gleich' and S('a3.letters.length') == 1 and S('a3.kap') == 0 and S('a3.finished') is False)
        check('Vorschau schreibt nichts in die Chronik', S('chronik.length') == 0)
        check('Siegel wirkt: Produktion +10 %', abs(ev("window.__dev.A3.dev.fx.run") - 1.1) < 1e-9)

        # Das Wahre Ende
        ev("(()=>{const S=window.__dev.S; S.endings=['schweigen','zweifler','lenker','hueter','funke','erster']; S.letters=10; const a=S.a3; a.kap=7; a.lines=['c','c','c','c','c','c','c']; a.einklang=100; a.mem=1e18; for(let k=0;k<8;k++){a.lic[k]=5;a.sch[k]=5} return 1})()")
        check('Museum: Enden und Briefe vollständig', ev("window.__dev.A3.dev.wahrOk()") is True)
        pg.wait_for_timeout(500); ev("window.__dev.S.a3.einklang=100"); tapv('#a3Leap .leap'); wait_kicker('DER BRIEF · SATZ 8/8', 10)
        ev("document.querySelector('#modalCard .choice-btn[data-k=c]').click()")
        wait_kicker('DER BRIEF', 40); ev("document.getElementById('a3ok').click()")
        check('Wahres Ende: Enthüllung und Ende „Ich bin du"', wait_kicker('DAS ENDE DES SPIEGELS', 150) and 'Ich bin du' in ev("document.getElementById('modalCard').textContent"), kicker())
        pg.screenshot(path=f'{out}/6-wahr.png'); ev("document.getElementById('a3ok').click()"); pg.wait_for_timeout(800)
        check('Zweites Siegel (Wahres Ende), Durchgang 3', S('a3.seals.join()') == 'gleich,wahr' and S('a3.run') == 3)

        # Neustart
        ev("window.dispatchEvent(new Event('pagehide'))"); pg.reload(); pg.wait_for_timeout(1500); pg.mouse.click(195, 500); pg.wait_for_timeout(1800)
        check('Neustart: Akt III startet direkt, Siegel bleiben', S('akt') == 3 and S('a3.seals.length') == 2 and ev("!document.getElementById('a3panel').classList.contains('hidden')"))
        pg.click('#settingsBtn'); pg.wait_for_timeout(400)
        check('Vorschau-Modus: „Zurück zu Akt I" vorhanden', ev("!!document.getElementById('a3Back')"))
        ev("document.getElementById('a3Back').click()"); pg.wait_for_timeout(800)
        check('zurück in Akt I: Panel sichtbar, Akt III bleibt gespeichert', S('akt') == 1 and ev("getComputedStyle(document.getElementById('panel')).display!=='none'") and S('a3.run') == 3)

        # Übergang aus Akt II nach neun Dimensionen
        ev("(()=>{const S=window.__dev.S; S.universe=170; S.a3=null; return 1})()")
        ev("(async()=>{const m=await import('./js/akt2econ.js');const a=m.newA2();a.dim=8;a.run=9;a.prof={name:'Test Person',y:1990,m:7,d:14};a.pendingLayer=null;a.mentors=['thoth'];a.layers=7;a.age=7;a.wissen=1e30;a.owned=a.owned.map(()=>10);window.__dev.S.a2=a;window.__dev.S.akt=2;return 1})()")
        ev("(()=>{window.__dev.A2.enter(); return 1})()"); pg.wait_for_timeout(1500)
        ev("(()=>{window.__dev.S.a2.preview=false; window.__dev.S.a2.wissen=1e30; window.__dev.A2.dev.doLeap(); return 1})()")
        for _ in range(12):
            if ev("!!document.getElementById('a2ok')"): ev("document.getElementById('a2ok').click()"); pg.wait_for_timeout(500)
            if S('akt') == 3: break
            pg.wait_for_timeout(1500)
        for _ in range(30):
            if S('akt') == 3 and ev("window.__dev.A3.active"): break
            pg.wait_for_timeout(500)
        check('Nach der 9. Dimension wechselt das Spiel zu Akt III', S('akt') == 3 and ev("window.__dev.A3.active") and S('a2.dim') == 9, f"akt={S('akt')} dim={S('a2.dim')}")
        pg.wait_for_timeout(500); check('Dimensionen wirken als Bonus (+45 %)', abs(ev("window.__dev.A3.dev.fx.dim") - 1.45) < 1e-9)
        check('Konsolenfehler: keine', not errors, '; '.join(errors[:3]))
finally:
    srv.terminate()
print('Alle Tests bestanden' if not fails else f'FEHLGESCHLAGEN: {fails}'); sys.exit(1 if fails else 0)
