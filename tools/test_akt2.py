"""Akt-II-Test: Einweihung, Schicksalsebenen, Mentoren, Pfade, Zeitalter, Ritual, Finale/Dimension, Speichern, Übergang 155.
Aufruf: python3 tools/test_akt2.py [ordner]   (dauert ca. 2 Minuten)"""
import glob, json, os, sys, time, subprocess
from playwright.sync_api import sync_playwright

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/akt2'; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen(['python3', '-m', 'http.server', '8153'], cwd=os.path.join(os.path.dirname(__file__), '..', 'www'),
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
errors, fails = [], []
def check(name, ok, info=''):
    print(('OK   ' if ok else 'FAIL ') + name + (f'  [{info}]' if info else ''), flush=True)
    if not ok: fails.append(name)

def base(**kw):
    owned = [0] * 24; owned[0] = 5
    s = {'v': 1, 'universe': 153, 'runsDone': 9, 'complexity': 1000, 'runEarned': 1e9, 'lifetime': 1e9, 'owned': owned, 'epoch': 0,
         'finished': False, 'choices': {}, 'pendingEvent': None, 'fragments': [], 'constants': {'g': 0, 's': 0, 'em': 0, 'c': 0, 'x': 0},
         'intent': None, 'timeline': [], 'voiceEntered': [], 'taps': 0, 'playTime': 600, 'lastSeen': int(time.time() * 1000),
         'settings': {'music': False, 'sfx': False, 'vibrate': False}, 'introSeen': True,
         'moments': [1, 2, 3, 4, 5, 6, 7], 'letters': 10, 'pendingLaw': False, 'law': 'nebel', 'akt': 1}
    s.update(kw); return s

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROME_PATH') or (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0])
    def open_page(state, title_tap=True):
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        ctx.add_init_script(f"if(!sessionStorage.__s){{localStorage.setItem('singularity-x144', JSON.stringify({json.dumps(state)}));sessionStorage.__s=1}}")
        pg = ctx.new_page(); pg.set_default_timeout(20000)
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' and '404' not in m.text else None)
        pg.goto('http://localhost:8153/?dev'); pg.wait_for_timeout(1200)
        if title_tap: pg.mouse.click(195, 500); pg.wait_for_timeout(1500)
        return ctx, pg
    kicker = lambda pg: pg.evaluate("(document.querySelector('#modalCard .kicker')||{}).textContent||''")
    modal_open = lambda pg: pg.evaluate("!document.getElementById('modal').classList.contains('hidden')")
    S = lambda pg, e: pg.evaluate(f'window.__dev.S.{e}')
    def wait_modal(pg, needle, tries=40):
        for _ in range(tries):
            if needle in kicker(pg) and modal_open(pg): return True
            pg.wait_for_timeout(300)
        return False
    def ok_modal(pg):
        pg.evaluate("(()=>{const c=document.getElementById('a2ok')||document.querySelector('#modalCard .choice-btn');c&&c.click()})()")
        pg.wait_for_timeout(500)
    econ = lambda pg, body: pg.evaluate(f"(async()=>{{const m=await import('./js/akt2econ.js');const a2=window.__dev.S.a2;const fx=window.__dev.A2.dev.fx;{body}}})()")

    # ── A) Vorschau über die Einstellungen, Einweihung ─────────
    ctx, pg = open_page(base())
    cdp = ctx.new_cdp_session(pg)
    touch = lambda kind, pts: cdp.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': pts})
    pg.click('#settingsBtn'); pg.wait_for_timeout(400)
    check('Einstellungen bieten Akt II (Vorschau)', pg.evaluate("!!document.getElementById('a2Preview')"))
    pg.evaluate("document.getElementById('a2Preview').click()"); pg.wait_for_timeout(900)
    check('Akt II ist aktiv (Tree-Canvas, Akt-I-Panel weg)', pg.evaluate("document.body.classList.contains('akt2') && !document.getElementById('a2c').classList.contains('hidden') && getComputedStyle(document.getElementById('panel')).display==='none'"))
    check('Einweihung erscheint zuerst', 'EINWEIHUNG' in kicker(pg), kicker(pg))
    pg.screenshot(path=f'{out}/1-einweihung.png')
    pg.fill('#pfName', 'A'); pg.fill('#pfDate', '1990-07-14'); pg.click('#pfGo'); pg.wait_for_timeout(300)
    check('zu kurzer Name wird abgelehnt', 'Name' in pg.inner_text('#pfErr') and S(pg, 'a2.prof') is None, pg.inner_text('#pfErr'))
    pg.fill('#pfName', 'Paul Feichtinger'); pg.fill('#pfDate', ''); pg.click('#pfGo'); pg.wait_for_timeout(300)
    check('fehlendes Datum wird abgelehnt', 'Geburtsdatum' in pg.inner_text('#pfErr'))
    pg.fill('#pfDate', '1990-07-14'); pg.fill('#pfTime', '14:30'); pg.click('#pfGo'); pg.wait_for_timeout(1000)
    prof = S(pg, 'a2.prof')
    check('Profil gespeichert (lokal)', prof and prof['name'] == 'Paul Feichtinger' and prof['y'] == 1990 and prof['m'] == 7 and prof['d'] == 14 and prof['h'] == 14 and prof['min'] == 30, json.dumps(prof))
    check('danach: Schicksalsebene 1/7', wait_modal(pg, 'SCHICKSALSEBENE 1/7'), kicker(pg))
    txt = pg.inner_text('#modalCard')
    check('Ebene 1 zeigt berechnete Werte (Sonne Krebs, Lebensweg 4)', 'Sonne in Krebs' in txt and 'Lebensweg 4' in txt and 'Yesod' in txt, txt[:70].replace('\n', ' '))
    check('Hinweis: Symbolsprache, keine Wissenschaft', 'keine Wissenschaft' in txt)
    check('Wirkung im Spiel wird genannt', 'Wirkung im Spiel' in txt)
    ok_modal(pg)
    check('Ebene 1 enthüllt', S(pg, 'a2.layers') == 1 and S(pg, 'a2.pendingLayer') is None)
    check('danach: Thoth erscheint', wait_modal(pg, 'EIN LEHRER ERSCHEINT') and 'Thoth' in pg.inner_text('#modalCard'))
    ok_modal(pg)
    check('Thoth im Orden', S(pg, 'a2.mentors') == ['thoth'])
    fxs = pg.evaluate('window.__dev.A2.dev.fx.seph')
    check('Resonanz: Herrscher der Sonne (Yesod) ×1,3', abs(fxs[1] - 1.3) < 1e-9 and fxs[0] == 1, json.dumps(fxs[:3]))
    pg.evaluate("window.__dev.S.a2.wissen = 50000"); pg.wait_for_timeout(500)
    pg.screenshot(path=f'{out}/2-spiel.png')

    # ── B) Kaufen per Berührung, Mehrfinger, Pfade ───────────
    pos = pg.evaluate('window.__dev.A2.dev.nodePos(0)')          # Malkuth
    o0, t0 = S(pg, 'a2.owned[0]'), S(pg, 'a2.taps')
    three = [{'x': 18, 'y': 300, 'id': 1}, {'x': 18, 'y': 360, 'id': 2}, {'x': 372, 'y': 330, 'id': 3}]   # am Rand: zwischen den Knoten ist Platz zum Tippen
    touch('touchStart', three)
    p4 = {'x': pos['x'], 'y': pos['y'], 'id': 4}
    touch('touchStart', three + [p4]); touch('touchEnd', [p4])
    pg.wait_for_timeout(200)
    check('Sephira antippen kauft, während 3 Finger weitertippen', S(pg, 'a2.owned[0]') == o0 + 1 and S(pg, 'a2.taps') - t0 == 3, f"owned {o0}→{S(pg,'a2.owned[0]')}, Tipps +{S(pg,'a2.taps')-t0}")
    touch('touchEnd', [])
    pg.evaluate("window.__dev.S.a2.owned[0]=7;window.__dev.S.a2.owned[1]=7;window.__dev.S.a2.age=0")
    n = econ(pg, "return m.activePaths(a2).length")
    check('Pfad Tav (Yesod–Malkuth) leuchtet bei 7+7', n == 1, str(n))
    pg.evaluate("window.__dev.S.a2.owned[2]=7;window.__dev.S.a2.owned[3]=7;window.__dev.S.a2.owned[4]=7")
    r = econ(pg, "const a=m.globalMult(a2,fx); a2.owned[2]=0; a2.owned[3]=0; a2.owned[4]=0; const b=m.globalMult(a2,fx); a2.owned[2]=7;a2.owned[3]=7;a2.owned[4]=7; return [a,b,m.activePaths(a2).length]")
    check('Pfade erhöhen den Ertrag (+6 % je Pfad)', r[0] > r[1], json.dumps(r))
    # Heilige Zahlen
    r = econ(pg, "return [m.milestoneMult(2), m.milestoneMult(3), m.milestoneMult(7), m.milestoneMult(12)]")
    check('heilige Zahlen 3/7/12 verstärken', r[0] == 1 and abs(r[1] - 1.3) < 1e-9 and abs(r[2] - 1.69) < 1e-9 and abs(r[3] - 2.197) < 1e-9, json.dumps(r))

    # ── C) Mentorenkraft, Zeitalter, Ereignis ─────────────────
    w0 = S(pg, 'a2.wissen'); pg.evaluate("window.__dev.A2.dev.firePower('thoth')"); pg.wait_for_timeout(200)
    check('Thoths Kraft bringt Wissen und läuft in die Abklingzeit', S(pg, 'a2.wissen') > w0 and S(pg, "a2.mcd.thoth") > 100, f"cd={S(pg,'a2.mcd.thoth'):.0f}")
    c = econ(pg, "return m.leapCost(a2)")
    pg.evaluate(f"window.__dev.S.a2.wissen = {c * 2}"); pg.wait_for_timeout(400)
    pg.evaluate("document.querySelector('#a2Leap .leap').scrollIntoView()")
    lb = pg.evaluate("(()=>{const r=document.querySelector('#a2Leap .leap').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()")
    touch('touchStart', [{'x': lb['x'], 'y': lb['y'], 'id': 1}]); touch('touchEnd', [])
    pg.wait_for_timeout(600)
    check('Einweihung in das nächste Zeitalter (Ägypten)', S(pg, 'a2.age') == 1 and 'Ägypten' in pg.inner_text('#epochLabel'), pg.inner_text('#epochLabel'))
    check('Hermes Trismegistos erscheint', wait_modal(pg, 'EIN LEHRER ERSCHEINT') and 'Hermes Trismegistos' in pg.inner_text('#modalCard'))
    pg.screenshot(path=f'{out}/3-hermes.png')
    ok_modal(pg)
    check('Weltereignis „Die Smaragdtafel"', wait_modal(pg, 'DIE WELT WÄHLT') and 'Smaragdtafel' in pg.inner_text('#modalCard'))
    pg.evaluate("document.querySelector('#modalCard .choice-btn[data-k=a]').click()"); pg.wait_for_timeout(500)
    check('Wahl „Bewahren" wirkt (Produktion +6 %, Weg +1)', S(pg, "a2.events['1']") == 'a' and S(pg, 'a2.weg') == 1 and abs(pg.evaluate('window.__dev.A2.dev.fx.prod') / 1.0) > 1.0)
    check('Mentoren: Thoth und Hermes', S(pg, 'a2.mentors') == ['thoth', 'hermes'])
    pg.screenshot(path=f'{out}/4-ägypten.png')

    # ── D) Ritual „Die Sequenz" ─────────────────────────────
    pg.evaluate("window.__dev.S.a2.ritCd=0;window.__dev.S.a2.owned[0]=3;window.__dev.S.a2.owned[1]=3;window.__dev.S.a2.owned[2]=3")
    pg.evaluate("window.__dev.A2.dev.startRitual()"); pg.wait_for_timeout(300)
    rit = pg.evaluate("window.__dev.A2.dev.ritual")
    check('Ritual startet mit Sequenz der Länge 3', rit and rit['len'] == 3 and rit['phase'] == 'show', json.dumps(rit))
    pg.screenshot(path=f'{out}/5-ritual.png')
    pg.wait_for_timeout(3600)
    check('nach dem Vorzeigen beginnt die Eingabe', pg.evaluate("window.__dev.A2.dev.ritual.phase") == 'input')
    seq = pg.evaluate("window.__dev.A2.dev.ritual.seq")
    w1 = S(pg, 'a2.wissen')
    for i in seq:
        pp = pg.evaluate(f'window.__dev.A2.dev.nodePos({i})')
        touch('touchStart', [{'x': pp['x'], 'y': pp['y'], 'id': 1}]); touch('touchEnd', [])
        pg.wait_for_timeout(120)
    check('richtige Reihenfolge: Ritual gelingt (Buff, Wissen)', pg.evaluate("window.__dev.A2.dev.ritual") is None and any(x['n'] == 'Ritual' for x in S(pg, 'a2.buffs')) and S(pg, 'a2.wissen') > w1, json.dumps(S(pg, 'a2.buffs'))[:80])
    pg.evaluate("window.__dev.S.a2.ritCd=0;window.__dev.S.a2.buffs=[]"); pg.evaluate("window.__dev.A2.dev.startRitual()"); pg.wait_for_timeout(4200)
    seq = pg.evaluate("window.__dev.A2.dev.ritual.seq"); wrong = [i for i in (0, 1, 2) if i != seq[0]][0]
    pp = pg.evaluate(f'window.__dev.A2.dev.nodePos({wrong})'); touch('touchStart', [{'x': pp['x'], 'y': pp['y'], 'id': 1}]); touch('touchEnd', [])
    pg.wait_for_timeout(300)
    check('falscher Knoten: Ritual scheitert, kein Buff', pg.evaluate("window.__dev.A2.dev.ritual") is None and S(pg, 'a2.buffs') == [])

    # ── E) Schicksal-Tab und Daten ändern ───────────────────
    pg.evaluate("document.querySelector('#a2panel .tab[data-a2tab=schicksal]').click()")
    pg.evaluate("(()=>{const t=[...document.querySelectorAll('#a2panel .tab')].find(x=>x.dataset.a2tab==='schicksal');t.dispatchEvent(new PointerEvent('pointerdown',{pointerId:9,bubbles:true}));t.dispatchEvent(new PointerEvent('pointerup',{pointerId:9,bubbles:true}))})()")
    pg.wait_for_timeout(400)
    tx = pg.inner_text('#a2-schicksal')
    check('Schicksal-Tab: Himmel heute, Ebene 1, gesperrte nächste Ebene', 'Der Himmel heute' in tx and '1/7' in tx and 'Dein Kern' in tx and 'Deine Seele' in tx and 'wird beim Beginn des nächsten Durchgangs enthüllt' in tx.replace('\n', ' '), tx[:60].replace('\n', ' '))
    pg.screenshot(path=f'{out}/6-schicksal.png')
    pg.evaluate("window.__dev.A2.dev.showEinweihung(true)"); pg.wait_for_timeout(300)
    pg.fill('#pfDate', '1985-01-25'); pg.click('#pfGo'); pg.wait_for_timeout(600)
    tx = pg.inner_text('#a2-schicksal')
    check('Daten ändern: neue Deutung (Wassermann)', 'Wassermann' in tx, S(pg, 'a2.prof.d') and str(S(pg, 'a2.prof')))
    pg.evaluate("window.__dev.A2.dev.showEinweihung(true)"); pg.wait_for_timeout(200)
    pg.fill('#pfDate', '1990-07-14'); pg.click('#pfGo'); pg.wait_for_timeout(500)

    # ── F) Finale: Transzendente Singularität → Dimension ────
    pg.evaluate("window.__dev.S.a2.age=7;window.__dev.S.a2.weg=3;window.__dev.S.a2.pendingEvent=0;window.__dev.S.a2.pendingMentor=0")
    c = econ(pg, "return m.leapCost(a2)")
    pg.evaluate(f"window.__dev.S.a2.wissen = {c * 2}"); pg.wait_for_timeout(500)
    pg.evaluate("(()=>{window.__dev.A2.dev.doLeap()})()")
    check('Finale: Ende des Ordens erscheint', wait_modal(pg, 'DAS ENDE DES ORDENS', 80), kicker(pg))
    check('Weg +3 → „Der Hüter des Wissens"', 'Hüter des Wissens' in pg.inner_text('#modalCard'))
    pg.screenshot(path=f'{out}/7-ende.png')
    ok_modal(pg)
    check('Transzendente Singularität: Dimension 1 „Zeit"', wait_modal(pg, 'TRANSZENDENTE SINGULARITÄT', 20) and 'Die Vierte: Zeit' in pg.inner_text('#modalCard') and 'Daath' in pg.inner_text('#modalCard'))
    pg.screenshot(path=f'{out}/8-dimension.png')
    ok_modal(pg); pg.wait_for_timeout(800)
    check('neue Dimension und neuer Durchgang (Vorschau: Universum bleibt 153)', S(pg, 'a2.dim') == 1 and S(pg, 'a2.run') == 2 and S(pg, 'universe') == 153 and S(pg, 'a2.age') == 0 and S(pg, 'a2.mentors') == [], f"dim={S(pg,'a2.dim')} run={S(pg,'a2.run')} u={S(pg,'universe')}")
    check('Vorschau schreibt nichts in die Chronik von Akt I', S(pg, 'chronik') == [])
    check('Schicksalsebenen und Profil bleiben', S(pg, 'a2.layers') == 1 and S(pg, 'a2.prof.name') == 'Paul Feichtinger')
    check('Ebene 2 „Deine Seele" wird zu Beginn des neuen Durchgangs enthüllt', wait_modal(pg, 'SCHICKSALSEBENE 2/7') and 'Mond in' in pg.inner_text('#modalCard'), kicker(pg))
    pg.screenshot(path=f'{out}/9-ebene2.png')
    ok_modal(pg)
    check('Thoth kehrt zurück', wait_modal(pg, 'EIN LEHRER ERSCHEINT')); ok_modal(pg)
    r = econ(pg, "return [fx.offline, m.genUnlocked(a2,10), fx.prod]")
    check('Dimension 1 wirkt: Offline ×2 (plus Ebene-2-Bonus), Produktion ×1,25', r[0] >= 2 and r[2] >= 1.25, json.dumps(r))
    pg.evaluate("window.__dev.S.a2.age=3"); r = econ(pg, "return m.genUnlocked(a2,10)")
    check('Daath erscheint ab Dimension 1 (ab Zeitalter 4)', r is True)
    pg.evaluate("window.__dev.S.a2.age=0")
    pg.wait_for_timeout(300)

    # ── G) Speichern & Neuladen, Rückweg nach Akt I ──────────
    pg.evaluate("window.dispatchEvent(new Event('pagehide'))")
    saved = json.loads(pg.evaluate("localStorage.getItem('singularity-x144')"))
    check('Speicherstand enthält Akt II', saved['akt'] == 2 and saved['a2']['dim'] == 1 and saved['a2']['prof']['name'] == 'Paul Feichtinger')
    pg.reload(); pg.wait_for_timeout(1500); pg.mouse.click(195, 500); pg.wait_for_timeout(2000)
    check('Neustart: Akt II startet direkt, Daten bleiben', pg.evaluate("document.body.classList.contains('akt2')") and S(pg, 'a2.dim') == 1 and S(pg, 'a2.prof.name') == 'Paul Feichtinger')
    for _ in range(6):
        if modal_open(pg): ok_modal(pg)
        pg.wait_for_timeout(400)
    pg.click('#settingsBtn'); pg.wait_for_timeout(300)
    check('Vorschau-Modus: „Zurück zu Akt I" vorhanden', pg.evaluate("!!document.getElementById('a2Back')"))
    pg.evaluate("document.getElementById('a2Back').click()"); pg.wait_for_timeout(900)
    check('zurück in Akt I: Panel sichtbar, Akt-II-Zustand bleibt erhalten', not pg.evaluate("document.body.classList.contains('akt2')") and S(pg, 'akt') == 1 and S(pg, 'a2.dim') == 1 and pg.evaluate("getComputedStyle(document.getElementById('panel')).display") != 'none')
    ctx.close()

    # ── H) Übergang bei Universum 155 ───────────────────────
    ctx, pg = open_page(base(universe=154, epoch=7, finished=True, constants={'g': 1, 's': 1, 'em': 1, 'c': 1, 'x': 1}, endings=['schweigen']))
    pg.evaluate("document.getElementById('overlay').classList.add('hidden')")
    pg.evaluate("window.__dev.bigBang({g:1,s:1,em:1,c:1,x:1},'wille')")
    pg.wait_for_timeout(16000)
    check('Universum 155: Akt II beginnt automatisch', S(pg, 'universe') == 155 and S(pg, 'akt') == 2 and pg.evaluate("document.body.classList.contains('akt2')"), f"u={S(pg,'universe')} akt={S(pg,'akt')}")
    check('Erster Schritt: die Einweihung (Name & Geburtsdatum)', wait_modal(pg, 'EINWEIHUNG', 10))
    pg.screenshot(path=f'{out}/10-universum155.png')
    pg.fill('#pfName', 'Lena Muster'); pg.fill('#pfDate', '1992-12-03'); pg.click('#pfGo'); pg.wait_for_timeout(800)
    ok_modal(pg); wait_modal(pg, 'EIN LEHRER ERSCHEINT'); ok_modal(pg)
    check('echter Durchgang 1 (kein Vorschau-Modus)', S(pg, 'a2.run') == 1 and not S(pg, 'a2.preview') and S(pg, 'a2.layers') == 1)
    pg.click('#settingsBtn'); pg.wait_for_timeout(300)
    check('ab 155 kein Rückweg zu Akt I', not pg.evaluate("!!document.getElementById('a2Back')")); pg.evaluate("document.getElementById('closeSet').click()")
    pg.evaluate("window.__dev.S.a2.age=7")
    c = econ(pg, "return m.leapCost(a2)"); pg.evaluate(f"window.__dev.S.a2.wissen={c * 2}"); pg.wait_for_timeout(400)
    pg.evaluate("(()=>{window.__dev.A2.dev.doLeap()})()")
    wait_modal(pg, 'DAS ENDE DES ORDENS', 80); ok_modal(pg); wait_modal(pg, 'TRANSZENDENTE', 20); ok_modal(pg); pg.wait_for_timeout(800)
    ch = S(pg, 'chronik')
    check('echtes Finale: Universum 156, Chronik-Eintrag (Akt II), Dimension 1', S(pg, 'universe') == 156 and S(pg, 'a2.dim') == 1 and len(ch) == 2 and ch[0].get('akt') is None and ch[-1]['akt'] == 2 and ch[-1]['u'] == 155, f"u={S(pg,'universe')} Einträge={len(ch)}")
    pg.evaluate("window.__dev.openChronik()"); pg.wait_for_timeout(400)
    ct = pg.inner_text('#modalCard')
    check('Chronik zeigt Akt II', 'Akt II: Der Orden' in ct and 'Dimension: 1' in ct, ct[:80].replace('\n', ' '))
    ctx.close()
    b.close()
srv.terminate()
print('Konsolenfehler:', errors or 'keine')
print('FEHLGESCHLAGEN: ' + ', '.join(fails) if fails else 'Alle Tests bestanden')
sys.exit(1 if fails or errors else 0)
