"""V4-Test: Mythologie, Enden, Zeitparadox, Chronik. Aufruf: python3 tools/test_v4.py [ordner]"""
import glob, json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/v4'; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8150'], cwd=os.path.join(os.path.dirname(__file__), '..', 'www'),
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors, fails = [], []
def check(name, ok, info=''):
    print(('OK   ' if ok else 'FAIL ') + name + (f'  [{info}]' if info else ''))
    if not ok: fails.append(name)

def base(**kw):
    owned = [0] * 24; owned[0] = 5
    s = {'v': 1, 'universe': 145, 'runsDone': 1, 'complexity': 5000, 'runEarned': 1e4, 'lifetime': 1e4, 'owned': owned, 'epoch': 0,
         'finished': False, 'choices': {}, 'pendingEvent': None, 'fragments': [], 'constants': {'g': 0, 's': 0, 'em': 0, 'c': 0, 'x': 0},
         'intent': None, 'timeline': [], 'voiceEntered': [], 'taps': 0, 'playTime': 600, 'lastSeen': int(time.time() * 1000),
         'settings': {'music': False, 'sfx': False, 'vibrate': False}, 'introSeen': True,
         'moments': [1, 2, 3, 4, 5, 6, 7], 'letters': 10, 'pendingLaw': False, 'law': 'nebel'}
    s.update(kw); return s

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0])
    def open_page(state, init_extra=''):
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        ctx.add_init_script(init_extra + f"if(!sessionStorage.__s){{localStorage.setItem('singularity-x144', JSON.stringify({json.dumps(state)}));sessionStorage.__s=1}}")
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and '404' not in m.text else None)
        pg.goto('http://localhost:8150/?dev'); pg.wait_for_timeout(1200)
        pg.mouse.click(195, 500); pg.wait_for_timeout(1500)
        pg.evaluate('window.__dev.world.mutation=null;window.__dev.world.glitch=null')
        return ctx, pg
    modal_open = lambda pg: pg.evaluate("!document.getElementById('modal').classList.contains('hidden')")
    kicker = lambda pg: pg.evaluate("(document.querySelector('#modalCard .kicker')||{}).textContent||''")
    def click_first(pg):
        pg.evaluate("(()=>{const c=document.querySelector('#modalCard .choice-btn')||document.querySelector('#modalCard .btn');c&&c.click()})()")
    def drain(pg, stop, limit=12):
        for _ in range(limit):
            if stop(): return True
            if modal_open(pg): click_first(pg)
            pg.wait_for_timeout(450)
        return stop()
    econ = lambda pg, body: pg.evaluate(f"(async()=>{{const m=await import('./js/economy.js');const s=JSON.parse(JSON.stringify(window.__dev.S));{body}}})()")

    # ── 1) Mythologie ───────────────────────────────────────────
    ctx, pg = open_page(base(epoch=3, complexity=1e9, runEarned=1e9, acts={'kraft': 6, 'mutation': 0, 'moment': 0}))
    S = lambda e: pg.evaluate(f'window.__dev.S.{e}')
    pg.evaluate('window.__dev.leapNow()'); pg.wait_for_timeout(4800)
    ok = drain(pg, lambda: 'MYTHOS' in kicker(pg))
    check('Mythos beim Eintritt in Bewusstsein (nach Merkmal)', ok, kicker(pg))
    check('dominante Eingriffe „kraft" → Die Formende Hand', 'Die Formende Hand' in pg.inner_text('#modalCard'))
    check('zwei Dogmen zur Wahl', pg.evaluate("document.querySelectorAll('#modalCard .choice-btn').length") == 2)
    pg.screenshot(path=f'{out}/1-mythos.png')
    pg.evaluate("document.querySelector('#modalCard .choice-btn[data-id=opfer]').click()"); pg.wait_for_timeout(400)
    check('Mythos gespeichert', len(S('myths')) == 1 and S('myths[0].dogma') == 'opfer' and S('pendingMyth') is None, json.dumps(S('myths')))
    check('Gott im Pantheon', any(g['name'] == 'Die Formende Hand' for g in S('pantheon')), json.dumps(S('pantheon')))
    r = econ(pg, "const a=m.prodPerSec(s);s.myths=[];const b=m.prodPerSec(s);s.pantheon=[];s.myths=[];const c=m.prodPerSec(s);return [a/b,b/c]")
    check('Dogma Opfergabe +8 % Produktion', abs(r[0] - 1.08) < 1e-6, str(r))
    r = econ(pg, "s.myths=[];s.pantheon=[];const a=m.prodPerSec(s);s.pantheon=[{u:144,name:'x'},{u:144,name:'y'}];return m.prodPerSec(s)/a")
    check('Pantheon: +2 % je Gott', abs(r - 1.04) < 1e-6, str(r))
    r = econ(pg, "s.myths=[{e:6,id:'funke',name:'x',dogma:'zeremonie'}];return [m.auraMult(s,'cd'),m.auraMult(s,'frag')]")
    check('Zeremonie: Abklingzeit ×1,25', abs(r[0] - 1.25) < 1e-6 and r[1] == 1, str(r))
    # Varianten
    for acts, needle in (({'kraft': 0, 'mutation': 5, 'moment': 0}, 'Die Göttin des Zufalls'), ({'kraft': 1, 'mutation': 1, 'moment': 0}, 'Der Verborgene')):
        pg.evaluate(f"window.__dev.S.acts={json.dumps(acts)};window.__dev.S.pendingMyth=5;window.__dev.queue()"); pg.wait_for_timeout(500)
        check(f'Mythos-Variante {needle}', needle in pg.inner_text('#modalCard'))
        click_first(pg); pg.wait_for_timeout(300)
        if modal_open(pg): pg.evaluate("document.querySelector('#modalCard .choice-btn')&&document.querySelector('#modalCard .choice-btn').click()")
        pg.evaluate("window.__dev.S.myths=window.__dev.S.myths.filter(m=>m.e!==5)"); pg.wait_for_timeout(200)
    # kein Mythos in Durchlauf 1
    ctx.close()
    ctx, pg = open_page(base(runsDone=0, universe=144, law=None, epoch=3, complexity=1e9, runEarned=1e9))
    pg.evaluate('window.__dev.leapNow()'); pg.wait_for_timeout(4800)
    drain(pg, lambda: not modal_open(pg), 6)
    check('Durchlauf 1: kein Mythos', pg.evaluate('window.__dev.S.pendingMyth') is None and pg.evaluate('window.__dev.S.myths.length') == 0)
    ctx.close()

    # ── 2) Enden ────────────────────────────────────────────────
    ctx, pg = open_page(base())
    cases = [({'kraft': 0, 'mutation': 0, 'moment': 0}, 0, 0, 'schweigen'), ({'kraft': 0, 'mutation': 0, 'moment': 0}, -1, 0, 'zweifler'),
             ({'kraft': 9, 'mutation': 1, 'moment': 0}, -1, 0, 'lenker'), ({'kraft': 9, 'mutation': 1, 'moment': 0}, 1, 0, 'hueter'),
             ({'kraft': 1, 'mutation': 6, 'moment': 2}, 0, 0, 'funke'), ({'kraft': 9, 'mutation': 1, 'moment': 0}, 1, 10, 'erster')]
    ok = True; res = []
    for acts, eth, let, want in cases:
        got = econ(pg, f"s.acts={json.dumps(acts)};s.ethik={eth};s.letters={let};return m.endingOf(s)")
        res.append(got); ok = ok and got == want
    check('6 Enden werden korrekt bestimmt', ok, ','.join(res))
    r = econ(pg, "s.endings=[];const a=m.prodPerSec(s);s.endings=['a','b'];return m.prodPerSec(s)/a")
    check('Siegel: +3 % je Ende', abs(r - 1.06) < 1e-6, str(r))
    ctx.close()
    # Ablauf: Singularität → Ende-Szene → Gedanke
    ctx, pg = open_page(base(epoch=7, complexity=1e12, runEarned=1e12, letters=3, acts={'kraft': 8, 'mutation': 0, 'moment': 0}, ethik=-1, endings=['schweigen']))
    S = lambda e: pg.evaluate(f'window.__dev.S.{e}')
    pg.evaluate('(()=>{window.__dev.leapNow()})()')   # Rückgabe nicht abwarten: das Finale endet erst nach dem Klick
    pg.wait_for_timeout(29000)
    check('Ende-Szene erscheint nach den Schlusszeilen', 'DAS ENDE' in kicker(pg), kicker(pg))
    check('Ende „Der Lenker" (Eingriffe + Eingreifen)', S('ending') == 'lenker' and 'Der Lenker' in pg.inner_text('#modalCard'), str(S('ending')))
    check('neues Siegel gespeichert', set(S('endings')) == {'schweigen', 'lenker'}, json.dumps(S('endings')))
    pg.screenshot(path=f'{out}/2-ende.png')
    click_first(pg); pg.wait_for_timeout(800)
    check('danach „Der Gedanke"', pg.evaluate("!!document.querySelector('#overlay .thought')"))
    # Urknall: Chronik, Pantheon, Siegel bleiben erhalten
    pg.evaluate("window.__dev.S.avatars=['mutter'];window.__dev.S.myths=[{e:4,id:'kraft',name:'Die Formende Hand',dogma:'opfer'}];window.__dev.S.pantheon=[{u:145,name:'Die Formende Hand'}]")
    pg.evaluate("window.__dev.bigBang({g:1,s:1,em:1,c:1,x:1},'wille')"); pg.wait_for_timeout(9500)
    ch = S('chronik')
    check('Chronik-Eintrag des abgeschlossenen Universums', len(ch) == 1 and ch[0]['u'] == 145 and ch[0]['ending'] == 'lenker' and ch[0]['avatars'] == ['Die Mutterzelle'], json.dumps(ch)[:160])
    check('Siegel & Pantheon bleiben über Universen', len(S('endings')) == 2 and len(S('pantheon')) == 1 and S('universe') == 146 and S('ending') is None and S('myths') == [])
    ctx.close()

    # ── 3) Zeitparadox ──────────────────────────────────────────
    ctx, pg = open_page(base(epoch=4, complexity=1e7, runEarned=1e7))
    cdp = ctx.new_cdp_session(pg)
    touch = lambda kind, pts: cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': pts})
    S = lambda e: pg.evaluate(f'window.__dev.S.{e}')
    pg.wait_for_timeout(400)
    check('Zeitparadox-Karte ab Epoche 4 mit 4 Zielen', pg.evaluate("document.querySelectorAll('#paradoxCard .pbtns button').length") == 4)
    pg.screenshot(path=f'{out}/3-paradox.png')
    pg.evaluate('window.__dev.S.owned[3]=10')
    c0 = S('complexity')
    # per Touch auf das Ziel „Erste Zellen" (e=1) senden
    rr = pg.evaluate("(()=>{const r=document.querySelector('#paradoxCard .pbtns button[data-e=\"1\"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
    pg.evaluate("document.querySelector('#paradoxCard').scrollIntoView({block:'center'})"); pg.wait_for_timeout(200)
    rr = pg.evaluate("(()=>{const r=document.querySelector('#paradoxCard .pbtns button[data-e=\"1\"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
    touch('touchStart', [{'x': rr['x'], 'y': rr['y'], 'id': 1}]); touch('touchEnd', [])
    pg.wait_for_timeout(300)
    check('Senden per Touch: Kosten 10 %, Paradox +25', S('sent[1]') == 1 and abs(S('paradox') - 25) < 1.5 and 0.89 < S('complexity') / c0 < 0.91, f"sent={S('sent')} p={S('paradox'):.1f} ✦×{S('complexity')/c0:.3f}")
    pg.evaluate('window.__dev.S.owned[6]=10')   # Generator 6 gehört zu Epoche 2 (nicht beschickt)
    r = econ(pg, "const a=m.genProd(s,6);s.sent={};const b=m.genProd(s,6);s.sent={2:1};const c=m.genProd(s,6);return [a/b, c/b]")
    check('Wirkung: global +4 % je Sendung, beschickte Epoche zusätzlich ×2', abs(r[0] - 1.04) < 1e-6 and abs(r[1] - 2.08) < 1e-6, str(r))
    for e in (1, 1, 1): pg.evaluate(f'window.__dev.send({e})')      # 2 weitere gelten, die 4. wird abgelehnt
    check('max. 3 Sendungen je Epoche', S('sent[1]') == 3, str(S('sent')))
    pg.evaluate('window.__dev.send(0)')                              # 4 Sendungen = 100 % Paradox, noch kein Riss
    check('Paradox steigt auf 100 % ohne Riss', 95 < S('paradox') <= 100 and sum(S('sent').values()) == 4, f"{S('paradox'):.0f} {S('sent')}")
    pg.screenshot(path=f'{out}/4-paradox-hoch.png')
    c1 = S('complexity'); pg.evaluate('window.__dev.send(2)')        # 5. Sendung → Riss
    check('Paradox > 100: die Zeit reißt (Sendungen weg, ✦ −40 %)', S('sent') == {} and S('paradox') == 0 and S('complexity') < c1 * 0.75, f"sent={S('sent')} p={S('paradox')}")
    check('Riss steht in der Zeitlinie', any('Zeit riss' in t['text'] for t in S('timeline')))
    pg.evaluate('window.__dev.S.paradox=50'); pg.wait_for_timeout(2100)
    check('Paradox baut sich ab', 48 < S('paradox') < 50.3, f"{S('paradox'):.1f}")
    ctx.close()

    # ── 4) Chronik ──────────────────────────────────────────────
    share_stub = "window.__shared=null;Object.defineProperty(navigator,'share',{value:(d)=>{window.__shared=d;return Promise.resolve()},configurable:true});"
    ctx, pg = open_page(base(universe=147, runsDone=3, epoch=3, endings=['schweigen', 'funke'],
                             pantheon=[{'u': 145, 'name': 'Der Verborgene'}], letters=2, ethik=1,
                             chronik=[{'u': 146, 'law': 'wasser', 'ending': 'funke', 'avatars': ['Die Mutterzelle'], 'myths': ['Der Funkenwerfer'], 'min': 31, 'ethik': 1, 'letters': 2, 'relics': 1, 'sent': 2}],
                             timeline=[{'u': 147, 'text': 'Mythos: <b>Der Lenker</b><small>Dogma Tempelbau</small>', 'kind': 'choice', 'c': '#fff'}]),
                      init_extra=share_stub)
    S = lambda e: pg.evaluate(f'window.__dev.S.{e}')
    pg.click('.tab[data-tab="time"]'); pg.wait_for_timeout(300)
    pg.evaluate("document.getElementById('chronikBtn').scrollIntoView()"); pg.wait_for_timeout(200)
    bb = pg.evaluate("(()=>{const r=document.getElementById('chronikBtn').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
    cdp = ctx.new_cdp_session(pg)
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': bb['x'], 'y': bb['y'], 'id': 1}]}); cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    pg.wait_for_timeout(400)
    txt = pg.inner_text('#modalCard')
    check('Chronik öffnet sich', 'Deine Universen' in txt and 'Universum 146' in txt and 'Universum 147' in txt and 'Wasserwelt' in txt and 'vor Beginn der Chronik' in txt, txt[:90].replace('\n', ' '))
    pg.screenshot(path=f'{out}/5-chronik.png')
    pg.evaluate("document.getElementById('shareBtn').click()"); pg.wait_for_timeout(400)
    sh = pg.evaluate('window.__shared')
    check('Teilen übergibt die Chronik an das Teilen-Menü', sh is not None and 'CHRONIK' in sh['text'] and 'Universum 146' in sh['text'] and 'Siegel: 2/6' in sh['text'] and 'Mythos: Der Lenker' in sh['text'], (sh or {}).get('text', '')[:60].replace('\n', ' | '))
    ctx.close()
    b.close()
srv.terminate()
print('Konsolenfehler:', errors or 'keine')
print('FEHLGESCHLAGEN: ' + ', '.join(fails) if fails else 'Alle Tests bestanden')
sys.exit(1 if fails or errors else 0)
