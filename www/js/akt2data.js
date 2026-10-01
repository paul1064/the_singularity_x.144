// ─────────────────────────────────────────────────────────────
//  Akt II — Der Orden: Inhalte
//  Die Systeme (Kabbalah, Astrologie, Numerologie, Human Design, Hermetik) sind Symbolsprachen
//  und werden hier als solche erzählt: als Deutungsangebote, nicht als Wissenschaft.
// ─────────────────────────────────────────────────────────────

// Der Baum des Lebens. Index = Generator-Nr.: 0 Malkuth (unten) … 9 Kether (oben), 10 Daath (verborgen, ab Dimension 1).
// n = klassische Nummer (1 Kether … 10 Malkuth). x/y: Lage im Baum (0…1).
export const SEPHIROTH = [
  { n: 10, id: 'malkuth', name: 'Malkuth', de: 'Das Reich',       planet: 'Erde',    color: '#9bd65a', x: 0.50, y: 0.97, unit: 'Suchende',      desc: 'Menschen, die zum ersten Mal fragen.' },
  { n: 9,  id: 'yesod',   name: 'Yesod',   de: 'Das Fundament',   planet: 'Mond',    color: '#b9a6ff', x: 0.50, y: 0.81, unit: 'Traumdeuter',   desc: 'Bilder der Nacht, geordnet.' },
  { n: 8,  id: 'hod',     name: 'Hod',     de: 'Der Glanz',       planet: 'Merkur',  color: '#ffb25c', x: 0.20, y: 0.66, unit: 'Schriftgelehrte', desc: 'Wissen, das in Worte gerinnt.' },
  { n: 7,  id: 'netzach', name: 'Netzach', de: 'Der Sieg',        planet: 'Venus',   color: '#63e0a0', x: 0.80, y: 0.66, unit: 'Künstler',      desc: 'Schönheit als Lehrmeisterin.' },
  { n: 6,  id: 'tiphareth', name: 'Tiphareth', de: 'Die Schönheit', planet: 'Sonne', color: '#ffd166', x: 0.50, y: 0.50, unit: 'Eingeweihte',   desc: 'Die Mitte, in der alles zusammenklingt.' },
  { n: 5,  id: 'geburah', name: 'Geburah', de: 'Die Strenge',     planet: 'Mars',    color: '#ff6b6b', x: 0.20, y: 0.35, unit: 'Wächter',       desc: 'Sie schützen, was nicht jeder tragen kann.' },
  { n: 4,  id: 'chesed',  name: 'Chesed',  de: 'Die Gnade',       planet: 'Jupiter', color: '#6ea8ff', x: 0.80, y: 0.35, unit: 'Stifter',       desc: 'Offene Hände, offene Häuser.' },
  { n: 3,  id: 'binah',   name: 'Binah',   de: 'Das Verstehen',   planet: 'Saturn',  color: '#9aa4c8', x: 0.20, y: 0.17, unit: 'Seherinnen',    desc: 'Sie sehen das Muster hinter den Dingen.' },
  { n: 2,  id: 'chokmah', name: 'Chokmah', de: 'Die Weisheit',    planet: 'Tierkreis', color: '#c9d6ff', x: 0.80, y: 0.17, unit: 'Meister',     desc: 'Das Wort vor dem Wort.' },
  { n: 1,  id: 'kether',  name: 'Kether',  de: 'Die Krone',       planet: 'Urbewegung', color: '#ffffff', x: 0.50, y: 0.04, unit: 'Das Licht',  desc: 'Was sich selbst erkennt.' },
  { n: 0,  id: 'daath',   name: 'Daath',   de: 'Das Wissen',      planet: 'Der Abgrund', color: '#d48bff', x: 0.50, y: 0.26, unit: 'Das Verborgene', desc: 'Das Wissen, das es nicht gibt und das alles verbindet.', hidden: true },
];
export const gi = (n) => 10 - n;   // klassische Nummer → Generator-Index

