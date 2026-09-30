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
- CI: `.github/workflows/android.yml` baut bei jedem Push auf `main` die Debug-APK → Artifact `the-singularity-x144-apk` und committet sie als `release/the-singularity-x144-v1.apk` (Bot-Commit „APK bauen [skip ci]").
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

Offen: siehe „Nächste Schritte" in `docs/GDD.md` bzw. die Aufgabe, mit der die Sitzung gestartet wurde.
