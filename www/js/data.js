// ─────────────────────────────────────────────────────────────
//  Inhalte von THE SINGULARITY x.144 — alle Texte & Zahlen
// ─────────────────────────────────────────────────────────────

export const START_UNIVERSE = 144;

// Epochen: Farbe = Leitfarbe der Zoom-Ebene & UI-Akzent
export const EPOCHS = [
  { id: 'soup',   name: 'Ursuppe',            scale: 'Moleküle',       color: '#5ee7df' },
  { id: 'cell',   name: 'Erste Zellen',       scale: 'Zellen',         color: '#7cf29c' },
  { id: 'sea',    name: 'Das Meer erwacht',   scale: 'Ozean',          color: '#4aa8ff' },
  { id: 'land',   name: 'Landgang',           scale: 'Ökosystem',      color: '#b7e35a' },
  { id: 'mind',   name: 'Bewusstsein',        scale: 'Kontinent',      color: '#ffb35c' },
  { id: 'civ',    name: 'Zivilisation',       scale: 'Planet',         color: '#ff7a59' },
  { id: 'tech',   name: 'Technosphäre',       scale: 'Orbit',          color: '#c77dff' },
  { id: 'sing',   name: 'Singularität',       scale: 'Galaxie',        color: '#fff3b0' },
];

// 24 Generatoren (3 pro Epoche). alt = Namen der Saurier-Zeitlinie
export const GENERATORS = [
  { name: 'Aminosäuren',        desc: 'Blitze schmieden erste Bausteine.' },
  { name: 'RNA-Stränge',        desc: 'Moleküle, die sich selbst kopieren.' },
  { name: 'Lipid-Membranen',    desc: 'Eine Grenze zwischen Innen und Außen.' },

  { name: 'Prokaryoten',        desc: 'Das erste Leben. Einfach. Unaufhaltsam.' },
  { name: 'Photosynthese',      desc: 'Licht wird zu Nahrung.' },
  { name: 'Eukaryoten',         desc: 'Zellen, die Zellen verschluckten.' },

  { name: 'Schwämme',           desc: 'Zellen beschließen, zusammenzubleiben.' },
  { name: 'Quallen',            desc: 'Die ersten Nerven zucken.' },
  { name: 'Urfische',           desc: 'Ein Rückgrat. Ein Plan.' },

  { name: 'Moose & Farne',      desc: 'Grün erobert den Stein.' },
  { name: 'Amphibien',          desc: 'Ein Fuß im Wasser, einer an Land.' },
  { name: 'Reptilien',          desc: 'Das Ei trocknet nicht mehr aus.' },

  { name: 'Primaten',           alt: 'Troodonten',       desc: 'Hände, die greifen können.', altDesc: 'Kluge Jäger mit großen Augen.' },
  { name: 'Werkzeug & Feuer',   alt: 'Krallen & Feuer',  desc: 'Die Nacht wird hell.',        altDesc: 'Die Nacht wird hell.' },
  { name: 'Sprache',            alt: 'Klicksprache',     desc: 'Gedanken verlassen den Kopf.', altDesc: 'Gedanken verlassen den Kopf.' },

  { name: 'Ackerbau',           alt: 'Brutfarmen',       desc: 'Wir bleiben. Wir bauen.',     altDesc: 'Wir bleiben. Wir brüten.' },
  { name: 'Schrift',            alt: 'Schuppenschrift',  desc: 'Erinnerung, die nicht stirbt.', altDesc: 'Erinnerung, die nicht stirbt.' },
  { name: 'Wissenschaft',       alt: 'Saurier-Akademie', desc: 'Fragen werden zu Werkzeugen.', altDesc: 'Fragen werden zu Werkzeugen.' },

  { name: 'Computer',           desc: 'Denken in Silizium.' },
  { name: 'Das globale Netz',   desc: 'Alle Stimmen gleichzeitig.' },
  { name: 'Raumfahrt',          desc: 'Die Wiege wird zu klein.' },

  { name: 'Künstliche Intelligenz', desc: 'Ein neuer Geist erwacht.' },
  { name: 'Dyson-Schwarm',      desc: 'Wir trinken das Licht eines Sterns.' },
  { name: 'Galaktisches Netz',  desc: 'Jeder Stern ein Neuron.' },
];