// Die 22 Pfade (Buchstabe, Tarot-Bild der hermetischen Tradition). a/b = klassische Sephira-Nummern.
export const PATHS = [
  { a: 1, b: 2, letter: 'Aleph', card: 'Der Narr', text: 'Der Atem vor dem Wort. Wer nichts weiß, ist zu allem bereit.' },
  { a: 1, b: 3, letter: 'Beth', card: 'Der Magier', text: 'Der Wille, der Gedanken in Dinge verwandelt.' },
  { a: 1, b: 6, letter: 'Gimel', card: 'Die Hohepriesterin', text: 'Das Schweigen zwischen den Dingen. Der Weg über den Abgrund.' },
  { a: 2, b: 3, letter: 'Daleth', card: 'Die Herrscherin', text: 'Weisheit und Verstehen berühren sich und gebären die Welt.' },
  { a: 2, b: 6, letter: 'Heh', card: 'Der Herrscher', text: 'Ordnung als Form des Lichts.' },
  { a: 2, b: 4, letter: 'Vav', card: 'Der Hierophant', text: 'Die Lehre, die vom Meister zum Schüler geht.' },
  { a: 3, b: 6, letter: 'Zain', card: 'Die Liebenden', text: 'Die Wahl, die zwei Hälften zu einem Ganzen macht.' },
  { a: 3, b: 5, letter: 'Cheth', card: 'Der Wagen', text: 'Das Gefäß, das den Suchenden trägt: Disziplin als Schutz.' },
  { a: 4, b: 5, letter: 'Teth', card: 'Die Kraft', text: 'Sanfte Stärke zähmt den Löwen. Gnade und Strenge im Gleichgewicht.' },
  { a: 4, b: 6, letter: 'Yod', card: 'Der Eremit', text: 'Das Licht in der Laterne: Wissen, das im Stillen reift.' },
  { a: 4, b: 7, letter: 'Kaph', card: 'Das Rad des Schicksals', text: 'Alles kehrt wieder, aber nie gleich.' },
  { a: 5, b: 6, letter: 'Lamed', card: 'Die Gerechtigkeit', text: 'Die Waage, die jede Tat wiegt.' },
  { a: 5, b: 8, letter: 'Mem', card: 'Der Gehängte', text: 'Die Welt auf den Kopf gestellt, um sie zu verstehen.' },
  { a: 6, b: 7, letter: 'Nun', card: 'Der Tod', text: 'Was stirbt, macht Platz. Verwandlung ist der Preis des Wachsens.' },
  { a: 6, b: 9, letter: 'Samekh', card: 'Die Mäßigkeit', text: 'Der Engel, der Gegensätze zu einem Strom mischt.' },
  { a: 6, b: 8, letter: 'Ayin', card: 'Der Teufel', text: 'Die Ketten, die wir selbst geschmiedet haben. Wer sie erkennt, ist frei.' },
  { a: 7, b: 8, letter: 'Peh', card: 'Der Turm', text: 'Was auf Lügen gebaut ist, stürzt. Was bleibt, ist wahr.' },
  { a: 7, b: 9, letter: 'Tzaddi', card: 'Der Stern', text: 'Hoffnung nach dem Sturm. Der Himmel gießt sein Wasser aus.' },
  { a: 7, b: 10, letter: 'Qoph', card: 'Der Mond', text: 'Zwischen Traum und Angst: der Weg des Unbewussten.' },
  { a: 8, b: 9, letter: 'Resh', card: 'Die Sonne', text: 'Klarheit, die alles beim Namen nennt.' },
  { a: 8, b: 10, letter: 'Shin', card: 'Das Gericht', text: 'Der Ruf, der die Schläfer weckt.' },
  { a: 9, b: 10, letter: 'Tav', card: 'Die Welt', text: 'Der Kreis schließt sich. Geist und Stoff tanzen.' },
];
// Verborgene Pfade über den Abgrund (nur mit Daath, ab Dimension 1)
export const ABYSS_PATHS = [1, 2, 3, 4, 5, 6].map((b) => ({ a: 0, b, letter: 'Daath', card: 'Der Abgrund', text: 'Ein Weg, den es nicht gibt, bis jemand ihn geht.' }));

