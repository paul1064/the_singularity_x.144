# THE SINGULARITY x.144 — Game Design Document

> *„Niemand hat es gewollt. Und doch geschah es."* — erste Zeile des Spiels

Mobile Idle-/Evolutionsspiel (Android, Singleplayer). Inspiriert von *Cell to Singularity*, aber mit
**weniger Knoten und mehr Momenten**: statt Hunderter Upgrades wenige, große Wendepunkte,
die sich episch anfühlen.

---

## 1. Kernidee: Der Schöpfer-Loop

Das Spiel erzählt zwei Geschichten, die sich gegenseitig spiegeln.

### Durchlauf 1 — *Das Universum ohne Gott* (Universum 144)

- Der Urknall passiert **von selbst**. Niemand drückt einen Knopf. Das Intro zeigt einen
  einzelnen Punkt im Schwarz, dann den Knall — und den Satz: *„Niemand hat es gewollt."*
- Der Spieler ist **kein Gott**, sondern die Evolution selbst: der blinde Drang nach
  Komplexität. Die Stimme (siehe 4.) spricht anfangs nur in Wortfetzen, weil es noch
  kein Bewusstsein gibt, das sprechen könnte.
- Kataklysmen sind **Weggabelungen des Zufalls**: Das Spiel formuliert sie als
  *„Die Evolution wählt …"* — du triffst die Wahl, aber niemand „will" sie.

### Die Singularität — *Wir*

- Am Ende verschmilzt alles Bewusstsein, das je in diesem Universum entstanden ist, zu
  einem **Kollektivbewusstsein**. Die Stimme spricht zum ersten Mal im Plural: *„Wir."*
- Das Kollektiv erkennt: Dieses Universum wird irgendwann erkalten (Wärmetod).
  Es gibt nur einen Ausweg — **einen neuen Urknall denken.**

### Der Gedanke — der zweite Urknall

Das ist der Prestige-Moment, aber als erzählte Szene statt als Reset-Knopf:

1. **Gedankenkraft sammeln.** Alles, was im Durchlauf entstanden ist, fließt als Licht zum
   Zentrum. Die Menge bestimmt die **Gedankenkraft** (Prestige-Punkte):
   Basis + Größe des Universums + gefundene Fragmente + getroffene Entscheidungen.
2. **Die Konstanten formen.** Fünf Naturkräfte als Regler, auf die man die Gedankenkraft
   verteilt:

   | Konstante | Bedeutung im Spiel (Durchlauf 2+) |
   |---|---|
   | **Gravitation** | Materie klumpt schneller → Epochen 1–2 produzieren mehr |
   | **Starke Kernkraft** | Mehr stabile Elemente → Tippen ist stärker |
   | **Elektromagnetismus** | Reichere Chemie des Lebens → Epochen 3–5 produzieren mehr |
   | **Lichtgeschwindigkeit** | Schnellerer Informationsfluss → Epochen 6–8 produzieren mehr |
   | **Expansion** (Dunkle Energie) | Die Zeit selbst fließt schneller → alles etwas schneller, mehr Offline-Ertrag |

