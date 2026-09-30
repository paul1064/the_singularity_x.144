"""Avatar-Test: Erwachen, Wahl, Dock, Kraft, Abklingzeit, Speichern/Laden. Aufruf: python3 tools/test_avatare.py [ordner]"""
import glob, json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/av'; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8146'], cwd=os.path.join(os.path.dirname(__file__), '..', 'www'),
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors, fails = [], []
def check(name, ok, info=''):
    print(('OK   ' if ok else 'FAIL ') + name + (f'  [{info}]' if info else ''))
    if not ok: fails.append(name)

owned = [0] * 24
owned[0:3] = [20, 15, 10]; owned[3:6] = [12, 10, 6]    # Epoche 2: 28 Stück → Avatar
state = {'v': 1, 'universe': 144, 'runsDone': 0, 'complexity': 5e5, 'runEarned': 1e6, 'lifetime': 1e6, 'owned': owned, 'epoch': 1,
         'finished': False, 'choices': {}, 'pendingEvent': None, 'fragments': [], 'constants': {'g': 0, 's': 0, 'em': 0, 'c': 0, 'x': 0},
         'intent': None, 'timeline': [], 'voiceEntered': [], 'taps': 0, 'playTime': 600, 'lastSeen': int(time.time() * 1000),
         'settings': {'music': False, 'sfx': False, 'vibrate': False}, 'introSeen': True,
         'moments': [1, 2, 3, 4, 5, 6, 7], 'letters': 10, 'pendingLaw': False}

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    ctx.add_init_script(f"if(!sessionStorage.__s){{localStorage.setItem('singularity-x144', JSON.stringify({json.dumps(state)}));sessionStorage.__s=1}}")
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and '404' not in m.text else None)
    pg.goto('http://localhost:8146/?dev'); pg.wait_for_timeout(1200)
    pg.mouse.click(195, 500); pg.wait_for_timeout(1500)
    S = lambda expr: pg.evaluate(f'window.__dev.S.{expr}')
    pg.evaluate('window.__dev.S.buffs=[]')
    pg.wait_for_timeout(800)
    kick = pg.evaluate("(document.querySelector('#modalCard .kicker')||{}).textContent||''")
    check('Avatar erwacht bei genug Generatoren', 'AVATAR' in kick, kick)
    check('zwei Wege zur Wahl', pg.evaluate("document.querySelectorAll('#modalCard .choice-btn').length") == 2)
    pg.screenshot(path=f'{out}/1-avatar-wahl.png')
    # Neu laden während der Wahl → Wahl kommt wieder
    check('Wahl als ausstehend gespeichert', S('pendingAvatar') == 1)
    pg.evaluate("document.querySelector('#modalCard .choice-btn[data-id=mutter]').click()"); pg.wait_for_timeout(400)
    check('Avatar gewählt', S('avatars') == ['mutter'] if False else json.loads(json.dumps(S('avatars'))) == ['mutter'], json.dumps(S('avatars')))
    check('Dock zeigt den Avatar', pg.evaluate("document.querySelectorAll('#dock .av').length") == 1)
    check('Kraft bereit', pg.evaluate("document.querySelector('#dock .av').classList.contains('ready')"))
    pg.screenshot(path=f'{out}/2-dock.png')
    # Aura wirkt (+6 % Produktion)
    # Kraft auslösen: Teilung = Mutation → Effekt
    pg.evaluate("window.__dev.world.mutation=null")
    before = len(S('buffs')); c0 = S('complexity')
    pg.click('#dock .av'); pg.wait_for_timeout(300)
    check('Kraft löst aus, Abklingzeit läuft', S('avatarCd.mutter') > 90, str(S('avatarCd.mutter')))
    check('Mutation wirkte (Buff oder ✦)', len(S('buffs')) > before or S('complexity') > c0 + 1)
    check('Dock zeigt Abklingzeit', not pg.evaluate("document.querySelector('#dock .av').classList.contains('ready')"))
    cd1 = S('avatarCd.mutter'); pg.click('#dock .av'); pg.wait_for_timeout(100)
    check('zweites Auslösen wirkungslos', abs(S('avatarCd.mutter') - cd1) < 1.5)
    pg.screenshot(path=f'{out}/3-kraft.png')
    # Zeitlinie zeigt Avatar
    pg.click('.tab[data-tab="time"]'); pg.wait_for_timeout(300)
    check('Zeitlinie listet Avatar', 'Mutterzelle' in pg.inner_text('#tab-time'))
    # kein zweiter Avatar für dieselbe Epoche
    pg.wait_for_timeout(800)
    check('kein zweites Erwachen', not pg.evaluate("!document.getElementById('modal').classList.contains('hidden')"))
    # Speichern/Laden: Seite neu laden (pagehide speichert)
    pg.evaluate("window.dispatchEvent(new Event('pagehide'))")
    saved = json.loads(pg.evaluate("localStorage.getItem('singularity-x144')"))
    check('Speicherstand enthält Avatar + Abklingzeit', saved['avatars'] == ['mutter'] and saved['avatarCd']['mutter'] > 0)
    # Burst-Kraft: Leviathan
    pg.evaluate("window.__dev.S.epoch=2;window.__dev.S.owned[6]=30;window.__dev.S.pendingAvatar=null;window.__dev.checkAvatars()"); pg.wait_for_timeout(500)
    check('2. Avatar (Meer) erwacht', pg.evaluate("document.querySelectorAll('#modalCard .choice-btn').length") == 2 and 'Gigant' in pg.inner_text('#modalCard'))
    pg.screenshot(path=f'{out}/4-avatar-meer.png')
    pg.evaluate("document.querySelector('#modalCard .choice-btn[data-id=leviathan]').click()"); pg.wait_for_timeout(400)
    pg.evaluate("window.__dev.S.buffs=[]")
    pg.click('#dock .av[data-id=leviathan]'); pg.wait_for_timeout(300)
    check('Flut: Produktions-Buff ×3', any(x['k'] == 'prod' and x['m'] == 3 for x in S('buffs')), json.dumps(S('buffs')))
    check('Buff-Chip im HUD', 'Flut' in pg.inner_text('#buffs'), pg.inner_text('#buffs'))
    pg.screenshot(path=f'{out}/5-flut.png')
    b.close()
srv.terminate()
print('Konsolenfehler:', errors or 'keine')
print('FEHLGESCHLAGEN: ' + ', '.join(fails) if fails else 'Alle Tests bestanden')
sys.exit(1 if fails or errors else 0)