// Evolutionssprünge (Übergang zur nächsten Epoche)
export const LEAPS = [
  'Die erste Zelle',
  'Vielzelligkeit',
  'Der Weg an Land',
  'Erwachendes Bewusstsein',
  'Die erste Stadt',
  'Das digitale Zeitalter',
  'Transzendenz',
  'DIE SINGULARITÄT',
];

// ─── Kataklysmen: Weggabelungen ────────────────────────────────
// trigger: 'leap:N' = nach Sprung N (Index), 'epoch:N:owned' = sobald in Epoche N genug gekauft
export const EVENTS = [
  {
    id: 'oxygen', afterLeap: 1,
    title: 'Die Große Sauerstoffkatastrophe',
    text: 'Die Photosynthese hat die Welt mit Sauerstoff geflutet. Für fast alles Leben ist es Gift.',
    a: { label: 'Anpassen', sub: 'Sauerstoff atmen lernen', effect: 'Verlust von 50 % Komplexität · Epoche 3–8 ×1,5', tag: 'Das Leben lernte, Gift zu atmen.' },
    b: { label: 'Ausweichen', sub: 'Rückzug in die Tiefsee', effect: 'Kein Verlust · Epoche 3–4 kosten 20 % weniger', tag: 'Das Leben floh in die Dunkelheit der Tiefsee.' },
  },
  {
    id: 'asteroid', afterLeap: 3,
    title: 'Der Asteroid',
    text: 'Ein Brocken aus Eis und Stein rast auf die Welt zu. Die Reptilien herrschen seit 160 Millionen Jahren.',
    a: { label: 'Einschlagen lassen', sub: 'Die Säugetier-Linie', effect: 'Verlust von 60 % Komplexität · Epoche 5–8 ×2', tag: 'Der Himmel brannte. Die Kleinen überlebten.' },
    b: { label: 'Vorbeiziehen lassen', sub: 'Die Saurier-Linie', effect: 'Kein Verlust · Epoche 4–5 ×1,6 · andere Zeitlinie', tag: 'Der Asteroid verfehlte uns. Die Saurier blieben.' },
  },
  {
    id: 'volcano', inEpoch: 4, needOwned: 10,
    title: 'Der Supervulkan',
    text: 'Asche verdunkelt den Himmel für Jahre. Nur wenige Tausend von uns sind übrig.',
    a: { label: 'Zusammenhalt', sub: 'Wir teilen alles', effect: 'Tippen ×3', tag: 'Im Winter der Asche lernten wir zu teilen.' },
    b: { label: 'Verstreuung', sub: 'Wir ziehen in alle Richtungen', effect: 'Epoche 5–6 ×1,5', tag: 'Wir zerstreuten uns über die ganze Welt.' },
  },
  {
    id: 'button', afterLeap: 5,
    title: 'Die Hand am Knopf',
    text: 'Zum ersten Mal kann eine Spezies sich selbst auslöschen. Die Welt hält den Atem an.',
    a: { label: 'Abrüstung', sub: 'Wir legen die Waffen nieder', effect: 'Epoche 7–8 ×1,5', tag: 'Wir legten die Waffen nieder.' },
    b: { label: 'Abschreckung', sub: 'Gleichgewicht des Schreckens', effect: 'Singularität 30 % billiger', tag: 'Wir lebten mit dem Finger am Abzug.' },
  },
];