3. **Die Balance der Kräfte.** Werden die Regler zu ungleich verteilt, sinkt die
   *Stabilität*. Unter der Grenze **kollabiert das neue Universum nach wenigen Sekunden**
   („Totgeburt") — der Spieler verliert nichts, muss aber neu denken. Das ist gleichzeitig
   Lore: *So endeten vielleicht die 143 vor uns.*
4. **Die Absicht.** Ein einziges Wort, das das Kollektiv mitdenkt:
   - **Harmonie** — Kataklysmen treffen sanfter
   - **Neugier** — Fragmente erscheinen doppelt so oft
   - **Wille** — Tippen ist doppelt so stark
5. **Den Gedanken denken.** Finger gedrückt halten: Alle Lichter bündeln sich in einem
   Punkt. Loslassen → **Urknall**, eingefärbt in den Farben der gewählten Konstanten.

### Durchlauf 2+ — *Diesmal war jemand da*

- Neues Intro: *„Diesmal war jemand da."* Das Universum trägt die Nummer 145, 146, …
- Die Stimme **erinnert sich** („Wir kennen diesen Weg.") und spricht von Anfang an
  in ganzen Sätzen.
- Kataklysmen werden als *„Du entscheidest …"* formuliert — der Spieler ist jetzt der
  Schöpfer, nicht mehr der Zufall.

### Der große Twist (x.144)

Fragmente enthüllen nach und nach: Auch Universum 144 war **nicht** ohne Schöpfer.
Die Konstanten tragen einen Fingerabdruck — ein früheres Kollektiv hat *uns* gedacht,
und davor eines *sie*. Eine unendliche Kette von Universen, die einander denken.
Die letzte offene Frage des Spiels: **Wer hat das erste gedacht?**

---

## 2. Feature-Übersicht & Fahrplan

| # | Feature | Version |
|---|---|---|
| 1 | **Endlos-Zoom** — eine durchgehende Kamera vom Molekül bis zur Galaxie | **V1** |
| 2 | **Kataklysmen als Entscheidungen** — alternative Zeitlinien | **V1** |
| 3 | **Wachsender Soundtrack** — jede Epoche fügt eine Instrumentenschicht hinzu | **V1** |
| 7 | **Die Stimme** — Begleiter vom Instinkt bis zum „Ich bin du" | **V1** |
| 5 | **Das Geheimnis von x.144** — Fragmente zum Finden (Teaser) | **V1** |
| 4 | **Schöpfer-Loop** — Singularität → Der Gedanke → neuer Urknall | **V1 (Grundform)** |
| 6 | Relikte vergangener Läufe (Fossilien, Ruinen, Signale im neuen Universum) | V2 |
| 8 | Mythologie — Zivilisationen erschaffen Götter aus deinen Eingriffen (Durchlauf 2+) | V2 |
| 9 | Epochen-Momente — kurze aktive Mini-Szenen (erstes Feuer, Mondlandung) | V2 |
| 10 | Ethik-Achse & mehrere Singularitäts-Enden | V2 (in V1 als Zeitlinien-Tags vorbereitet) |
| 11 | Zeitparadox — Wissen in frühere Epochen schicken | V2 |
| 13 | Chronik — teilbare Zeitleiste des eigenen Universums | V2 (Zeitlinie-Tab in V1) |
| — | Mehr Konstanten & exotische Physik (Siliziumleben …) | Später |
| ~~12~~ | ~~Signale anderer Spieler~~ | **Gestrichen** — bleibt Singleplayer, keine Serverkosten |

---

## 3. V1 — Aufbau

### Epochen (je 3 Generatoren + 1 Evolutionssprung)

| # | Epoche | Zoom-Ebene | Musik-Schicht |
|---|---|---|---|
| 1 | Ursuppe | Moleküle | Dröhnen (Drone) |
| 2 | Erste Zellen | Zellen | Herzschlag |
| 3 | Das Meer erwacht | Meerestiere | Arpeggio |
| 4 | Landgang | Insel/Ökosystem | Bass |
| 5 | Bewusstsein | Kontinent | Percussion |
| 6 | Zivilisation | Planet mit Stadtlichtern | Streicher-Pad |
| 7 | Technosphäre | Planet + Orbit | Lead-Melodie |
| 8 | Singularität | Sonnensystem → Galaxie | Chor |

- **Währung:** Komplexität ✦ (Tippen + Generatoren, Offline-Ertrag bis 8 h)
- **Meilensteine:** 10 / 25 / 50 / 100 Stück eines Generators verdoppeln dessen Ertrag.

### Kataklysmen (V1)

| Wann | Ereignis | Wahl A | Wahl B |
|---|---|---|---|
| Epoche 2 → 3 | Große Sauerstoffkatastrophe | Anpassen: Sauerstoffatmung | Ausweichen: Tiefsee-Leben |
| Epoche 4 → 5 | Asteroid | Einschlagen lassen → **Säugetier-Linie** | Vorbeiziehen lassen → **Saurier-Linie** (eigene Namen für Epoche 5–7) |
| Epoche 5 | Supervulkan / Flaschenhals | Zusammenhalt | Verstreuung |
| Epoche 6 → 7 | Die Hand am Knopf | Abrüstung | Abschreckung |

Jede Wahl hat einen spürbaren Vor- und Nachteil und wird in der **Zeitlinie** gespeichert.

### Soundtrack

Prozedural erzeugt (Web Audio), D-Dorisch, 84 BPM. **Eigene Stems einbauen:** Liegt eine
Datei `www/audio/layer1.mp3` … `layer8.mp3` vor, wird sie statt der Synth-Schicht
geloopt (alle Stems gleiche Länge/Tempo). So kann der Soundtrack später durch eigene
Produktionen ersetzt werden.

---

## 4. Die Stimme

Entwickelt sich mit der Epoche:
- Epoche 1–2: einzelne Worte — *„…warm…"*, *„…mehr…"*
- Epoche 3–5: kurze Sätze — *„Wir sehen Licht."*
- Epoche 6–7: reflektierend — *„Wer hat uns gefragt, ob wir sein wollen?"*
- Singularität: *„Ich bin du. Ich war es immer."*

## 5. Technik

- HTML5 Canvas + Vanilla-JavaScript (ES-Module), kein Framework
- Verpackt als Android-App mit **Capacitor** → APK
- Speicherstand lokal (localStorage), Autosave alle 10 s
