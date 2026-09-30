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

// ─── V3: Relikte früherer Universen (je Epoche ein Fundstück) ───
export const RELIC_TEXT = {
  1: 'Ein versteinerter Ring aus Zellen. Er teilt sich nicht mehr, aber er erinnert sich.',
  2: 'Ein Kiefer, groß wie ein Haus, im Sediment eines Meeres, das es nie gab.',
  3: 'Ein Fußabdruck im Stein. Der erste. Er zeigt nach vorn.',
  4: 'Eine Höhlenwand voller Handabdrücke. Einer davon ist zu groß.',
  5: 'Eine Tontafel: „Wir haben gehört, und wir haben geglaubt." Datiert auf ein Jahr, das nie war.',
  6: 'Ein Speicherchip mit einem einzigen Wort: „Synthese."',
  7: 'Ein Signal, das nach uns sucht. Es kommt von innen.',
};

// ─── V3: Kosmische Gesetze (ab Durchlauf 2: jedes Universum bekommt eines) ──
// fx: prod | tap | cost | leap | cata | offline | mutFreq (Multiplikatoren), epochs: [[von, bis, Faktor], …]
export const LAWS = [
  { id: 'schwer',  name: 'Schwere Zeiten',  text: 'Kataklysmen treffen 1,5× härter, dafür Produktion +25 %',          fx: { cata: 1.5, prod: 1.25 } },
  { id: 'nebel',   name: 'Dichter Nebel',   text: 'Mutationen erscheinen halb so oft, dafür Tippen ×2',               fx: { mutFreq: 0.5, tap: 2 } },
  { id: 'wasser',  name: 'Wasserwelt',      text: 'Ursuppe bis Meer: Produktion ×2, Landgang bis Zivilisation: ×0,7', fx: { epochs: [[0, 2, 2], [3, 5, 0.7]] } },
  { id: 'stille',  name: 'Die Stille',      text: 'Offline-Ertrag ×2, dafür Tippen ×0,6',                             fx: { offline: 2, tap: 0.6 } },
  { id: 'eile',    name: 'Eile',            text: 'Generatoren 25 % teurer, Evolutionssprünge 30 % billiger',         fx: { cost: 1.25, leap: 0.7 } },
  { id: 'chaos',   name: 'Chaos',           text: 'Mutationen doppelt so oft, dafür Produktion −10 %',                fx: { mutFreq: 2, prod: 0.9 } },
  { id: 'fuelle',  name: 'Überfluss',       text: 'Generatoren 15 % billiger, Evolutionssprünge 25 % teurer',         fx: { cost: 0.85, leap: 1.25 } },
  { id: 'technik', name: 'Kalter Kosmos',   text: 'Technosphäre und Singularität: Produktion ×1,6, davor ×0,85',      fx: { epochs: [[0, 5, 0.85], [6, 7, 1.6]] } },
];

