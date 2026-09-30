# the_singularity_x.144

> *„Niemand hat es gewollt. Und doch geschah es."*

Ein Evolutions-Idle-Game für Android: vom Molekül bis zur Singularität, und dann denkt das
Kollektivbewusstsein den nächsten Urknall.

- **Design:** [`docs/GDD.md`](docs/GDD.md)
- **Spiel:** `www/` (HTML5 Canvas + JavaScript)

## Im Browser spielen

```bash
cd www
python3 -m http.server 8144
# http://localhost:8144 öffnen (Handy-Ansicht im Browser empfohlen)
```

## Eigene Musik einbauen

Stems als `www/audio/layer1.mp3` … `layer8.mp3` ablegen (gleiches Tempo, gleiche Länge,
nahtlos loopbar) und die Nummern in `www/audio/stems.json` eintragen.
