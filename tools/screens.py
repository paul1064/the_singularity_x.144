"""Handy-Screenshots (390x844): Titel, Epoche 4, Epoche 7, Der Gedanke. Aufruf: python3 tools/screens.py <outdir>"""
import glob, json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright

out = sys.argv[1]; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8144'], cwd=os.path.join(os.path.dirname(__file__), '..', 'www'),
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
URL = 'http://localhost:8144/?dev'
errors = []

def state(epoch, finished=False):
    owned = [0] * 24
    for i in range((epoch + 1) * 3):
        owned[i] = 12 + i
    return {'v': 1, 'universe': 144, 'runsDone': 0, 'complexity': 5e6 * 10 ** epoch, 'runEarned': 1e9, 'lifetime': 1e9,
            'owned': owned, 'epoch': epoch, 'finished': finished, 'choices': {'o2': 'a', 'asteroid': 'a'}, 'pendingEvent': None,
            'fragments': [], 'constants': {'g': 0, 's': 0, 'em': 0, 'c': 0, 'x': 0}, 'intent': None, 'timeline': [],
            'voiceEntered': [], 'taps': 50, 'playTime': 600, 'lastSeen': int(time.time() * 1000),
            'settings': {'music': False, 'sfx': False, 'vibrate': False}, 'introSeen': True}

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0])
    def shot(name, st, actions):
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        if st is not None:
            ctx.add_init_script(f"if(!sessionStorage.__seeded){{localStorage.setItem('singularity-x144', JSON.stringify({json.dumps(st)}));sessionStorage.__seeded=1}}")
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(f'{name}: {e}'))
        pg.on('console', lambda m: errors.append(f'{name}: {m.text}') if m.type == 'error' else None)
        pg.goto(URL); pg.wait_for_timeout(1500)
        actions(pg)
        pg.screenshot(path=os.path.join(out, name + '.png')); ctx.close()
    def tap_start(pg):
        pg.mouse.click(195, 500); pg.wait_for_timeout(3500)
    def intro_to_title(pg):
        pg.wait_for_timeout(1500); pg.mouse.click(195, 500); pg.wait_for_timeout(6000)
    shot('0-intro', None, lambda pg: pg.wait_for_timeout(1000))
    shot('1-titel', None, intro_to_title)
    shot('2-epoche4', state(3), tap_start)
    shot('3-epoche7', state(6), tap_start)
    shot('4-gedanke', state(7, True), lambda pg: (pg.mouse.click(195, 500), pg.wait_for_timeout(5000)))
    b.close()
srv.terminate()
print('Fehler:', errors or 'keine')