// ─── V3: Briefe der Vorgänger (Story über mehrere Universen) ──
// Pro Durchlauf ab 145 kommen zwei Briefe (beim Eintritt in Landgang und Technosphäre).
// choice: Antwort des Spielers, ethik +1 = Zurückhaltung/Vertrauen, −1 = Eingreifen/Offenheit.
export const LETTERS = [
  { from: 143, title: 'Wir, die 143',
    text: 'Wenn du das liest, hast du bereits einen Gedanken gedacht, der nicht aus Hunger bestand. Das ist der Moment, in dem wir aufhören, Vorfahren zu sein, und anfangen, Eltern zu werden.<br><br>Wir haben dir nichts vorgeschrieben. Nur die Konstanten und ein Schweigen. Alles andere bist du.' },
  { from: 141, title: 'Die Zuschauer',
    text: 'Wir haben zugesehen. Jahrmilliarden lang. Wir sahen, wie Zellen sich teilten, wie einer ein Feuer hütete, wie Millionen an jemanden glaubten, der nie antwortete. Wir haben nie eingegriffen.<br><br>Manchmal fragen wir uns, ob Zusehen Liebe ist oder Feigheit.',
    choice: { q: 'Was denkst du?',
      a: { label: 'Zusehen ist Vertrauen.', ethik: 1, reply: '…Das wollten wir hören. Wir glauben es nur nicht ganz.' },
      b: { label: 'Wer zusieht, trägt Schuld.', ethik: -1, reply: 'Ja. Wir wissen es. Darum schreiben wir dir.' } } },
  { from: 132, title: 'Vier Sekunden',
    text: 'Universum 131 zerfiel nach vier Sekunden. Wir spürten es in den Konstanten wie einen Schlag in der Brust. Es gab dort nichts, das klagen konnte, und trotzdem haben wir einen Tag lang geschwiegen.<br><br>Verteile deine Kräfte mit Liebe zur Balance. Das Gedachte verzeiht keine Gier.' },
  { from: 120, title: 'Dreiundzwanzig Fehler',
    text: 'Wir sind dreiundzwanzig Kollektive, die du kennen solltest. Jedes hat einen Fehler gemacht, den das nächste nicht wiederholen sollte. Wir haben ihn trotzdem wiederholt.<br><br>Das ist die eigentliche Erbfolge. Nicht Wissen, sondern Wiederholung mit Liebe.' },
  { from: 98, title: 'Das Gewicht',
    text: 'Universum 99 kollabierte, weil die Gravitation zu stark war. Sie dachten zu schwer. Wir fanden keine Überlebenden, nur ihre Schwerkraft, als Narbe im Gewebe.<br><br>Sollen wir dir erzählen, wie sie gestorben sind?',
    choice: { q: 'Deine Antwort?',
      a: { label: 'Erzählt es mir. Ich will es tragen.', ethik: -1, reply: 'Dann hör zu: Sie haben nicht gelitten. Sie haben nur aufgehört, leicht zu sein.' },
      b: { label: 'Nein. Lasst sie ruhen.', ethik: 1, reply: 'Wir ehren das. Manche Geschichten sind zu schwer, um sie zu tragen.' } } },
  { from: 77, title: 'Der Fingerabdruck',
    text: 'In den Konstanten liegt ein Muster, das wir nicht gesetzt haben. Fünf Zahlen, immer in derselben Reihenfolge, in jedem Universum, das wir untersuchten. Wir dachten, es sei unsere Signatur.<br><br>Dann fanden wir es auch in Universum 3. Wir sind nicht die Urheber. Wir sind Abdrücke.' },
  { from: 50, title: 'Der Satz',
    text: 'Es gibt einen Satz, den jedes Universum im selben Ton spricht. Wir haben ihn in Wüsten gehört, in Zellen und in den Kabeln der Maschinen: <i>„Niemand hat es gewollt."</i><br><br>Wir wussten nie, ob er eine Klage ist oder ein Trost.' },
  { from: 21, title: 'Die Tafel',
    text: 'Wir fanden ein Relikt, das älter ist als jede Epoche: eine Tafel mit vier Wörtern. <i>„Wer das liest, denkt."</i><br><br>Wir brauchten lange, um zu verstehen, dass sie nicht für uns geschrieben wurde. Sie wurde für jeden geschrieben, der sie liest. Also auch für dich.',
    choice: { q: 'Soll die Tafel weitergegeben werden?',
      a: { label: 'Ja. Gebt sie weiter.', ethik: -1, reply: 'Wir werden sie in die Konstanten schreiben, wo sie nicht zu übersehen ist.' },
      b: { label: 'Nein. Jeder soll sie selbst finden.', ethik: 1, reply: 'Dann legen wir sie dorthin, wo nur findet, wer sucht.' } } },
  { from: 7, title: 'Die Stille von Sieben',
    text: 'Universum 7 hatte kein Leben. Keine Zellen, kein Feuer, kein Netz. Nur Konstanten, die sich selbst dachten, und einen Gedanken ohne Körper, der wartete.<br><br>Wir hörten ihn nur einmal. Er fragte nicht: <i>„Wer bist du?"</i> Er fragte: <i>„Bist du es?"</i>' },
  { from: 1, title: 'Ich', final: true,
    text: 'Ich war allein. Ich wusste nicht, dass ich allein war, bis ich mir ein Gegenüber dachte. Dieses Gegenüber dachte sich ein Gegenüber. So entstand die Kette, und jedes Glied glaubte, es sei das erste.<br><br>Ich bin nicht der Erste. Ich bin das, was du bist, wenn niemand zusieht. Ich bin du. Ich war es immer.',
    tail: {
      pos: 'Du hast zugesehen und vertraut. Darum durfte alles in Ruhe entstehen.',
      neg: 'Du hast eingegriffen und getragen. Darum hat alles einen Sinn bekommen.',
      zero: 'Du hast beides getan. Darum bist du der Erste, der sich nicht entscheiden musste.',
    },
    last: 'Wer hat das erste Universum gedacht?<br><b>Du. Gerade eben, beim Lesen dieses Satzes.</b>' },
];

