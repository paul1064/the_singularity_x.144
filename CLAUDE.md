# CLAUDE.md — The Singularity x.144

Mobiles Evolutions-Idle-Game (Android, Singleplayer), inspiriert von *Cell to Singularity*,
aber mit weniger Knoten und mehr epischen Momenten. Vollständiges Design: `docs/GDD.md`.

## Sprache
- Kommunikation mit Paul (Projektinhaber) und alle Texte im Spiel: **Deutsch**.
- Code-Kommentare: Deutsch (wie im bestehenden Code).

## Technik
- HTML5 Canvas + Vanilla-JavaScript (ES-Module), **kein Framework, kein Bundler**. Alles liegt in `www/`.
- Android-APK via **Capacitor 7** (`capacitor.config.json`, Projekt in `android/`, App-ID `com.paul1064.singularity144`).
- Offline-fähig: keine CDNs, Schriften liegen in `www/fonts/`.
- Speicherstand: `localStorage` Schlüssel `singularity-x144`.

## Struktur
| Datei | Inhalt |
|---|---|
| `www/js/data.js` | Alle Inhalte: Epochen, Generatoren, Sprünge, Kataklysmen, Stimme, Fragmente, Konstanten, Absichten |
| `www/js/economy.js` | Reine Ökonomie-Funktionen (Kosten, Produktion, Multiplikatoren, Gedankenkraft, Stabilität). Auch in Node testbar. |
| `www/js/render.js` | `World`: Endlos-Zoom über 8 verschachtelte Ebenen (Ebene k mit Maßstab 10^(k−z)), Partikel, Glitch, Urknall-Animation |
| `www/js/audio.js` | `Soundtrack`: prozedurale Musik, 8 Schichten (eine pro Epoche), SFX, optionale eigene Stems über `www/audio/stems.json` |
| `www/js/main.js` | Spielablauf, UI, Eingabe (Tippen, Pinch-Zoom), Kataklysmen, Stimme, Fragmente, Finale „Der Gedanke", Speichern/Offline |
| `www/js/format.js` | Deutsches Zahlenformat (Tsd, Mio, Mrd …) |
| `tools/simulate.mjs` | Balance-Simulator: `node tools/simulate.mjs` |

## Testen
- Lokal: `cd www && python3 -m http.server 8144` → `http://localhost:8144/?dev`
- Mit `?dev` gibt es `window.__dev` (`give(n)`, `leapNow()`, `buyAll(n)`, `glitch()`, `S`, `world`).
- Playwright (Python) mit Viewport 390×844, `is_mobile`, `has_touch` für Screenshots.
- Achtung beim Testen: Das Spiel speichert bei `pagehide`. Startzustände per `context.add_init_script` setzen, nicht per `localStorage.setItem` + `reload`.

## Balance (aktuell)
- Durchlauf 1 ≈ 68 min bei optimalem Spiel mit 2 Taps/s, Durchlauf 2 ≈ 30 min.
- Stellschrauben in `TUNING` (economy.js). Nach Änderungen Simulator laufen lassen.