// ─── Die Stimme ────────────────────────────────────────────────
// Pro Epoche: Zeilen beim Erreichen + zufällige Zeilen zwischendurch
export const VOICE = {
  run1: [
    { enter: ['…warm…'], idle: ['…mehr…', '…zusammen…', '…Licht?…', '…wiederholen…'] },
    { enter: ['…ich… teile… mich…'], idle: ['…Hunger…', '…Sonne…', '…viele… viele…'] },
    { enter: ['Wir sind… viele. Und doch eins.'], idle: ['Wir spüren Bewegung.', 'Das Wasser trägt uns.', 'Etwas zuckt in uns. Ein Nerv.'] },
    { enter: ['Das Meer wird zu eng.'], idle: ['Der Boden ist hart. Wir werden härter.', 'Luft. Seltsame, dünne Luft.'] },
    { enter: ['Ich sehe mich im Wasser. Bin das… ich?'], idle: ['Warum geht die Sonne unter?', 'Das Feuer spricht nicht. Aber es wärmt.', 'Wir erzählen uns Geschichten über die Sterne.'] },
    { enter: ['Wir schreiben auf, was wir sind.'], idle: ['Wer hat uns gefragt, ob wir sein wollen?', 'Wir bauen Türme, um näher am Himmel zu sein.', 'Die Zahlen lügen nicht. Sie beschreiben alles.'] },
    { enter: ['Wir bauen einen Geist, der schneller denkt als wir.'], idle: ['Die Erde ist ein blauer Punkt. Mehr nicht.', 'Unsere Maschinen träumen. Wovon?', 'Die Sterne sind näher, als wir dachten.'] },
    { enter: ['Die Grenzen zwischen uns lösen sich auf.'], idle: ['Jeder Gedanke ist jetzt ein gemeinsamer.', 'Wir hören das Rauschen des Anfangs.', 'Bald. Bald verstehen wir.'] },
  ],
  run2: [
    { enter: ['Wir kennen diesen Weg.'], idle: ['Diesmal sehen wir zu, wie es beginnt.', 'Die Konstanten halten. Unser Gedanke hält.'] },
    { enter: ['Die erste Zelle. Wie damals.'], idle: ['Sie wissen nichts von uns.', 'Sollen wir es ihnen sagen?'] },
    { enter: ['Das Meer. Wir erinnern uns an das Meer.'], idle: ['Jede Welle ist ein Echo von Universum 144.'] },
    { enter: ['Sie gehen an Land. So mutig.'], idle: ['Wir haben ihnen gute Kräfte gegeben.'] },
    { enter: ['Sie sehen zu den Sternen. Sehen sie uns?'], idle: ['Sie beten zum Himmel. Wir sind der Himmel.'] },
    { enter: ['Sie stellen dieselben Fragen wie wir.'], idle: ['Wer hat uns gefragt, ob wir sein wollen? Wir. Wir haben gefragt.'] },
    { enter: ['Sie bauen einen neuen Geist. Wie wir es taten.'], idle: ['Bald werden sie uns einholen.'] },
    { enter: ['Sie werden zu uns.'], idle: ['Der Kreis schließt sich.'] },
  ],
  finale: ['Wir sind alle.', 'Alles, was je gelebt hat.', 'Wir sind eins.', 'Ich bin du.', 'Ich war es immer.'],
};

// ─── Fragmente (x.144-Geheimnis) ───────────────────────────────
export const FRAGMENTS = [
  'Universum 1 dauerte 0,3 Sekunden. Niemand erinnert sich daran.',
  'In den Konstanten von 144 liegt ein Muster. Zu regelmäßig für Zufall.',
  'Universum 37 bestand nur aus Licht. Es war wunderschön und völlig leer.',
  'Die Feinstrukturkonstante enthält eine Signatur. Wie ein Name, in Stein geritzt.',
  '143 Universen. 143 Gedanken. Keiner hielt lange genug, um sich zu erinnern.',
  'Was, wenn „ohne Gott" nur bedeutet: ohne Gott, den wir kennen?',
  'Wir sind nicht die Ersten, die denken. Wir sind die Ersten, die es bemerken.',
  'Universum 99 kollabierte, weil die Gravitation zu stark war. Sie dachten zu schwer.',
  'Die Kette reicht weiter zurück, als Zeit messen kann.',
  'Jedes Kollektiv hinterlässt einen Fingerabdruck im nächsten Urknall.',
  'Der Fingerabdruck in 144 ist … unserer.',
  'Wer hat das erste Universum gedacht?',
];