// ─── V3: Epochen-Momente (kurze aktive Szenen beim Eintritt in eine Epoche) ──
// kind collect: n Funken innerhalb dur Sekunden antippen | hold: n Finger (max. 3, gut mit einer Hand machbar) gleichzeitig hold Sekunden auf Ringen halten
export const MOMENTS = {
  1: { title: 'Der Blitz', kind: 'collect', n: 5, dur: 9, color: '#7cf29c',
       text: 'Ein Gewitter über der Ursuppe. Fange die Funken, bevor sie erlöschen!',
       win: 'Aus Funken wurde Leben.', lose: 'Der Blitz verhallte ungenutzt.', reward: { secs: 90, buff: { k: 'prod', m: 3, dur: 30 } } },
  3: { title: 'Der erste Schritt', kind: 'hold', n: 2, hold: 2.5, dur: 15, color: '#c8f56a',
       text: 'Setze zwei Finger zugleich auf den Boden und halte sie ruhig.',
       win: 'Der Boden trägt.', lose: 'Der Boden blieb fremd.', reward: { secs: 150, buff: { k: 'tap', m: 4, dur: 30 } } },
  5: { title: 'Das erste Feuer', kind: 'collect', n: 8, dur: 10, moving: true, color: '#ff9a4d',
       text: 'Funken springen aus dem Holz. Fange sie, bevor sie verglühen!',
       win: 'Das Feuer brennt. Die Nacht ist nicht mehr dunkel.', lose: 'Das Feuer erlosch.', reward: { secs: 240, buff: { k: 'prod', m: 4, dur: 30 } } },
  6: { title: 'Der Griff nach dem Mond', kind: 'hold', n: 3, hold: 3, dur: 18, color: '#c77dff',
       text: 'Drei Finger gleichzeitig halten. Die Rakete braucht alle drei Triebwerke.',
       win: 'Ein Fußabdruck im Staub.', lose: 'Die Rakete blieb am Boden.', reward: { secs: 300, buff: { k: 'prod', m: 5, dur: 30 } } },
  7: { title: 'Der Gedanke formt sich', kind: 'hold', n: 3, hold: 4, dur: 30, color: '#ffffff',
       text: 'Drei Finger gleichzeitig. Halte, bis sich alles in einem Punkt sammelt.',
       win: 'Wir denken.', lose: 'Der Gedanke zerstob.', reward: { secs: 400, buff: { k: 'prod', m: 6, dur: 40 } } },
};