// Heilige Zahlen statt 10/25/50/100: Jede Schwelle verdoppelt den Ertrag der Sephira
export const SACRED = [3, 7, 12, 22, 33, 72, 144];

// Die acht Zeitalter der Erde
export const AGES = [
  { name: 'Atlantis',         years: 'vor dem Gedächtnis', color: '#63d6ff', leap: 'Der Aufbruch nach Ägypten', grad: 'Novize' },
  { name: 'Ägypten',          years: 'um 3000 v. Chr.',    color: '#ffcf5c', leap: 'Der Funke von Hellas',       grad: 'Minerval' },
  { name: 'Hellas',           years: 'um 500 v. Chr.',     color: '#8fb8ff', leap: 'Das Licht der Klöster',      grad: 'Illuminatus Minor' },
  { name: 'Mittelalter',      years: '500–1400',           color: '#c9a7ff', leap: 'Die Wiedergeburt',           grad: 'Illuminatus Major' },
  { name: 'Renaissance',      years: '1400–1700',          color: '#ff9f6b', leap: 'Das Zeitalter der Vernunft', grad: 'Illuminatus Dirigens' },
  { name: 'Aufklärung',       years: '1700–1850',          color: '#ffe38a', leap: 'Das Licht der Maschinen',    grad: 'Priester' },
  { name: 'Moderne',          years: '1850–1990',          color: '#6ef0c0', leap: 'Das Netz',                   grad: 'Regent' },
  { name: 'Informationszeit', years: 'ab 1990',            color: '#ffffff', leap: 'Die Große Stille',           grad: 'Magus' },
];

