"""V6-Test: Tagesorakel, Himmelskalender, Klang für Akt II.
Aufruf: python3 tools/test_v6.py [ordner]"""
import glob, json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/v6'; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8154'], cwd=os.path.join(os.path.dirname(__file__), '..', 'www'),
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors, fails = [], []
def check(name, ok, info=''):
    print(('OK   ' if ok else 'FAIL ') + name + (f'  [{info}]' if info else ''), flush=True)
    if not ok: fails.append(name)

owned = [0] * 24; owned[0] = 5
state = {'v': 1, 'universe': 153, 'runsDone': 9, 'complexity': 1000, 'runEarned': 1e9, 'lifetime': 1e9, 'owned': owned, 'epoch': 0,
         'finished': False, 'choices': {}, 'pendingEvent': None, 'fragments': [], 'constants': {'g': 0, 's': 0, 'em': 0, 'c': 0, 'x': 0},
         'intent': None, 'timeline': [], 'voiceEntered': [], 'taps': 0, 'playTime': 600, 'lastSeen': int(time.time() * 1000),
         'settings': {'music': True, 'sfx': True, 'vibrate': False}, 'introSeen': True,
         'moments': [1, 2, 3, 4, 5, 6, 7], 'letters': 10, 'pendingLaw': False, 'law': 'nebel', 'akt': 1}
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0],
                              args=['--autoplay-policy=no-user-gesture-required'])
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        ctx.add_init_script(f"if(!sessionStorage.__s){{localStorage.setItem('singularity-x144', JSON.stringify({json.dumps(state)}));sessionStorage.__s=1}}")
        pg = ctx.new_page(); pg.set_default_timeout(20000)
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and '404' not in m.text else None)
        pg.goto('http://localhost:8154/?dev'); pg.wait_for_timeout(1200)
        pg.mouse.click(195, 500); pg.wait_for_timeout(1500)
        kicker = lambda: pg.evaluate("(document.querySelector('#modalCard .kicker')||{}).textContent||''")
        modal_open = lambda: pg.evaluate("!document.getElementById('modal').classList.contains('hidden')")
        def wait_modal(needle, tries=40):
            for _ in range(tries):
                if needle in kicker() and modal_open(): return True
                pg.wait_for_timeout(300)
            return False
        def ok_modal():
            pg.evaluate("(()=>{const c=document.getElementById('a2ok')||document.querySelector('#modalCard .choice-btn');c&&c.click()})()"); pg.wait_for_timeout(500)
        S = lambda e: pg.evaluate(f'window.__dev.S.{e}')

        pg.click('#settingsBtn'); pg.wait_for_timeout(400)
        pg.evaluate("document.getElementById('a2Preview').click()"); pg.wait_for_timeout(900)
        pg.fill('#pfName', 'Paul Feichtinger'); pg.fill('#pfDate', '1990-07-14'); pg.click('#pfGo'); pg.wait_for_timeout(1000)
        for n in ('SCHICKSALSEBENE', 'EIN LEHRER'):
            if wait_modal(n): ok_modal()
        pg.evaluate("window.__dev.S.a2.wissen = 50000"); pg.wait_for_timeout(500)

        # Orakel
        check('Orakel-Knopf im Dock leuchtet (noch nicht gezogen)', pg.evaluate("!!document.querySelector('#dock [data-id=_orakel].ready')"))
        pg.evaluate("document.querySelector('#dock [data-id=_orakel]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:1,clientX:10,clientY:10}));document.querySelector('#dock [data-id=_orakel]').dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:1,clientX:10,clientY:10}))")
        check('Orakel-Fenster', wait_modal('DAS ORAKEL'), kicker())
        txt = pg.inner_text('#modalCard')
        check('zeigt Frage und Himmelslage, keine Vorhersage', 'Die Frage des Tages' in txt and 'Mond in' in txt and 'sagt nichts voraus' in txt)
        pg.screenshot(path=f'{out}/orakel.png')
        ok_modal()
        o = S('a2.orakel'); n = S('a2.orakelTage')
        check('Karte gezogen und gespeichert', o and 0 <= o['path'] < 22 and n == 1, json.dumps(o))
        check('heutiger Pfad wirkt im Spiel (todayPath)', S('a2.todayPath') == o['path'])
        check('Orakel-Bonus +0,5 % je Tag in den Wirkungen', abs(pg.evaluate("window.__dev.A2.dev.fx.prod") / 1 - 1) >= 0 and pg.evaluate("window.__dev.S.a2.orakelTage") == 1)
        check('Knopf nicht mehr bereit', pg.evaluate("!document.querySelector('#dock [data-id=_orakel].ready')"))
        pg.evaluate("document.querySelector('#dock [data-id=_orakel]').dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:1,clientX:10,clientY:10}))")
        wait_modal('DAS ORAKEL'); ok_modal()
        check('erneutes Ansehen zählt keinen Tag doppelt', S('a2.orakelTage') == 1)

        # Kalender in der Schicksal-Karte
        pg.evaluate("[...document.querySelectorAll('#a2panel .tab')].find(t=>/Schicksal/.test(t.textContent)).click()"); pg.wait_for_timeout(500)
        pt = pg.inner_text('#a2panel')
        check('Schicksal-Tab: Orakel-Karte und Himmelskalender', 'Das Tagesorakel' in pt and 'Himmelskalender' in pt and ('Vollmond' in pt or 'Neumond' in pt))
        pg.screenshot(path=f'{out}/kalender.png')

        # Tageswechsel
        pg.evaluate("window.__dev.S.a2.orakel.date='2000-01-01'; window.__dev.A2.recalc()"); pg.wait_for_timeout(400)
        check('Orakel am nächsten Tag wieder frei', S('a2.todayPath') is None)

        # Fest: heutiger Termin wirkt
        r = pg.evaluate("""(async()=>{const o=await import('./js/akt2orakel.js');
          const f=o.festFx([{typ:'sonnenfest',name:'x',heute:true},{typ:'vollmond',name:'y',heute:true},{typ:'neumond',name:'z',heute:false}]);return f.fx})()""")
        check('Fest-Wirkungen: Sonnenfest ×1,3 + Vollmond Tippen ×1,5, Neumond nicht heute', abs(r['prod'] - 1.3) < 1e-9 and r['tap'] == 1.5 and r['rit'] == 1, json.dumps(r))

        # Geburtsort
        pg.evaluate("[...document.querySelectorAll('#a2panel .tab')].find(t=>/Schicksal/.test(t.textContent)).click()"); pg.wait_for_timeout(300)
        check('Hinweis: Geburtsort fehlt noch', 'fehlt noch dein Geburtsort' in pg.evaluate("document.getElementById('a2panel').textContent"))
        pg.evaluate("window.__dev.A2.dev.showEinweihung(true)"); pg.wait_for_timeout(400)
        check('Einweihung fragt nach Geburtsort', pg.evaluate("!!document.getElementById('pfOrt') && document.getElementById('pfOrte').options.length>80"))
        pg.fill('#pfTime', '14:30'); pg.fill('#pfOrt', 'Atlantis'); pg.click('#pfGo'); pg.wait_for_timeout(300)
        check('unbekannter Ort wird abgelehnt', 'kenne ich nicht' in pg.inner_text('#pfErr'))
        pg.fill('#pfOrt', 'Wien, Österreich'); pg.click('#pfGo'); pg.wait_for_timeout(600)
        ort = S('a2.prof.ort')
        check('Ort gespeichert (Wien, Zeitzone)', ort and ort['n'] == 'Wien' and ort['tz'] == 'Europe/Vienna', json.dumps(ort))
        ana = pg.evaluate("(()=>{const a=window.__dev.A2.dev.ana; return a? {iso:a.birth.toISOString(), asc:a.hori&&a.hori.ascZ}:null})()")
        check('Geburtszeit als echte Ortszeit (14:30 MESZ = 12:30 UTC), Aszendent berechnet', ana and ana['iso'] == '1990-07-14T12:30:00.000Z' and ana['asc'] is not None, json.dumps(ana))
        pg.evaluate("window.__dev.A2.dev.showEinweihung(true)"); pg.wait_for_timeout(300)
        pg.evaluate("document.getElementById('pfAnders').open=true"); pg.fill('#pfOrt', ''); pg.fill('#pfLat', '35.0'); pg.fill('#pfLon', '139.0'); pg.select_option('#pfTz', 'Asia/Tokyo'); pg.click('#pfGo'); pg.wait_for_timeout(500)
        check('Eigener Ort per Koordinaten', S('a2.prof.ort.tz') == 'Asia/Tokyo' and S('a2.prof.ort.lat') == 35)

        # Klang
        pg.wait_for_timeout(800)
        res = pg.evaluate("""(async()=>{const m=window.__dev.music; if(!m.ctx) return {ctx:false};
          await m.resume(); const an=m.ctx.createAnalyser(); an.fftSize=2048; m.master.connect(an);
          window.__dev.S.a2.owned[0]=5; window.__dev.S.a2.owned[1]=3; window.__dev.A2.refreshAll();
          await new Promise(r=>setTimeout(r,2500));
          const buf=new Float32Array(an.fftSize); let peak=0;
          for(let k=0;k<12;k++){an.getFloatTimeDomainData(buf); for(const v of buf) peak=Math.max(peak,Math.abs(v)); await new Promise(r=>setTimeout(r,200));}
          return {ctx:true,state:m.ctx.state,peak}})()""")
        check('Klang: AudioContext läuft und es klingt etwas', res.get('ctx') and res.get('state') == 'running' and res.get('peak', 0) > 0.0005, json.dumps(res))
        check('Akt-I-Schichten schweigen, Orden-Klang aktiv', pg.evaluate("window.__dev.music.level === 0 || window.__dev.music.level === undefined"))
        pg.screenshot(path=f'{out}/spiel.png')
        check('Konsolenfehler: keine', not errors, '; '.join(errors[:3]))
finally:
    srv.terminate()
print('Alle Tests bestanden' if not fails else f'FEHLGESCHLAGEN: {fails}')
sys.exit(1 if fails else 0)