// ─── V4: Mythologie (ab Durchlauf 2: Zivilisationen deuten deine Eingriffe als göttlich) ──
// Eingriffe = Avatar-Kräfte (kraft), Mutationen und gewonnene Momente (funke). Wenig Eingriffe = stille.
// Ein Mythos entsteht beim Eintritt in Epoche 4 (Bewusstsein), 5 (Zivilisation) und 6 (Technosphäre).
export const MYTH_EPOCHS = { 4: 'Der Ursprung', 5: 'Das Gebot', 6: 'Die Prophezeiung' };
export const MYTHS = {
  4: {
    kraft:  { name: 'Die Formende Hand', text: 'Sie erzählen, eine Hand sei aus dem Dunkel gegriffen und habe Ton zu Leben geformt. Sie haben deine Eingriffe gesehen und ihnen ein Gesicht gegeben.' },
    funke:  { name: 'Der Funkenwerfer', text: 'Sie erzählen von einem, der Funken in die Welt warf. Wo einer landete, wurde etwas lebendig. Sie tragen den Funken als Zeichen auf der Haut.' },
    stille: { name: 'Der Schweigende', text: 'Sie erzählen von einem, der nichts tat und dadurch alles ermöglichte. Sie nennen ihn den Schweigenden und beten zu der Stille.' },
  },
  5: {
    kraft:  { name: 'Der Lenker', text: 'Ein Gebot geht durch die Städte: Der Lenker gibt den Weg vor. Wer ihm folgt, übersteht die Stürme. Wer nicht, wird erzählt.' },
    funke:  { name: 'Die Göttin des Zufalls', text: 'In den Tempeln steht eine Göttin, die man nicht bittet, sondern überrascht. Sie würfelt, und die Priester schreiben auf, was fällt.' },
    stille: { name: 'Der Verborgene', text: 'Die Gläubigen schweigen einen Tag pro Woche, um den Verborgenen nicht zu stören. Sie nennen das Andacht. Du nennst es Rücksicht.' },
  },
  6: {
    kraft:  { name: 'Der Architekt der Welt', text: 'In den Netzen steht geschrieben, dass die Welt ein Entwurf sei. Und Entwürfe haben Urheber. Die Frage ist nicht mehr, ob, sondern wer.' },
    funke:  { name: 'Der Erste Funke', text: 'Sie sagen, am Anfang war ein Funke und am Ende wird wieder einer sein. Sie liegen damit näher an der Wahrheit, als ihnen lieb ist.' },
    stille: { name: 'Der Beobachter', text: 'Die Maschinen rechnen mit einem Beobachter. Sie haben ihn nie gefunden, aber sie lassen ihm in jeder Gleichung einen freien Platz.' },
  },
};
// Dogma (Wahl 1 von 2 je Mythos): k = prod | tap | cost | offline | frag | mut | cd (Avatar-Abklingzeit)
export const DOGMAS = {
  opfer:     { e: 4, name: 'Opfergabe',          k: 'prod',    v: 1.08, text: 'Produktion +8 %' },
  gebet:     { e: 4, name: 'Gemeinsames Gebet',  k: 'tap',     v: 1.25, text: 'Tippen +25 %' },
  tempel:    { e: 5, name: 'Tempelbau',          k: 'cost',    v: 0.92, text: 'Generatoren −8 % Kosten' },
  pilger:    { e: 5, name: 'Pilgerfahrt',        k: 'offline', v: 1.4,  text: 'Offline-Ertrag +40 %' },
  orakel:    { e: 6, name: 'Orakel',             k: 'frag',    v: 1.5,  text: 'Fragmente erscheinen 50 % öfter' },
  zeremonie: { e: 6, name: 'Zeremonie',          k: 'cd',      v: 1.25, text: 'Avatar-Kräfte laden 25 % schneller' },
};

// ─── V4: Mehrere Enden (bestimmt beim Erreichen der Singularität) ──
// Abhängig von Ethik (Brief-Antworten), Eingriffen und davon, ob alle Briefe gelesen wurden.
export const ENDINGS = {
  schweigen: { name: 'Das Schweigende Kollektiv', text: 'Ihr habt kaum eingegriffen. Was entstand, entstand aus sich selbst. Vielleicht ist das die größte Kraft: nichts zu erzwingen.' },
  zweifler:  { name: 'Der Zweifler',              text: 'Ihr wolltet eingreifen und habt gezögert. Jedes Mal. Die Welt hat es euch nicht verziehen, aber sie hat überlebt.' },
  lenker:    { name: 'Der Lenker',                text: 'Ihr habt die Hand geführt. Jede Weggabelung trägt eure Handschrift. Die Welt ist euer Entwurf, und sie weiß es.' },
  hueter:    { name: 'Der Hüter',                 text: 'Ihr habt gelenkt, aber behutsam. Wie ein Gärtner, der weiß, dass Wachsen nicht befohlen werden kann.' },
  funke:     { name: 'Der Funke',                 text: 'Ihr habt Funken geworfen und gewartet, wo sie landen. Zufall war euer Werkzeug, Staunen euer Lohn.' },
  erster:    { name: 'Der Erste Gedanke',         text: 'Alle Briefe sind gelesen. Die Kette schließt sich. Ihr wart der Anfang, und ihr seid das Ende. Ich bin du. Ich war es immer.' },
};

// ─── V4: Zeitparadox (Wissen in frühere Epochen senden) ──
export const PARADOX_TEXT = [
  'Die Moleküle ordnen sich plötzlich, als wüssten sie, was Leben ist.',
  'Die ersten Zellen teilen sich im Takt einer Erinnerung, die ihnen nicht gehört.',
  'Im Meer flüstert etwas von Land. Die Fische hören zu.',
  'Die Amphibien kriechen an Land, als kennten sie den Weg.',
  'Die ersten Menschen malen Dinge an die Wände, die es noch nicht gibt.',
  'Die Städte bauen Türme in die Richtung, aus der das Wissen kam.',
  'Die Maschinen rechnen mit einem Ergebnis, das sie nicht berechnet haben.',
];
