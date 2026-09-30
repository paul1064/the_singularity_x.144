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