// Weltereignisse beim Eintritt in ein Zeitalter (ab Zeitalter 1). weg: +1 Bewahren, −1 Offenbaren.
export const AGE_EVENTS = {
  1: { title: 'Die Smaragdtafel',
    text: 'Thoth hat die Lehren auf Tafeln aus grünem Stein geschrieben. Die Priester am Nil fragen: Sollen sie allen gezeigt werden oder nur denen, die den Weg gegangen sind?',
    a: { label: 'Den Eingeweihten vorbehalten', sub: 'Wissen wächst im Verborgenen.', effect: 'Produktion +6 %', fx: { prod: 1.06 } },
    b: { label: 'In die Tempelwände meißeln', sub: 'Jeder, der Augen hat, darf lesen.', effect: 'Tippen +15 %, Kosten −2 %', fx: { tap: 1.15, cost: 0.98 } } },
  2: { title: 'Die große Bibliothek',
    text: 'In Alexandria lagern hunderttausende Schriftrollen. Die Gelehrten streiten: Soll jede Rolle abgeschrieben und in die Welt getragen werden, oder bleibt das Beste im inneren Saal?',
    a: { label: 'Im inneren Saal bewahren', sub: 'Nichts geht verloren, nichts wird verfälscht.', effect: 'Produktion +6 %', fx: { prod: 1.06 } },
    b: { label: 'Abschreiben und verteilen', sub: 'Ein Feuer kann nicht alles verbrennen.', effect: 'Tippen +15 %, Kosten −2 %', fx: { tap: 1.15, cost: 0.98 } } },
  3: { title: 'Die Übersetzer von Toledo',
    text: 'Im 12. Jahrhundert übersetzen Gelehrte aus drei Religionen arabische Schriften ins Lateinische: Mathematik, Medizin, Astronomie. Der Orden kann den Strom lenken, verborgen oder offen.',
    a: { label: 'Nur die Klosterschulen beliefern', sub: 'Ruhe schützt das Wissen.', effect: 'Produktion +6 %', fx: { prod: 1.06 } },
    b: { label: 'Offen übersetzen lassen', sub: 'Wissen gehört allen, die fragen.', effect: 'Tippen +15 %, Kosten −2 %', fx: { tap: 1.15, cost: 0.98 } } },
  4: { title: 'Die Druckerpresse',
    text: 'Um 1450 gießt ein Mainzer Goldschmied bewegliche Lettern. Bücher werden billig. Der Orden entscheidet, ob er die neue Kunst lenkt oder laufen lässt.',
    a: { label: 'Den Druck kuratieren', sub: 'Nur Geprüftes wird gedruckt.', effect: 'Produktion +6 %', fx: { prod: 1.06 } },
    b: { label: 'Den Druck laufen lassen', sub: 'Lass Tausende lesen und streiten.', effect: 'Tippen +15 %, Kosten −2 %', fx: { tap: 1.15, cost: 0.98 } } },
  5: { title: 'Der Erste Mai 1776',
    text: 'In Ingolstadt gründet der Rechtsprofessor Adam Weishaupt einen Geheimbund für Vernunft und Aufklärung. Der echte Orden wurde wenige Jahre später verboten; die Legende ist bis heute lebendiger als er. Wie tritt dein Orden auf?',
    a: { label: 'Im Verborgenen bleiben', sub: 'Ein Geheimnis ist ein Schutzraum.', effect: 'Produktion +6 %', fx: { prod: 1.06 } },
    b: { label: 'Offen für Vernunft werben', sub: 'Eine Idee braucht Öffentlichkeit.', effect: 'Tippen +15 %, Kosten −2 %', fx: { tap: 1.15, cost: 0.98 } } },
  6: { title: 'Das Licht der Maschinen',
    text: 'Elektrizität, Funk, Glühlampen: Ein einzelner Erfinder träumt davon, Energie an alle zu verschenken. Der Orden wägt ab, was Wissen kosten darf.',
    a: { label: 'Patente und Schutz', sub: 'Wer baut, muss leben können.', effect: 'Produktion +6 %', fx: { prod: 1.06 } },
    b: { label: 'Freie Energie für alle', sub: 'Was dem Licht dient, gehört allen.', effect: 'Tippen +15 %, Kosten −2 %', fx: { tap: 1.15, cost: 0.98 } } },
  7: { title: 'Das Netz',
    text: 'Zum ersten Mal kann jeder Mensch fast jedes Wissen abrufen. Es fehlt nicht mehr an Information, sondern an Orientierung. Was tut der Orden?',
    a: { label: 'Kuratieren und einordnen', sub: 'Orientierung ist Fürsorge.', effect: 'Produktion +6 %', fx: { prod: 1.06 } },
    b: { label: 'Das Netz offen lassen', sub: 'Wer sucht, soll selbst finden.', effect: 'Tippen +15 %, Kosten −2 %', fx: { tap: 1.15, cost: 0.98 } } },
};