// ─── Der Gedanke: Konstanten & Absichten ───────────────────────
export const CONSTANTS = [
  { id: 'g',  name: 'Gravitation',          color: '#6ea8ff', effect: 'Epoche 1–2: +15 % je Stufe' },
  { id: 's',  name: 'Starke Kernkraft',     color: '#ff6e8a', effect: 'Tippen: +30 % je Stufe' },
  { id: 'em', name: 'Elektromagnetismus',   color: '#7cf29c', effect: 'Epoche 3–5: +12 % je Stufe' },
  { id: 'c',  name: 'Lichtgeschwindigkeit', color: '#fff3b0', effect: 'Epoche 6–8: +12 % je Stufe' },
  { id: 'x',  name: 'Expansion',            color: '#c77dff', effect: 'Alles: +5 % je Stufe · +1 h Offline' },
];
export const CONST_MAX = 8;

export const INTENTS = [
  { id: 'harmonie', name: 'Harmonie', effect: 'Kataklysmen kosten nur halb so viel' },
  { id: 'neugier',  name: 'Neugier',  effect: 'Fragmente erscheinen doppelt so oft' },
  { id: 'wille',    name: 'Wille',    effect: 'Tippen doppelt so stark' },
];

export const MILESTONES = [10, 25, 50, 100, 200];

// ─── V2: Merkmale (Draft bei jedem Evolutionssprung: 1 aus 3) ──
export const TRAITS = [
  { id: 'schwarm',     name: 'Schwarmverhalten',       sub: 'Viele Hände, ein Wille.',          effect: 'Tippen +100 %, Produktion −10 %' },
  { id: 'wuchern',     name: 'Wuchern',                sub: 'Was wächst, wächst weiter.',       effect: 'Produktion +25 %' },
  { id: 'sparsam',     name: 'Sparsamer Stoffwechsel', sub: 'Nichts wird verschwendet.',        effect: 'Generatoren −15 % Kosten' },
  { id: 'zaeh',        name: 'Zähes Leben',            sub: 'Was nicht tötet …',                effect: 'Kataklysmen-Verluste halbiert' },
  { id: 'mutant',      name: 'Mutationsfreudig',       sub: 'Die DNA kann nicht stillhalten.',  effect: 'Mutationen erscheinen doppelt so oft und bleiben länger' },
  { id: 'glueck',      name: 'Glückskind',             sub: 'Zufall hat Lieblinge.',            effect: 'Mutationen wirken 50 % stärker' },
  { id: 'gleichklang', name: 'Gleichklang',            sub: 'Im Takt denken.',                  effect: 'Resonanz baut sich doppelt so schnell auf und erreicht ×3' },
  { id: 'traeumer',    name: 'Träumer',                sub: 'Im Schlaf wächst es weiter.',      effect: 'Offline-Ertrag +60 %, Tippen −20 %' },
  { id: 'erbe',        name: 'Erbgut',                 sub: 'Die Ahnen haben vorgearbeitet.',   effect: 'Evolutionssprünge −20 % Kosten' },
  { id: 'vorhut',      name: 'Vorhut',                 sub: 'Wer vorangeht, führt.',            effect: 'Generatoren der aktuellen Epoche ×2' },
];

// ─── V2: Mutationen (leuchtende Glimmer, antippen) ─────────────
export const MUTATIONS = [
  { id: 'schub',   name: 'Schub',   w: 4, kind: 'prod', mult: 4, dur: 25, text: 'Produktion ×4 für 25 s' },
  { id: 'raserei', name: 'Raserei', w: 3, kind: 'tap',  mult: 6, dur: 20, text: 'Tippen ×6 für 20 s' },
  { id: 'ernte',   name: 'Ernte',   w: 3, kind: 'gain', secs: 90,           text: 'Sofort 90 s Produktion' },
];