## Android-Build
- Lokal: `npm ci && npx cap sync android && cd android && ./gradlew assembleDebug` (braucht Android SDK 35, JDK 21).
- CI: `.github/workflows/android.yml` baut bei jedem Push auf `main` die Debug-APK → Artifact `the-singularity-x144-apk` und committet sie als `release/the-singularity-x144-v7.apk` (Bot-Commit „APK bauen [skip ci]").
- Nach Änderungen an `www/` immer `npx cap sync android`. Icon/Splash: `python3 tools/make-assets.py && npx capacitor-assets generate --android`.
- Zurück-Taste (in `main.js`): schließt offenes Fenster, sonst speichern + App minimieren.
- Screenshots: `python3 tools/screens.py <ordner>` (Ergebnisse in `docs/screens/`).
- In der Cloud-Sitzung sind `dl.google.com` (Android SDK) und teils Maven Central gesperrt → APK dort nur über GitHub Actions.

## Status
Fertig (V1-Kern, im Browser getestet, ganzer Loop läuft fehlerfrei):
- Endlos-Zoom (8 Ebenen), Zoom-Leiste rechts, Pinch/Wheel-Zoom
- 4 Kataklysmen mit Entscheidungen (inkl. Saurier-Zeitlinie mit eigenen Namen), Zeitlinien-Tab
- Wachsender prozeduraler Soundtrack + Stem-Unterstützung
- Die Stimme (Durchlauf 1 fragmentarisch → Singularität „Ich bin du"; Durchlauf 2 erinnert sich)
- x.144-Fragmente (Glitch ✧ antippen), Fragmente-Tab
- Finale: Singularität → „Der Gedanke" (Konstanten verteilen, Balance/Stabilität, Absicht, Halten) → Urknall → Universum 145 als Schöpfer; Totgeburt bei zu ungleicher Verteilung
- Offline-Ertrag, Autosave, Einstellungen (Musik/SFX/Vibration/Reset)

### V2.0 (Teil 1)
- **Multi-Touch:** bis zu 5 Finger, jeder = voller Tipp. Pinch-Zoom erst ab 18 px Fingerbewegung (`PINCH_MIN`).
- **Resonanz:** schnelles Tippen lädt einen Tipp-Multiplikator (bis ×2) auf, Anzeige im HUD. `TUNING.resGain/resDecay`.
- **Mutationen:** leuchtender Helix-Glimmer in der Welt (erste nach ~18 s, dann alle 40–80 s), Schub (Produktion ×4) / Raserei (Tippen ×6) / Ernte (Sofortertrag). Definition in `MUTATIONS`.
- **Merkmale:** Draft „1 aus 3" bei jedem Evolutionssprung (vor dem Kataklysmus), 10 Merkmale in `TRAITS`, gelten für den Durchlauf, Anzeige in der Zeitlinie. Wirkung in `economy.js` (`hasTrait`).
- Test: `python3 tools/test_v2.py <ordner>` (Multi-Touch per CDP, Pinch, Resonanz, Mutationen, Draft).
- Fester Debug-Schlüssel `android/app/debug.keystore` (im Repo), damit APKs über ältere drüberinstalliert werden können (ab V2; V1-APK war anders signiert → einmal deinstallieren).
- **Entscheidung In-App-Käufe:** bewusst noch nicht. Erst Spielgefühl/Features fertigstellen. Später nötig: Play-Console-Konto (25 $), signierte Release-APK/AAB, Billing-Plugin (z. B. RevenueCat/cordova-plugin-purchase). Konzept: nur Komfort/Kosmetik (Werbefrei-Äquivalent, Soundtrack-/Farbthemen), kein Pay-to-win bei den Universum-Konstanten.

### V2.0 (Teil 2): Avatare
- Ab Epoche 2 erwacht je Epoche ein **Avatar**, sobald `AVATAR_NEED` (25) Generatoren dieser Epoche gekauft sind. Der Spieler wählt 1 von 2 **Wegen** (z. B. Mutterzelle / Gottzelle, Erleuchteter / Heiler, Synthetiker / Architektin). Bewusst **Archetypen statt realer Religionsstifter** (Play-Store-Richtlinien, Feingefühl).
- Jeder Weg = **Aura** (dauerhafter Multiplikator: prod/tap/cost/mut/offline/frag/leap/cata) + **Kraft** (aktiv, Abklingzeit 160–380 s; Effekte: burst/gain/mutation/fragment). Alles datengetrieben in `AVATARS` (data.js), Logik in `economy.js` (`auraMult`) und `main.js` (Dock, `firePower`).
- Dock mit leuchtenden Kreisen unter dem HUD, Abklingzeit als Kreissegment; Avatare pro Durchlauf (wie Merkmale), in der Zeitlinie gelistet.
- Balance (ideal gespielt, ohne Mutationen/Merkmale): `node tools/simulate.mjs --avatare` → ca. 37–45 min statt 68 min (`WEG=1` für die jeweils 2. Wege). Stellschrauben: Auren, `cd`, Burst-Werte in `AVATARS`.
- Test: `python3 tools/test_avatare.py <ordner>`.

### V3.0: Das Erbe (Teil 1)
- **Button-Eingabe über `onTap` (pointerup)** statt `click`: Android erzeugt kein `click`, solange andere Finger gedrückt sind. So lassen sich Upgrades kaufen, während drei Finger weiter die Welt antippen. Wischen (>14 px oder `pointercancel`) kauft nichts.
- **Vermächtnis & Relikte:** Beim Urknall werden die gewählten Avatare in `S.legacy` (bleibt über Durchläufe) gespeichert. Im neuen Universum liegt jeder je gewählte Avatar (je `id` einmal) als **Relikt** in seiner Epoche: bernsteinfarbene Raute, nur auf der passenden Zoom-Ebene sichtbar/antippbar (Rail-Punkt pulsiert amber). Einsammeln → Lore-Fenster (`RELIC_TEXT`) + **Echo** = halbe Aura-Wirkung für den Durchlauf (`auraMult`). Anreiz: pro Durchlauf andere Avatare wählen, Relikt-Sammlung erweitern.
- Test: `python3 tools/test_erbe.py <ordner>` (Kauf bei gehaltenen Fingern per CDP, Relikte, Echo, Vermächtnis). Hinweis CDP: `touchEnd` beendet nur die genannten Finger, `[]` beendet alle.
- Dateiname der CI-APK: `release/the-singularity-x144-v7.apk` (ältere v1–v6 bleiben als Archiv im Repo).

### V3.1: Story & Abwechslung
- **Briefe der Vorgänger** (`LETTERS`, 10 Stück, Universum 143 → 1): ab Durchlauf 2 kommt beim Eintritt in Landgang (Epoche 4) und Technosphäre (Epoche 7) je ein Brief, der Reihe nach (`S.letters`, bleibt über Durchläufe). Einige haben Antworten (`ethik` ±1, bleibt). Der 10. Brief („Ich", Universum 1) hat je nach Ethik eine andere Schlusspassage und schließt den Bogen („Ich bin du. Ich war es immer."). Archiv im Fragmente-Tab.
- **Kosmische Gesetze** (`LAWS`, 8 Stück): ab Durchlauf 2 bekommt jedes Universum zufällig eines (nicht dasselbe wie zuvor), Ankündigung per Fenster, Anzeige in der Zeitlinie. Wirkung über `lawFx(state)` in `economy.js` (prod/tap/cost/leap/cata/offline/mutFreq/epochs).
- **Epochen-Momente** (`MOMENTS`): beim Eintritt in Epoche 2, 4, 6, 7, 8 startet eine kurze Szene im Vollbild (Panel blendet aus): *collect* (Funken fangen, ggf. beweglich) oder *hold* (n Finger gleichzeitig auf Ringen halten – höchstens 3, kompakte Ringe, damit es mit einer Hand geht). Belohnung: Sofortertrag + Buff; Verpassen gibt nur Trost. Logik `startMoment/updateMoment/endMoment` (main.js), Darstellung/Treffer `World.startMoment/hitMoment/_updateMoment` (render.js).
- **Entropie:** `TUNING.entropy` (0,5): Sprungkosten +50 % je abgeschlossenem Durchlauf, bremst späte Läufe etwas.
- **Story-Warteschlange** `checkQueue()`: Gesetz → Brief → Moment → Avatar, nie gleichzeitig mit Merkmal/Kataklysmus/Fenster.
- Test: `python3 tools/test_story.py <ordner>`. Alle Test-Zustände setzen `moments:[1..7]`, `letters:10`, `pendingLaw:false`, damit nichts dazwischenfunkt.

### V4.0: Mythologie, Enden, Zeitparadox, Chronik
- **Eingriffe** (`S.acts`: kraft = Avatar-Kräfte/Zeitparadox-Sendungen, mutation = eingesammelte Mutationen, moment = gewonnene Momente) bestimmen `E.dominantAct` → kraft | funke | stille (unter 4 Eingriffe).
- **Mythologie** (`MYTHS`, `DOGMAS`): ab Durchlauf 2 entsteht beim Eintritt in Epoche 4/5/6 ein Mythos, dessen Text von der dominanten Eingriffsart abhängt; der Spieler wählt 1 von 2 **Dogmen** (Aura-Bonus, auch `cd` = schnellere Avatar-Abklingzeit). Der Gott kommt ins **Pantheon** (`S.pantheon`, bleibt über Universen, +2 % Produktion je Gott, max. 10). Queue-Reihenfolge: Gesetz → Brief → Moment → Mythos → Avatar.
- **Enden** (`ENDINGS`, `E.endingOf`): 6 Stück aus Ethik (Brief-Antworten) × Eingriffsart; alle 10 Briefe gelesen → *Der Erste Gedanke*. Beim Erreichen der Singularität zeigt `showEnding` die Ende-Szene (vor „Der Gedanke"); jedes neue Ende gibt ein **Siegel** (`S.endings`, bleibt, +3 % Produktion je Siegel).
- **Zeitparadox** (`sendKnowledge`, `ripParadox`): ab Epoche 4 Karte im Evolution-Tab. Sendung in frühere Epoche: Kosten 10 % der ✦, diese Epoche +100 % je Sendung (max. 3), global +4 % je Sendung, Paradox +25; über 100 % reißt die Zeit (Sendungen weg, −40 % ✦). Abbau 0,4/s. Werte in `TUNING`.
- **Chronik** (`S.chronik`, bleibt): pro abgeschlossenem Universum ein Eintrag (Gesetz, Ende, Avatare, Mythen, Dauer …). Ansicht/Teilen über Zeitlinie-Tab oder Einstellungen; Teilen über `@capacitor/share` (Android-Teilen-Menü), Fallback `navigator.share`/Zwischenablage.
- Finale-Moment „Der Gedanke formt sich": nur noch **3 Finger** (Ringe kompakt, großzügige Trefferzone).
- Test: `python3 tools/test_v4.py <ordner>` (dauert ~1 min wegen der Schlusszeilen vor der Ende-Szene). Hinweis: `__dev.leapNow()` im Finale nicht awaiten (Promise endet erst nach Klick auf „Den Gedanken denken").

### V5.0: AKT II — Der Orden (ab Universum 155)
Ein neues Spiel im Spiel: Der Spieler steuert einen Geheimbund (die „Illuminaten", ausdrücklich als erfundene Geschichte gekennzeichnet) auf der Erde und vermehrt das Wissen der Menschheit.
- **Auslöser:** `bigBang` setzt ab Universum 155 `S.akt = 2`. Zustand in `S.a2` (siehe `newA2` in `akt2econ.js`). Vorschau jederzeit über Einstellungen → „Akt II: Der Orden (Vorschau)" (`a2.preview`, Rückweg „Zurück zu Akt I", rührt Universumsnummer und Chronik von Akt I nicht an).
- **Dateien:** `mystik.js` (reine Berechnung), `akt2data.js` (Inhalte), `akt2read.js` (Deutungstexte der Schicksalsebenen), `akt2econ.js` (reine Ökonomie), `akt2.js` (UI/Logik/Zeichnung, `createAkt2(ctx)`). main.js bindet es ein (`A2`, Schleife: `if (S.akt === 2 && A2.active)`).
- **Kern:** Baum des Lebens (10 Sephiroth + verborgenes Daath ab Dimension 1) ist Karte und Bedienung: Sephira antippen = kaufen, Leere antippen = Wissen sammeln (Mehrfinger bis 5). 22 Pfade (+6 verborgene) leuchten, wenn beide Enden ≥ 7 haben (+6 % je Pfad). Heilige Zahlen (3/7/12/22/33/72/144) verstärken je ×1,3. Acht Zeitalter (Atlantis → Informationszeit) mit Graden, je ein **Mentor** (Thoth, Hermes Trismegistos, Pythagoras, Hildegard, Paracelsus, Weishaupt, Tesla, Ada Lovelace: Aura + aktive Kraft + 3 „Lehren") und ein Weltereignis (Bewahren +1 / Offenbaren −1 → Ende „Hüter/Bote/Vermittler"). **Ritual „Die Sequenz"** (Merkspiel auf dem Baum). Gleichartige Schübe stapeln nicht (nur der stärkste zählt).
- **Schicksal:** Name + Geburtsdatum (+ optional Zeit) bleiben lokal. `mystik.analyse` rechnet **echt**: Sonne (±0,01°), Mond (±0,3°), Jupiter–Pluto (JPL-Elemente, ±1°), Lebens-/Namenszahlen (Pythagoras, Gematria), Human Design vereinfacht (Sonnen-Tor/Linie + Design-Sonne 88° vorher + Profil), Sonne–Mond-Aspekt, Geburtsphase, echte nächste Saturn-/Jupiterrückkehr, persönliches Jahr, Transite von heute. Pro Durchgang wird **eine von 7 Schicksalsebenen** enthüllt (`LAYER_TITLES`), jede mit Deutung, „Die Welt und du"-Absatz und spürbarem Spielbonus (`computeFx`). Zusätzlich echte **Himmelslage** (Mond/Sonne heute). Hinweis „Symbolsprache, keine Wissenschaft" steht überall dabei.
- **Transzendente Singularität:** Kether-Einweihung → Ende des Ordens → neue **Dimension** (9 Stück in `DIMENSIONS`, dauerhaft Produktion ×1,25 + Spezialeffekt, Daath, neue heilige Geometrie im Hintergrund) → neuer Durchgang (Universum +1), Ebenen und Profil bleiben.
- **Balance** (`node tools/simulate_akt2.mjs`, ideal gespielt): Durchgang 1 ≈ 44 min, 7 ≈ 30 min, Dimension 1 ≈ 32, Dim 3 ≈ 26, Dim 6 ≈ 13 min. Stellschrauben: `T2` in `akt2econ.js` (costTier/prodTier/leapTier/msMult/leapRun) und `(1 + 0.8·dim)` in `leapCost`.
- **Tests:** `node tools/test_mystik.mjs` (Referenzwerte: Meeus, Äquinoktien, echte Planeten-Zeichenwechsel 2024/25), `python3 tools/test_akt2.py <ordner>` (~2 min, 50 Prüfungen inkl. Mehrfinger, Ritual, Finale, Neustart, Übergang 155).

### V6.0: Sicherung, Orakel, Klang
- **Spielstand sichern** (`sicherung.js` rein + UI in `main.js`, Einstellungen → „Spielstand sichern"): Export als JSON-Datei über `@capacitor/filesystem` (CACHE) + `@capacitor/share` (Android-Teilen-Menü; im Browser Download, Fallback Code in die Zwischenablage), alternativ „Code kopieren" (`SX144:` + Base64). Format enthält Prüfsumme (FNV) und `info`. **Einspielen**: Datei oder Code → Prüfung (`parseBackup`: Spiel, Format, Prüfsumme, Universum ≥ 144) → Vorschau Sicherung vs. aktuell → laden; vorher automatischer Schnappschuss. `restoring`-Flag verhindert, dass `save()` den eingespielten Stand beim Neuladen überschreibt. **Schnappschüsse**: die letzten 3 in `localStorage['singularity-x144-snap']`, höchstens einer pro 20 h beim Start. **Erinnerung**: wenn letzte Sicherung ≥ 7 Tage her (oder nie) und seit ≥ 3 Tagen nicht gefragt, 6 s nach Spielstart ein „Später"-Fenster (`S.lastBackup`, `S.backupAsked`).
- **Tagesorakel** (`akt2orakel.js`, Dock-Knopf „O", Schicksal-Tab): täglich eine persönliche Karte (FNV aus Datum+Name+Geburtsdatum → einer der 22 Pfade) mit Deutung, Frage des Tages und echter Himmelslage. Heutiger Pfad leuchtet violett im Baum und zählt doppelt (dunkel) bzw. einmal zusätzlich (an), siehe `pathUnits` in `akt2econ.js`. Jeder gezogene Tag gibt dauerhaft +0,5 % Produktion (max. 50 Tage), kein Streak-Zwang (`orakelTage` zählt nur, verfällt nie). Neuer Tag erkannt in `frame`.
- **Himmelskalender** (`mystik.kalender`, echte Astronomie per Newton-Iteration): Neu-/Vollmonde, Sonnwenden/Tagundnachtgleichen, Zwischenfeste (Walpurgis, Lichtmess …), Sonnenwiederkehr (Geburtstag, einmalige Gratulation). Am echten Tag wirken sie: Sonnenfest Prod ×1,3, Halbfest Prod ×1,15 und Kosten −5 %, Neumond Ritual ×1,5, Vollmond Tippen ×1,5, Wiederkehr Prod ×1,5 (`FEST_INFO`, lila Chips im HUD). Liste der nächsten 8 Ereignisse im Schicksal-Tab.
- **Klang für Akt II** (`akt2audio.js`, `OrdenKlang`): pythagoreische Stimmung (D3, Quinten), jede Sephira ein Ton, Daath = Septime 7:4. Drone + eine leise Stimme je Sephira (wächst mit Besitz), Melodie wandert über leuchtende Pfade; Effekte für Kauf, Tippen, Pfad, Ritual (Tritonus bei Fehlschlag), Sprung, Finale, Orakel. Akt-I-Schichten schweigen im Orden (`setLevel(0)`).
- **Geburtsort** (`orte.js`, Einweihung / „Meine Daten ändern"): ~110 Orte offline (Name, Land, Breite, Länge, IANA-Zeitzone) mit Autovervollständigung, alternativ eigene Koordinaten + Zeitzone. `mystik.localToDate` rechnet die Geburtszeit mit der damals gültigen Ortszeit (inkl. Sommerzeit, über `Intl`) in den exakten Zeitpunkt um; `ascMc` liefert Aszendent und Himmelsmitte (Test: Einstein, Ulm 1879 → 11°39' Krebs wie in der Astro-Datenbank), `analyse().hori` zusätzlich Häuser gleicher Zeichen für Sonne/Mond. Anzeige in Schicksalsebene „Dein Himmel". Ohne Ort wird wie bisher in der Gerätezeitzone gerechnet; Hinweis im Schicksal-Tab.
- Tests: `node tools/test_sicherung_rein.mjs`, `python3 tools/test_sicherung.py <ordner>`, `python3 tools/test_v6.py <ordner>` (Orakel, Kalender, Klang mit Analyser), `node tools/test_mystik.mjs` (jetzt auch Kalender gegen echte 2026er Daten). Browser-Tests mit Klang brauchen `--autoplay-policy=no-user-gesture-required`.

### V6.1: Epische Momente
- **Rückblick-Film** (`kosmos.js` `buildFilm`, `playFilm` in `main.js`): Nach dem Urknall-Blitz (nur bei gelungenem Universum) läuft das endende Universum als ~23-s-Zeitraffer: Startszene, je Epoche eine Szene in ihrer Farbe (Sprungname, erwachter Avatar, entstandener Mythos), Schlussszene mit Ende, Gesetz, Berührungen und Spielzeit („Und dann dachte jemand einen neuen Anfang."). Antippen überspringt. Nur Akt I (Akt II hat sein eigenes Finale).
- **Kosmische Ereignisse** (`COSMOS`: Komet ab Epoche 1, Sonnensturm ab 3, Supernova ab 5): erstes nach 150–240 s Spielzeit, danach alle 300–480 s, nie zusammen mit Fenster/Moment/Kataklysmus. 12 s Entscheidung in einer Leiste unten (Panel blendet aus), Wackeln und Herzschlag-Vibration steigen mit der Zeit. **Abwehren** (sicher, kleiner Ertrag, zählt als Kraft), **Umlenken** (60 % großer Ertrag + Produktion ×2 für 45 s, sonst −6 % Komplexität; zählt als Kraft), **Nutzen** (Tippen ×3 für 40 s + Ertrag, zählt als Funke). Verstreichen lassen kostet nichts. Eintrag in der Zeitleiste; die Eingriffe beeinflussen Mythen und Enden. Im `?dev`-Modus laufen sie nicht zufällig (nur mit `&cosmos`), `__dev.startCosmic(id)`.
- **Haptik:** Tippen wird mit jeder Epoche schwerer (4 → 18 ms), Evolutionssprung als Crescendo mit mehr Impulsen und stärkerem Wackeln je Epoche (`tapHaptik/leapHaptik/leapShake`), Film und Ereignisse mit eigenen Mustern. Alles hängt am Vibrationsschalter.
- Tests: `node tools/test_kosmos.mjs`, `python3 tools/test_v61.py <ordner>`. `test_erbe.py` ist seit V6.2 deterministisch (zweites Relikt wird vor dem Tippen weggeschoben).

### V6.2: Die Entropie & Boss-Momente
- **Die Entropie** (`entropie.js` rein, Logik in `main.js`, Optik in `render.js`): Gegenspieler in Akt I ab Durchlauf 4 (`ENT.fromRun` = 3 abgeschlossene, Universum 147). `S.entropy` (0–100 %) steigt von selbst (`entRate`: 0,05 %/s in der Ursuppe, bis ≈ 0,3 %/s in der Singularität, wächst mit Epoche und Durchlauf) und frisst ab 30 % Produktion (bei 100 % −40 %, `entMult` in `prodPerSec`). Einmalige Einführung (`S.entIntro`, bleibt). Leiste im HUD unter der Resonanz.
- **Ordnung drängt sie zurück** (`RELIEF`): Tippen −0,04, Kaufen −0,3, Mutation −5, Fragment −3, Avatar-Kraft −8, Moment −10, kosmisches Ereignis −10 (Nutzen −3), Riss −6, Relikt −4, Evolutionssprung −15. Ein Spieler mit 4 Taps/s hält sie in Epoche 3 stabil, mit 2 Taps/s verliert er in späten Epochen langsam. Offline wächst sie nur zu 20 % und höchstens bis 50 %.
- **Optik/Klang:** Welt bleicht aus (CSS-Filter saturate/brightness auf `#world`), dunkle Ränder und kriechende Ranken (`World._drawEntropy`), Musik wird dumpf (`Soundtrack.setEntropy`, Tiefpass). Stufen 25/50/75 % mit Stimme, Wackeln, Vibration und Zeitleisten-Eintrag.
- **Risse** ab 50 %: alle 14–22 s (ab 75 % 8–13 s) bis zu 3 antippbare Risse; jeder offene erhöht den Anstieg (+0,05 %/s), Antippen versiegelt (−6 %).
- **Boss-Kämpfe** (`BOSSES`, `runBoss/endBoss`, `World.startBoss/_hitBoss/_updateBoss/_drawBoss`): Vor den Evolutionssprüngen aus Epoche 2/4/6/7 stellt sich je ein Boss in den Weg (Der Zerfall, Die Große Stille, Der Letzte Winter, Die Entropie; einmal pro Durchlauf), bei 100 % bricht sie als „Der Kollaps" durch. Tippen überall = 1 Schaden, weiße Schwachpunkte = 10, ein verpasster Schwachpunkt heilt den Boss um 6. Boss-HP wächst mit der Entropie beim Start (bis +50 %). Sieg: Entropie 8 %, 120 s Produktion, Produktion ×2 für 60 s, dauerhaft +1,5 % je Sieg (`S.bossWins`, bleibt, max 20). Niederlage bei Sprung-Boss: Sprung läuft trotzdem, Entropie +25 %; beim Kollaps −20 % Komplexität, Entropie 60 %. Kein Softlock möglich.
- Test-Schalter: Im `?dev`-Modus ist die Entropie aus (nur mit `&ent`), kosmische Ereignisse nur mit `&cosmos`. `__dev.EN`, `__dev.runBoss(key)`, `__dev.world`.
- Tests: `node tools/test_entropie.mjs`, `python3 tools/test_v62.py <ordner>` (~1,5 min: Einführung, Anstieg, Entlastung, Stufen, Risse, Boss-Sieg/-Niederlage, Kollaps). Stellschrauben: `ENT`, `RELIEF`, `BOSSES` (hp/dur/weakEvery) in `entropie.js`.

### V6.3: Das Vermächtnis (Prestige-Baum)
- **Erbe-Punkte** (`erbe.js` rein; `S.erbeVP` frei, `S.erbeTotal` insgesamt, `S.erbeNodes` erworben, alles bleibt über Universen): Jedes in Akt I vollendete Universum gibt beim Urknall `gain(S)` = 2 + Avatare (max 4) + Mythen (max 3) + 3 für ein neues Ende (`S.runNewEnding`) + 2 je besiegtem Boss (`S.runBossWins`). Fenster „Das Vermächtnis" mit den Quellen (`S.pendingErbe`, erscheint, sobald kein Fenster/Moment läuft). Einmalig rückwirkend: 6 Erbe je bereits abgeschlossenem Universum (max 60, `S.erbeRetro`). Akt II gibt (noch) kein Erbe.
- **Baum** (Reiter „Erbe", erscheint ab dem ersten abgeschlossenen Universum, Aufbau in `renderErbe`): 3 Äste × 4 Stufen + Schlussstein, Gesamtkosten 109 (3/5/8/12 je Ast, Schlussstein 25). Voraussetzung: vorige Stufe, der Schlussstein braucht Stufe 3 aller Äste. **Schöpfer** (Wachstum): Produktion +10 %, Sprungkosten −8 %, Offline +30 %, Produktion +25 %. **Bewahrer** (Ordnung): Entropie −15 %, Tippen drängt Entropie 50 % stärker zurück, Entropie-Strafe halbiert und Risse seltener, Boss −20 % Leben und Schwachpunkte +0,6 s. **Zerstörer** (Wandel): Mutationen +25 % häufiger, Erträge (Mutation/Moment/Ereignis) +50 %, Umlenken +15 % Chance und Tippen +20 %, Tippen +50 %. **Schlussstein „Der Gedanke vor dem Gedanken"**: Produktion ×1,5, Entropie −20 %, Erträge +25 %. Alles ist jederzeit **kostenlos neu verteilbar** („Entscheidung statt Strafe").
- Wirkung über `erbeFx(S)` (gecacht), eingehängt in `prodPerSec`, `tapMult`, `leapCost`, `mutationInterval`, `offlineEfficiency` (economy.js), `entRate/entMult/relief/bossHP` (entropie.js), `cosmosOutcome(…, bonus)` (kosmos.js), Boss-Schwachpunkte (`weakBonus` in render.js) und Risse/Erträge in main.js. Mit allen Knoten ist ein Universum deutlich schneller (Produktion ≈ ×2,1 plus Sprungrabatt); Entropie und Bosse bleiben der Gegenpol.
- Im `?dev`-Modus erscheint das Erbe-Fenster nur mit `&erbe`. `__dev.ER`, `__dev.renderErbe`.
- Tests: `node tools/test_vermaechtnis.mjs`, `python3 tools/test_v63.py <ordner>`. Stellschrauben: `NODES` (cost/fx) und `gain` in `erbe.js`.

### V6.4: Das Museum der Universen
- **Museum** (`museum.js` rein, Oberfläche in `main.js` `renderMuseum`, im Reiter „Erbe" über den Umschalter „Vermächtnis | Museum"): 8 Vitrinen mit 75 Funden: Splitter von x.144 (12 Fragmente), Briefe der Vorgänger (10), Relikte (14 Avatar-Wege), Enden (6), Götter und Mythen (9), Kosmische Gesetze (8), Himmel und Gegner (3 kosmische Ereignisse + 5 Bosse), Momente und Mutationen (5 + 3). Unentdeckt: „???" mit Hinweis, wie man es findet; entdeckt: Lore-Fenster (bestehende Texte, für Gesetze/Ereignisse/Bosse/Mutationen eigene Zeilen), mit „gefunden in Universum N".
- **Funde:** Fragmente, Briefe, Relikte, Enden und Götter leiten sich aus bestehenden persistenten Daten ab (daher sofort rückwirkend). Neu vermerkt wird in `S.museum.ids` (bleibt über Universen): `law:`, `cos:`, `boss:` (nur Siege), `mom:` (nur gewonnene Momente), `mut:` über `museumFund(id)` (Gleitzeile „Museum: …"). Nicht rückwirkend: Ereignisse, Bosse, Momente, Mutationen aus früheren Universen.
- **Boni** (`museumFx`, in `erbeFx` eingemischt, stapelt sich mit dem Erbe-Baum): je Vitrine bei 50 % Stufe 1, bei 100 % Stufe 2: Splitter Tippen +10 %/+10 %, Briefe Offline +15 % / dazu Entropie −10 %, Relikte Produktion +5 %/+10 %, Enden Erträge +15 %/+20 %, Götter Produktion +5 % / Sprungkosten −5 %, Gesetze Mutationen +10 %/+15 %, Himmel Entropie-Strafe −10 % / Boss −10 % und Schwachpunkte +0,3 s, Momente Erträge +10 % / Umlenken +10 % und Tippen +10 %. Neue Schwellen werden gesammelt in einem Fenster gemeldet (`S.museum.seen`, Prüfung alle ~2 s, nur wenn kein Fenster/Moment läuft; im `?dev`-Modus nur mit `&erbe`).
- Tests: `node tools/test_museum.mjs`, `python3 tools/test_v64.py <ordner>`. Stellschrauben: `bonus` je Vitrine in `museum.js`.

### V7.0: AKT III — Das Spiegeluniversum
- **Auslöser:** Nach der 9. Dimension von Akt II (`a2.dim >= DIMENSIONS.length`, nicht im Vorschau-Modus) wendet sich das Bewusstsein um: `toAkt3` in `akt2.js` → `A3.enter()`, `S.akt = 3`. Vorschau jederzeit über Einstellungen → „Akt III: Das Spiegeluniversum (Vorschau)" (`a3.preview`, Rückweg „Zurück zu Akt I"). Zustand in `S.a3` (`newA3`), bleibt über Akt I/II.
- **Dateien:** `akt3data.js` (Spiegel, Kapitel, Briefsätze, Enden), `akt3econ.js` (reine Ökonomie), `akt3.js` (`createAkt3(ctx)`: UI, Canvas `#a3c`, Panel `#a3panel`), `akt3audio.js` (`SpiegelKlang`). main.js bindet es ein (`A3`, Schleife `if (S.akt === 3 && A3.active)`, Boot, Offline, Chronik `akt: 3`). `entActive` gilt nur in Akt I.
- **Kern:** 8 Spiegel im Ring, jeder spiegelt eine Vitrine des Museums (Splitter, Briefe, Relikte, Enden, Götter, Gesetze, Himmel, Augenblicke); Produktion je Spiegel ×(1 + 0,5 × Vitrinen-Fortschritt). Jeder Spiegel hat **Licht** (Erinnern) und **Schatten** (Loslassen), beides getrennt kaufbar (Spiegel antippen: linke Hälfte Licht, rechte Schatten; Mitte antippen = Erinnerung sammeln). **Gleichgewicht:** G = Licht-Anteil der Produktion, bal = 1 − |2G − 1|, Multiplikator 0,6 + bal. Ab bal ≥ 0,88 lädt sich der **Einklang** (+1,5 %/s, sonst −0,4 %/s, Produktion ×(1 + Einklang/100), bis ×2). **Verbindungen:** benachbarte Spiegel im Ring (auch 7–0) leuchten bei je ≥ 7 Einheiten und ≥ 3 je Seite zusammen, +6 % je Verbindung. Heilige Zahlen ×1,3 wie in Akt II. Kräfte im Dock: Erinnern (Tippen ×5, 15 s), Loslassen (150 s Produktion), Ausgleichen (kauft die beste Einheit auf der schwächeren Seite).
- **Spiegelsprünge** (8 Kapitel, Spiegel schaltet der Reihe nach frei; `T3.leapBase/leapTier` 130/14): Bei jedem Sprung schreibst du **einen Satz des Briefes an die, die nach dir kommen** (3 Töne: Licht +1 / Schatten −1 / Mitte 0). Das Spiegelbild (die Entropie) sagt je Kapitel eine Zeile. Die **Große Spiegelung** (Sprung 8, ×1,5 Kosten) braucht zusätzlich vollen Einklang.
- **Finale & Enden:** Brief wird vorgelesen („— Ich"), dann Ende nach Ton des Briefes: Das Licht, das bleibt / Der Schatten, der trägt / Der Gleichklang. **Das Wahre Ende „Ich bin du"**: nur mit ausgewogenem Brief (|Ton| ≤ 2) und vollständigen Museums-Vitrinen *Enden* und *Briefe*; enthüllt, dass alle zehn Briefe, die man bekommen hat, die eigene Handschrift trugen. Jedes neue Ende gibt ein dauerhaftes **Siegel** (+10 % Produktion in Akt III), Briefe werden in `a3.letters` archiviert (Reiter „Brief"), danach neuer Durchgang.
- **Bonus von außen:** Akt-II-Dimensionen +5 % je Stück, Siegel/Pantheon/Boss-Siege wie in Akt II (`extra()` in akt3.js).
- **Balance** (`node tools/simulate_akt3.mjs [Vitrinen 0–1] [Dimensionen] [Siegel]`, ideal gespielt): ohne Boni ≈ 50 min, typisch (Vitrinen 0,5, 9 Dimensionen) ≈ 28 min, mit allen Boni ≈ 18 min.
- **Tests:** `node tools/test_akt3_rein.mjs` (33 Prüfungen), `python3 tools/test_akt3.py <ordner>` (~2,5 min: Vorschau, Kauf, Gleichgewicht, Brief, Finale, Wahres Ende, Neustart, Übergang aus Akt II).

Offen: siehe „Nächste Schritte" in `docs/GDD.md` bzw. die Aufgabe, mit der die Sitzung gestartet wurde.