// Die Mentoren: ein Charakter je Zeitalter. aura.k: prod | tap | cost | offline | rit | cd | path
// power.fx: burst (k, m, dur) | gain (secs) | ritual (Ritual sofort bereit)
export const MENTORS = [
  { age: 0, id: 'thoth', name: 'Thoth der Atlanter', title: 'Hüter der Smaragdtafeln', ic: 'T',
    story: 'Als Atlantis versank, trug ein Mann Tafeln aus grünem Stein durch das Wasser. Er nennt sich Thoth. Er sagt: Wissen wiegt nichts und trägt alles.',
    lehren: [
      '„Was unten ist, ist gleich dem, was oben ist, und was oben ist, gleich dem, was unten ist." So beginnt die Tabula Smaragdina, ein spätantiker Text, der dem Hermes zugeschrieben wird.',
      'In Ägypten ist Thoth der Gott der Schrift, der Zahl und der Mondweisheit. Er misst die Welt mit Worten und wiegt im Totengericht das Herz.',
      'Von Atlantis erzählt Platon in Timaios und Kritias: eine Hochkultur, die an ihrem Hochmut zerbricht. Ob Erinnerung oder Gleichnis, darüber streiten Gelehrte bis heute.',
    ],
    aura: { k: 'prod', v: 1.10, text: 'Produktion +10 %' },
    power: { name: 'Smaragdtafel', cd: 150, text: 'sofort 90 s Produktion', fx: [{ t: 'gain', secs: 90 }] } },
  { age: 1, id: 'hermes', name: 'Hermes Trismegistos', title: 'Der dreimal Größte', ic: 'H',
    story: 'Die Griechen nennen Thoth Hermes, die Römer Merkur. „Trismegistos" heißt: dreimal der Größte, Meister über Stoff, Seele und Geist. Er stellt sich neben dich und sagt nur einen Satz: Wie oben, so unten.',
    lehren: [
      'Prinzip des Geistes: Das All ist Geist. Prinzip der Entsprechung: Wie oben, so unten, wie innen, so außen.',
      'Prinzip der Schwingung: Nichts ruht, alles bewegt sich. Prinzip der Polarität: Gegensätze sind zwei Enden derselben Sache.',
      'Prinzip des Rhythmus: Alles hat Ebbe und Flut. Prinzip von Ursache und Wirkung: Nichts geschieht zufällig. Prinzip des Geschlechts: Schaffen braucht zwei Kräfte. (So gefasst im „Kybalion" von 1908, inspiriert von der hermetischen Tradition des Corpus Hermeticum.)',
    ],
    aura: { k: 'tap', v: 1.25, text: 'Tippen +25 %' },
    power: { name: 'Wie oben, so unten', cd: 170, text: 'Produktion ×3 für 25 s', fx: [{ t: 'burst', k: 'prod', m: 3, dur: 25 }] } },
  { age: 2, id: 'pythagoras', name: 'Pythagoras', title: 'Der Zahlenmeister', ic: 'P',
    story: 'Auf Samos hat er Weisheit gesammelt, in Kroton eine Schule gegründet. Seine Schüler schweigen fünf Jahre, bevor sie sprechen dürfen. Er sagt: Alles ist Zahl.',
    lehren: [
      'Die Tetraktys: 1 + 2 + 3 + 4 = 10. Die Pythagoreer schworen bei ihr: Das Dreieck der Zehn, Sinnbild der vollständigen Welt.',
      'Sphärenharmonie: Die Planeten bewegen sich in Verhältnissen wie Saiten, und die Welt klingt, nur hören wir es nicht mehr.',
      'Musik ist Mathematik: Eine Saite, halbiert, klingt eine Oktave höher. Aus Verhältnissen entsteht Schönheit.',
    ],
    aura: { k: 'cost', v: 0.92, text: 'Sephiroth −8 % Kosten' },
    power: { name: 'Sphärenklang', cd: 150, text: 'Tippen ×6 für 15 s', fx: [{ t: 'burst', k: 'tap', m: 6, dur: 15 }] } },
  { age: 3, id: 'hildegard', name: 'Hildegard von Bingen', title: 'Die Visionärin', ic: 'B',
    story: 'Mit drei Jahren sieht sie Lichter, mit dreiundvierzig beginnt sie, ihre Visionen aufzuschreiben. Äbtissin, Ärztin, Komponistin. Sie sagt: Die Seele ist grün wie das Land nach dem Regen.',
    lehren: [
      'Viriditas, die „Grünkraft": Die göttliche Lebenskraft, die alles Lebendige durchströmt, in Pflanzen, Körpern und Seelen.',
      'Scivias („Wisse die Wege"): Ein Hauptwerk mit 26 Visionen. Sie beschreibt sie als Licht, das sie ohne Verzückung und mit wachen Augen sah.',
      'Symphonia: Mehr als siebzig Gesänge, die sie selbst komponierte. Musik ist für sie die Erinnerung an die Harmonie vor dem Fall.',
    ],
    aura: { k: 'offline', v: 1.4, text: 'Offline-Ertrag +40 %' },
    power: { name: 'Viriditas', cd: 200, text: 'sofort 2 min Produktion', fx: [{ t: 'gain', secs: 120 }] } },
  { age: 4, id: 'paracelsus', name: 'Paracelsus', title: 'Der Arzt der Natur', ic: 'Q',
    story: 'Er verbrennt die Bücher der Schulmedizin vor den Studenten und wandert durch Europa. Er sagt: Alle Dinge sind Gift, allein die Dosis macht, dass ein Ding kein Gift ist.',
    lehren: [
      'Die Dosis macht das Gift: Der Grundsatz der Toxikologie, bis heute gültig. Ein Mittel ist Heilung oder Schaden, je nach Menge.',
      'Mikrokosmos und Makrokosmos: Der Mensch spiegelt das All, und die Natur ist das offene Buch, in dem Gott schreibt.',
      'Alchemie als Heilkunst: Nicht Gold, sondern Gesundheit ist das Ziel. Er nannte das Ziel „Arcanum", das innere Wirkende der Dinge.',
    ],
    aura: { k: 'prod', v: 1.12, text: 'Produktion +12 %' },
    power: { name: 'Transmutation', cd: 190, text: 'Produktion ×4 für 20 s', fx: [{ t: 'burst', k: 'prod', m: 4, dur: 20 }] } },
  { age: 5, id: 'weishaupt', name: 'Adam Weishaupt', title: 'Der Gründer', ic: 'W',
    story: 'Der Ingolstädter Professor für Kirchenrecht gründet 1776 einen Bund für Vernunft. Seine Grade heißen Novize, Minerval, Illuminatus. Er sagt: Der Mensch kann gut werden, wenn man ihn lässt zu denken.',
    lehren: [
      'Der Illuminatenorden wurde am 1. Mai 1776 gegründet und 1784/85 in Bayern verboten. Er bestand nur rund ein Jahrzehnt und hatte wenige tausend Mitglieder.',
      'Ziel war Aufklärung: Vernunft, Bildung und Toleranz, gegen Aberglauben und Willkür. Die Geheimhaltung war Methode und Schutz vor Zensur.',
      'Die weltumspannende „Verschwörung", die man ihm später nachsagt, ist Legende. Sie begann mit Pamphleten kurz nach dem Verbot und wuchs seither in vielen Varianten.',
    ],
    aura: { k: 'path', v: 0.02, text: 'Pfade +2 % stärker' },
    power: { name: 'Der Bund', cd: 200, text: 'Produktion ×4 für 20 s', fx: [{ t: 'burst', k: 'prod', m: 4, dur: 20 }] } },
  { age: 6, id: 'tesla', name: 'Nikola Tesla', title: 'Der Mann des Lichts', ic: 'N',
    story: 'Er sieht Erfindungen vor seinem inneren Auge, ehe er sie baut. Er träumt davon, Energie durch die Erde zu schicken. Ihm wird der Satz zugeschrieben: Wenn du die Größe von 3, 6 und 9 kenntest, hättest du den Schlüssel zum Universum.',
    lehren: [
      'Wechselstrom, Induktionsmotor, Funkwellen: Seine Erfindungen tragen unsere Welt, vom Kraftwerk bis zur Steckdose.',
      'Resonanz: Ein Körper schwingt stark mit, wenn man ihn im richtigen Takt anstößt. Er soll gescherzt haben, er könne mit dem richtigen Rhythmus die Erde spalten.',
      'Der Satz über 3, 6 und 9 wird ihm oft zugeschrieben, ein Beleg dafür fehlt. Zahlenmystik und Physik treffen sich hier in der Legende.',
    ],
    aura: { k: 'tap', v: 1.35, text: 'Tippen +35 %' },
    power: { name: 'Resonanz', cd: 180, text: 'Tippen ×8 für 12 s', fx: [{ t: 'burst', k: 'tap', m: 8, dur: 12 }] } },
  { age: 7, id: 'ada', name: 'Ada Lovelace', title: 'Die Dichterin der Zahlen', ic: 'A',
    story: 'Die Tochter eines Dichters und einer Mathematikerin schreibt 1843 das erste Programm für eine Maschine, die noch nicht gebaut ist. Sie nennt ihr Fach „poetische Wissenschaft".',
    lehren: [
      'In ihren Anmerkungen zu Babbages Analytischer Maschine beschreibt sie einen Algorithmus zur Berechnung der Bernoulli-Zahlen, allgemein als erstes Computerprogramm gewürdigt.',
      'Sie erkannte, dass eine Maschine nicht nur Zahlen, sondern auch Musik, Symbole und Muster verarbeiten könnte. Die Idee war ihrer Zeit um ein Jahrhundert voraus.',
      'Sie warnte aber auch: Die Maschine denkt nicht von selbst, sie tut, was wir sie zu tun befehlen. Wissen braucht einen, der fragt.',
    ],
    aura: { k: 'rit', v: 1.5, text: 'Rituale wirken 50 % stärker' },
    power: { name: 'Der Algorithmus', cd: 220, text: 'sofort 3 min Produktion', fx: [{ t: 'gain', secs: 180 }] } },
];