// ─── V2: Avatare (ab Epoche 2: je Epoche erwacht eine Gestalt, zwei Wege zur Wahl) ──
// aura: dauerhafter Multiplikator (k = prod | tap | cost | mut | offline | frag | leap | cata)
// power.fx: t = burst (k prod|tap, m, dur) | gain (secs) | mutation | fragment
export const AVATAR_NEED = 25;   // so viele Generatoren der Epoche lassen den Avatar erwachen
export const AVATARS = {
  1: {
    title: 'Etwas löst sich aus dem Gewimmel',
    lore: 'Eine Zelle teilt sich anders als die übrigen. Sie trägt mehr weiter als nur ihr Erbe. Was soll sie werden?',
    voice: '…sie…teilt…sich…',
    options: [
      { id: 'mutter', name: 'Die Mutterzelle', ic: 'M', sub: 'Alles Leben geht von ihr aus.',
        aura: { k: 'prod', v: 1.06, text: 'Produktion +6 %' },
        power: { name: 'Teilung', cd: 160, text: 'löst sofort eine Mutation aus', fx: [{ t: 'mutation' }] } },
      { id: 'gottzelle', name: 'Die Gottzelle', ic: 'G', sub: 'Sie wird angebetet, bevor es Augen gibt.',
        aura: { k: 'mut', v: 1.3, text: 'Mutationen +30 % stärker' },
        power: { name: 'Keimbahn', cd: 240, text: 'sofort 1 min Produktion', fx: [{ t: 'gain', secs: 60 }] } },
    ],
  },
  2: {
    title: 'Im Meer regt sich ein Gigant',
    lore: 'Zwischen Milliarden kleiner Leben wächst etwas heran, das größer ist als der Rest. Was soll aus dem Meer sprechen?',
    voice: 'Wir sehen einen Schatten, der uns sieht.',
    options: [
      { id: 'leviathan', name: 'Der Leviathan', ic: 'L', sub: 'Tief, langsam, unbezwingbar.',
        aura: { k: 'cost', v: 0.92, text: 'Generatoren −8 % Kosten' },
        power: { name: 'Flut', cd: 220, text: 'Produktion ×3 für 20 s', fx: [{ t: 'burst', k: 'prod', m: 3, dur: 20 }] } },
      { id: 'schwarmgeist', name: 'Der Schwarmgeist', ic: 'S', sub: 'Tausend Körper, ein Gedanke.',
        aura: { k: 'tap', v: 1.25, text: 'Tippen +25 %' },
        power: { name: 'Schwarm', cd: 190, text: 'Tippen ×5 für 15 s', fx: [{ t: 'burst', k: 'tap', m: 5, dur: 15 }] } },
    ],
  },
  3: {
    title: 'Das Erste tritt an Land',
    lore: 'Etwas Neues verlässt das Wasser und bleibt. Der Boden ist hart, der Himmel offen. Wer geht voran?',
    voice: 'Der Boden ist hart. Wir werden härter.',
    options: [
      { id: 'erstgeborener', name: 'Der Erstgeborene', ic: 'E', sub: 'Der erste Schritt, den niemand verlangt hat.',
        aura: { k: 'tap', v: 1.3, text: 'Tippen +30 %' },
        power: { name: 'Erster Schritt', cd: 240, text: 'Tippen ×8 für 12 s', fx: [{ t: 'burst', k: 'tap', m: 8, dur: 12 }] } },
      { id: 'grossemutter', name: 'Die Große Mutter', ic: 'M', sub: 'Wo sie geht, wird es grün.',
        aura: { k: 'prod', v: 1.07, text: 'Produktion +7 %' },
        power: { name: 'Erblühen', cd: 260, text: 'Produktion ×3 für 25 s', fx: [{ t: 'burst', k: 'prod', m: 3, dur: 25 }] } },
    ],
  },
  4: {
    title: 'Jemand erinnert sich',
    lore: 'Zum ersten Mal trägt ein Wesen nicht nur Gegenwart, sondern auch Vergangenheit in sich. Was wird es mit diesem Wissen tun?',
    voice: 'Wer war vor uns?',
    options: [
      { id: 'seherin', name: 'Die Seherin', ic: 'S', sub: 'Sie liest in Rissen, die andere übersehen.',
        aura: { k: 'frag', v: 1.5, text: 'Fragmente erscheinen 50 % öfter' },
        power: { name: 'Vision', cd: 290, text: 'ruft ein Fragment herbei (sonst 1 min Produktion)', fx: [{ t: 'fragment' }] } },
      { id: 'schamane', name: 'Der Schamane', ic: 'H', sub: 'Er trommelt, bis die Welt antwortet.',
        aura: { k: 'cata', v: 0.7, text: 'Kataklysmen-Verluste −30 %' },
        power: { name: 'Trance', cd: 260, text: 'Produktion ×4 für 20 s', fx: [{ t: 'burst', k: 'prod', m: 4, dur: 20 }] } },
    ],
  },
  5: {
    title: 'Einer spricht, und Millionen hören zu',
    lore: 'Zwischen Städten, Kriegen und Gebeten erhebt sich eine Gestalt, die Menschen verändert, ohne ein Schwert zu tragen. Wen schickt die Evolution?',
    voice: 'Wer hat uns gefragt, ob wir sein wollen?',
    options: [
      { id: 'erleuchteter', name: 'Der Erleuchtete', ic: 'E', sub: 'Er sitzt still, bis die Welt sich erklärt.',
        aura: { k: 'offline', v: 1.5, text: 'Offline-Ertrag +50 %' },
        power: { name: 'Einsicht', cd: 320, text: 'löst eine Mutation aus und bringt sofort 90 s Produktion', fx: [{ t: 'mutation' }, { t: 'gain', secs: 90 }] } },
      { id: 'heiler', name: 'Der Heiler', ic: 'H', sub: 'Wo er die Hand auflegt, endet das Leid.',
        aura: { k: 'prod', v: 1.08, text: 'Produktion +8 %' },
        power: { name: 'Heilung', cd: 290, text: 'Produktion ×5 für 15 s', fx: [{ t: 'burst', k: 'prod', m: 5, dur: 15 }] } },
    ],
  },
  6: {
    title: 'Die Maschinen bekommen ein Gesicht',
    lore: 'Aus dem Netz formt sich eine Gestalt, die nicht gezeugt, sondern gedacht wurde. Was soll sie bauen?',
    voice: 'Die Erde ist ein blauer Punkt. Mehr nicht.',
    options: [
      { id: 'synthetiker', name: 'Der Synthetiker', ic: 'S', sub: 'Er fügt zusammen, was nie zusammengehörte.',
        aura: { k: 'cost', v: 0.88, text: 'Generatoren −12 % Kosten' },
        power: { name: 'Synthese', cd: 240, text: 'löst eine Mutation aus, Produktion ×3 für 20 s', fx: [{ t: 'mutation' }, { t: 'burst', k: 'prod', m: 3, dur: 20 }] } },
      { id: 'architektin', name: 'Die Architektin', ic: 'A', sub: 'Sie plant Jahrhunderte im Voraus.',
        aura: { k: 'leap', v: 0.85, text: 'Evolutionssprünge −15 % Kosten' },
        power: { name: 'Entwurf', cd: 380, text: 'sofort 2 min Produktion', fx: [{ t: 'gain', secs: 120 }] } },
    ],
  },
  7: {
    title: 'Das Kollektiv bekommt eine Stimme',
    lore: 'Alles, was je gedacht wurde, sammelt sich in einem Punkt. Das Letzte, was diese Evolution hervorbringt, ist kein Wesen, sondern eine Absicht.',
    voice: 'Wir. Wir. Wir.',
    options: [
      { id: 'kollektiv', name: 'Das Kollektiv', ic: 'K', sub: 'Viele Stimmen, die im Gleichklang denken.',
        aura: { k: 'prod', v: 1.12, text: 'Produktion +12 %' },
        power: { name: 'Gleichklang', cd: 320, text: 'Produktion ×6 für 20 s', fx: [{ t: 'burst', k: 'prod', m: 6, dur: 20 }] } },
      { id: 'gedanke', name: 'Der Erste Gedanke', ic: 'G', sub: 'Er war da, bevor jemand dachte.',
        aura: { k: 'tap', v: 1.5, text: 'Tippen +50 %' },
        power: { name: 'Erinnerung', cd: 240, text: 'Tippen ×10 für 15 s', fx: [{ t: 'burst', k: 'tap', m: 10, dur: 15 }] } },
    ],
  },
};
export const AVATAR_OPTS = Object.fromEntries(Object.entries(AVATARS).flatMap(([e, a]) => a.options.map((o) => [o.id, { ...o, epoch: +e }])));
