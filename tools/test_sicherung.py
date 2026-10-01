"""Sicherungs-Test (Browser): Export, Import per Code/Datei, Schnappschüsse, Erinnerung.
Aufruf: python3 tools/test_sicherung.py [ordner]"""
import glob, json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/sich'; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8155'], cwd=os.path.join(os.path.dirname(__file__), '..', 'www'),
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors, fails = [], []
def check(name, ok, info=''):
    print(('OK   ' if ok else 'FAIL ') + name + (f'  [{info}]' if info else ''), flush=True)
    if not ok: fails.append(name)
owned = [0] * 24; owned[0] = 5
def base(**kw):
    s = {'v': 1, 'universe': 150, 'runsDone': 6, 'complexity': 4242, 'runEarned': 1e9, 'lifetime': 1e9, 'owned': owned, 'epoch': 0,
         'finished': False, 'choices': {}, 'pendingEvent': None, 'fragments': [], 'constants': {'g': 0, 's': 0, 'em': 0, 'c': 0, 'x': 0},
         'intent': None, 'timeline': [], 'voiceEntered': [], 'taps': 0, 'playTime': 600, 'lastSeen': int(time.time() * 1000),
         'settings': {'music': False, 'sfx': False, 'vibrate': False}, 'introSeen': True,
         'moments': [1, 2, 3, 4, 5, 6, 7], 'letters': 10, 'pendingLaw': False, 'law': 'nebel', 'akt': 1}
    s.update(kw); return s
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0])
        def open_page(state):
            ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, accept_downloads=True)
            ctx.add_init_script(f"if(!sessionStorage.__s){{localStorage.setItem('singularity-x144', JSON.stringify({json.dumps(state)}));sessionStorage.__s=1}}")
            pg = ctx.new_page(); pg.set_default_timeout(20000)
            pg.on('pageerror', lambda e: errors.append(str(e)))
            pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and '404' not in m.text else None)
            pg.goto('http://localhost:8155/?dev&remind'); pg.wait_for_timeout(1200); pg.mouse.click(195, 500); pg.wait_for_timeout(1500)
            return ctx, pg
        click = lambda pg, id: pg.evaluate(f"document.getElementById('{id}').click()")
        ctx, pg = open_page(base(lastBackup=int(time.time() * 1000)))
        check('Schnappschuss beim Start angelegt', pg.evaluate("JSON.parse(localStorage.getItem('singularity-x144-snap')||'[]').length") == 1)
        pg.click('#settingsBtn'); pg.wait_for_timeout(300); click(pg, 'backupSet'); pg.wait_for_timeout(300)
        check('Sicherungs-Fenster', 'Spielstand sichern' in pg.inner_text('#modalCard') and 'heute' in pg.inner_text('#modalCard'))
        with pg.expect_download() as d: click(pg, 'bkExport')
        path = d.value.path(); data = open(path, encoding='utf8').read()
        check('Datei-Export (JSON mit Prüfsumme)', '"hash"' in data and '"universe":150' in data, d.value.suggested_filename)
        pg.wait_for_timeout(400)
        check('lastBackup gesetzt', pg.evaluate("window.__dev.S.lastBackup>0"))
        pg.screenshot(path=f'{out}/backup.png')
        # Code erzeugen
        code = pg.evaluate("window.__dev.SI.toCode(window.__dev.SI.packBackup(Object.assign({},window.__dev.S,{complexity:777777,universe:151})))")
        click(pg, 'bkImport'); pg.wait_for_timeout(300)
        pg.fill('#bkText', 'SX144:kaputt'); click(pg, 'bkRead'); pg.wait_for_timeout(200)
        check('kaputter Code → Fehlermeldung', len(pg.inner_text('#bkMsg')) > 5, pg.inner_text('#bkMsg'))
        pg.fill('#bkText', code); click(pg, 'bkRead'); pg.wait_for_timeout(300)
        check('Vorschau zeigt Sicherung und Aktuell', 'Universum 151' in pg.inner_text('#modalCard') and 'Universum 150' in pg.inner_text('#modalCard'))
        click(pg, 'bkNo'); pg.wait_for_timeout(200)
        check('Abbrechen ändert nichts', pg.evaluate("window.__dev.S.universe") == 150)
        pg.fill('#bkText', code); click(pg, 'bkRead'); pg.wait_for_timeout(200)
        pg.evaluate("document.getElementById('bkGo').click()"); pg.wait_for_timeout(1800)
        got = pg.evaluate("JSON.parse(localStorage.getItem('singularity-x144'))")
        check('Import: Stand geladen (nach Neustart)', got['universe'] == 151 and got['complexity'] >= 777777, f"u={got['universe']}")
        snaps = pg.evaluate("JSON.parse(localStorage.getItem('singularity-x144-snap'))")
        check('alter Stand liegt als Schnappschuss bereit', any(x['info']['universe'] == 150 for x in snaps), str([x['info']['universe'] for x in snaps]))
        ctx.close()
        # Erinnerung
        ctx, pg = open_page(base())
        pg.wait_for_timeout(7500)
        check('Erinnerung erscheint (nie gesichert)', 'KLEINE ERINNERUNG' in pg.inner_text('#modalCard') and not pg.evaluate("document.getElementById('modal').classList.contains('hidden')"))
        click(pg, 'rmNo'); pg.wait_for_timeout(300)
        check('„Später" merkt sich die Frage', pg.evaluate("window.__dev.S.backupAsked>0"))
        ctx.close()
        ctx, pg = open_page(base(lastBackup=int(time.time() * 1000) - 8 * 86400e3, backupAsked=int(time.time() * 1000) - 3600e3))
        pg.wait_for_timeout(7500)
        check('keine Erinnerung, wenn kürzlich gefragt', pg.evaluate("document.getElementById('modal').classList.contains('hidden')"))
        check('Konsolenfehler: keine', not errors, '; '.join(errors[:3]))
finally:
    srv.terminate()
print('Alle Tests bestanden' if not fails else f'FEHLGESCHLAGEN: {fails}'); sys.exit(1 if fails else 0)