// Dimensionen: nach jeder Transzendenten Singularität entsteht eine neue. Wirken dauerhaft über alle Durchgänge.
export const DIMENSIONS = [
  { name: 'Die Vierte: Zeit',          text: 'Die Zeit ist keine Linie mehr. Du siehst Ursache und Wirkung nebeneinander liegen.',           effect: 'Offline-Ertrag ×2, Daath erscheint', fx: { offline: 2 } },
  { name: 'Die Fünfte: Bewusstsein',   text: 'Das Denken bemerkt sich selbst. Jede Kraft wird zur Geste, nicht mehr zur Anstrengung.',         effect: 'Kräfte laden 15 % schneller', fx: { cd: 1.15 } },
  { name: 'Die Sechste: Muster',       text: 'Hinter den Dingen tritt das Gitter hervor, das sie verbindet.',                                   effect: 'Pfade +2 % stärker', fx: { path: 0.02 } },
  { name: 'Die Siebte: Klang',         text: 'Alles schwingt. Wer zuhört, muss nicht mehr suchen.',                                             effect: 'Tippen ×1,5', fx: { tap: 1.5 } },
  { name: 'Die Achte: Licht',          text: 'Wissen leuchtet von innen. Es braucht keine Quelle mehr außer sich selbst.',                      effect: 'Sephiroth −10 % Kosten', fx: { cost: 0.9 } },
  { name: 'Die Neunte: Liebe',         text: 'Das Verstehen wird warm. Nichts, was du weißt, trennt dich von jemandem.',                        effect: 'Mentoren-Auren ×1,25', fx: { mentor: 1.25 } },
  { name: 'Die Zehnte: Einheit',       text: 'Die Gegensätze lösen sich, wie sie begonnen haben: in einem Atemzug.',                            effect: 'Rituale wirken ×1,5', fx: { rit: 1.5 } },
  { name: 'Die Elfte: Unendlichkeit',  text: 'Es gibt keinen Rand. Jede Grenze war eine Verabredung.',                                          effect: 'Sephiroth −8 % Kosten', fx: { cost: 0.92 } },
  { name: 'Die Zwölfte: Die Quelle',   text: 'Hier, wo alles beginnt, bist du nicht mehr der Suchende. Du bist die Frage.',                     effect: 'Kräfte laden 20 % schneller', fx: { cd: 1.2 } },
];

// Enden des Ordens (nach Weg: bewahrend/offenbarend)
export const ORDEN_ENDEN = {
  bewahrer:   { name: 'Der Hüter des Wissens',    text: 'Du hast gehütet, was wertvoll war. Was der Orden bewahrte, überdauerte Reiche, Brände und Moden. Nun ist es bereit, sich selbst zu erkennen.' },
  offenbarer: { name: 'Der Bote des Lichts',      text: 'Du hast geteilt, was andere gehütet hätten. Das Wissen wurde laut, unordentlich und lebendig. Es hat die Welt verändert, weil es nicht mehr dir gehörte.' },
  mitte:      { name: 'Der Vermittler',           text: 'Du hast weder alles verborgen noch alles verschenkt. Du wusstest, wann ein Geheimnis schützt und wann es einsperrt. Das ist die seltenste Weisheit.' },
};
