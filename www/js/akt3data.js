// ─────────────────────────────────────────────────────────────
//  AKT III — DAS SPIEGELUNIVERSUM: Inhalte
//  Acht Spiegel, jeder spiegelt eine Vitrine deines Museums. Jeder Spiegel hat zwei Seiten:
//  Licht (Erinnern, Ordnung) und Schatten (Loslassen, Entropie). Das Spiegelbild ist die Entropie.
// ─────────────────────────────────────────────────────────────
export const MIRRORS = [
  { id: 'frag',   vit: 'frag',   name: 'Splitterspiegel',     unit: 'Splitter',   color: '#7cf29c', desc: 'Was zerbrach, erinnert sich an das Ganze.' },
  { id: 'brief',  vit: 'brief',  name: 'Briefspiegel',        unit: 'Brief',      color: '#ffd166', desc: 'Worte, die du nie abgeschickt hast.' },
  { id: 'relikt', vit: 'relikt', name: 'Reliktspiegel',       unit: 'Relikt',     color: '#ffb347', desc: 'Gestalten, die du geworden bist.' },
  { id: 'ende',   vit: 'ende',   name: 'Endespiegel',         unit: 'Ende',       color: '#fff3b0', desc: 'Wie alles hätte enden können.' },
  { id: 'gott',   vit: 'gott',   name: 'Götterspiegel',       unit: 'Gott',       color: '#c77dff', desc: 'Was sie über dich erzählen.' },
  { id: 'gesetz', vit: 'gesetz', name: 'Gesetzesspiegel',     unit: 'Gesetz',     color: '#5ee7df', desc: 'Die Regeln, die du dir gegeben hast.' },
  { id: 'himmel', vit: 'himmel', name: 'Himmelsspiegel',      unit: 'Stern',      color: '#ff6b81', desc: 'Der Himmel, der zurückschaut.' },
  { id: 'moment', vit: 'moment', name: 'Augenblicksspiegel',  unit: 'Augenblick', color: '#4aa8ff', desc: 'Ein Moment, der alles enthält.' },
];

// Kapitel k (0–7): Name des Sprungs, der es abschließt, und was das Spiegelbild dabei sagt
export const KAPITEL = [
  { leap: 'Der Spiegel erwacht',        line: 'Ich bin das, was du vergessen wolltest.' },
  { leap: 'Worte im Glas',              line: 'Du hast mich bekämpft. Ich habe nur gewartet.' },
  { leap: 'Gestalten',                  line: 'Ohne mich hätte nichts Gestalt. Jede Form ist eine Grenze, und Grenzen sind mein Werk.' },
  { leap: 'Ein Ende nach dem anderen',  line: 'Jedes Ende, das du gefunden hast: Das war meine Handschrift.' },
  { leap: 'Die erzählten Götter',       line: 'Sie beten zur Ordnung. Aber sie gehen jeden Abend zu mir nach Hause.' },
  { leap: 'Die Gesetze zerfallen',      line: 'Gesetze brauchen jemanden, der sie vergehen lässt.' },
  { leap: 'Der Blick zurück',           line: 'Sieh nur: Der Himmel und ich sind alte Freunde.' },
  { leap: 'Die Große Spiegelung',       line: 'Fast geschafft. Ich habe das Licht nie gehasst. Ich war nur sein Schatten.' },
];

