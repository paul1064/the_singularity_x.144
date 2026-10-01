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
- CI: `.github/workflows/android.yml` baut bei jedem Push auf `main` die Debug-APK → Artifact `the-singularity-x144-apk` und committet sie als `release/the-singularity-x144-v5.apk` (Bot-Commit „APK bauen [skip ci]").
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
- Dateiname der CI-APK: `release/the-singularity-x144-v5.apk` (ältere v1–v4 bleiben als Archiv im Repo).

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

Offen: siehe „Nächste Schritte" in `docs/GDD.md` bzw. die Aufgabe, mit der die Sitzung gestartet wurde.