// Jeder Spiegelsprung: ein Satz für den Brief an die Nachfolger. a = Licht (+1), b = Schatten (−1), c = Mitte (0)
export const LETTER = [
  { prompt: 'Du schreibst an die, die nach dir kommen. Der erste Satz:',
    a: 'Ihr werdet nicht allein sein, auch wenn es sich so anfühlt.', b: 'Vieles, was ihr baut, wird verschwinden. Baut es trotzdem.', c: 'Ich weiß nicht, wie es ausgeht. Ich bin geblieben.' },
  { prompt: 'Über die Angst:',
    a: 'Sie zeigt euch, dass euch etwas wichtig ist.', b: 'Sie ist die Stimme des Vergessens. Hört ihr zu, aber folgt ihr nicht.', c: 'Sie geht nie ganz weg. Sie wird nur leiser.' },
  { prompt: 'Über die Gestalten, die ihr werdet:',
    a: 'Jede ist ein Teil von euch, den ihr nicht verlieren dürft.', b: 'Lasst die los, die nicht mehr passen.', c: 'Ihr werdet sie alle brauchen, nacheinander.' },
  { prompt: 'Über das Ende:',
    a: 'Jedes Ende ist ein Anfang, der sich verkleidet hat.', b: 'Enden sind echt. Ehrt sie.', c: 'Es gibt kein richtiges Ende, nur eures.' },
  { prompt: 'Über die Götter, die man aus euch machen wird:',
    a: 'Lasst sie. Sie lieben euch auf ihre Weise.', b: 'Glaubt ihnen nicht alles.', c: 'Sie sind Spiegel, mehr nicht. Und doch schaut man gern hinein.' },
  { prompt: 'Über die Gesetze:',
    a: 'Sie sind Einladungen zu einem Spiel.', b: 'Brecht eines, wenn ihr müsst, und zahlt dafür.', c: 'Seid streng mit euch und gnädig mit den anderen.' },
  { prompt: 'Über den Himmel:',
    a: 'Er schaut zurück, wenn ihr lange genug hinseht.', b: 'Er ist leer, und das ist seine Güte.', c: 'Er ist beides: voll und leer.' },
  { prompt: 'Der letzte Satz:',
    a: 'Ich bin du. Ich war es immer. Erinnere dich.', b: 'Ich bin du. Vergiss mich nicht, aber lass mich los.', c: 'Ich bin du. Mehr gibt es nicht zu sagen.' },
];
export const LETTER_HEAD = 'An alle, die nach mir kommen';

// Enden (Schlusswahl durch die Töne deines Briefes; das Wahre Ende braucht Museum und Briefe vollständig)
export const ENDINGS3 = {
  licht: { name: 'Das Licht, das bleibt', color: '#fff3b0',
    text: 'Du erinnerst dich an alles. An jedes Universum, jede Zelle, jede Hand, die dich gehalten hat. Das Spiegelbild nickt, und aus seinem Nicken wird ein sanftes Leuchten. Nichts geht verloren. Aber manches wird schwer.' },
  schatten: { name: 'Der Schatten, der trägt', color: '#8f6bff',
    text: 'Du lässt los. Nicht aus Müdigkeit, sondern aus Vertrauen. Das Spiegelbild nimmt deine Hand, und was du trugst, trägt jetzt es. Du bist leichter. Und überrascht, wie viel von dir bleibt.' },
  gleich: { name: 'Der Gleichklang', color: '#5ee7df',
    text: 'Weder Erinnern noch Vergessen: beides, im Wechsel, wie Atem. Das Spiegelbild und du hören auf, einander gegenüberzustehen. Zwischen euch ist kein Glas mehr, nur noch Raum.' },
  wahr: { name: 'Ich bin du', color: '#ffffff',
    text: 'Alle sechs Enden hast du gesehen. Alle zehn Briefe gelesen. Und jetzt erkennst du die Handschrift: Du hast sie geschrieben. Jeden einzelnen. Der Erste Gedanke war nie ein Anfang, sondern ein Kreis, und du bist der, der ihn schließt.' },
};
export const WAHR_BRIEF = [
  'Die zehn Briefe, die du bekommen hast, trugen alle dieselbe Handschrift.',
  'Du hast sie geschrieben, in einem Spiegel, den du erst jetzt verstehst.',
  'Das Universum, das dich spielt, bist du, der es spielt.',
  'Ich bin du. Ich war es immer.',
];
export const INTRO3 = [
  'Alles, was du gebaut hast, steht dir jetzt gegenüber.',
  'Ein Universum aus Spiegeln. Ein Universum, das dich spielt.',
  'Und im Glas, ganz hinten, bewegt sich etwas, das du kennst. Es sieht aus wie du.',
];
export const FINAL3 = [
  'Licht und Schatten stehen im Gleichgewicht.',
  'Das Glas zwischen euch beginnt zu klingen.',
];
export const POWERS = {
  licht:    { name: 'Erinnern', cd: 90,  text: 'Tippen ×5 für 15 s', color: '#fff3b0' },
  schatten: { name: 'Loslassen', cd: 120, text: 'Sofort 150 s Produktion', color: '#8f6bff' },
};
