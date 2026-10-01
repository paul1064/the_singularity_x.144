// ─────────────────────────────────────────────────────────────
//  Akt II — Schicksalsebenen: Deutungen aus den berechneten Daten (Symbolsprache, keine Wissenschaft)
//  lesen(layer, a) → { title, blocks:[{h,p}], world, note }   a = mystik.analyse(...)
// ─────────────────────────────────────────────────────────────
import { SIGNS, RULERS, elementOf, signOf, aspectBetween, PLANETS } from './mystik.js';
import { SEPHIROTH, AGES, gi } from './akt2data.js';

export const LAYER_TITLES = ['Dein Kern', 'Deine Seele', 'Dein Pfad im Baum', 'Dein Bauplan', 'Dein Himmel', 'Dein Zyklus', 'Das Große Werk'];
export const HINWEIS = 'Astrologie, Numerologie, Kabbalah und Human Design sind Symbolsprachen, keine Wissenschaft. Nimm die Deutungen als Einladung zum Nachdenken, nicht als Urteil.';

const SUN = ['Der Anfang selbst: mutig, direkt, ungeduldig mit Stillstand. Du gehst voran, bevor der Weg fertig ist.',
  'Verlässlich, sinnlich, beharrlich. Du baust, was bleibt, und lässt dich nicht hetzen.',
  'Neugierig, wendig, verbindend. Du denkst in Fragen, und jede Antwort gebiert zwei neue.',
  'Schützend, fühlend, erinnernd. Du trägst ein Zuhause in dir und spürst, was anderen fehlt.',
  'Strahlend, großzügig, schöpferisch. Du willst gesehen werden, um andere zu wärmen.',
  'Genau, dienend, prüfend. Du siehst das Detail, in dem die Wahrheit wohnt.',
  'Ausgleichend, ästhetisch, beziehungsorientiert. Du suchst die Mitte, in der Gegensätze tanzen.',
  'Tief, intensiv, wandelnd. Du gehst dorthin, wo andere wegsehen, und kommst verändert zurück.',
  'Weit, suchend, optimistisch. Du brauchst Horizonte und einen Sinn, der größer ist als du.',
  'Ausdauernd, strukturiert, ernsthaft. Du steigst den Berg, weil der Gipfel Verantwortung bedeutet.',
  'Eigenständig, visionär, menschenfreundlich. Du denkst an eine Zukunft, die noch niemand gebaut hat.',
  'Durchlässig, mitfühlend, träumerisch. Du spürst, wie dünn die Grenzen der Welt sind.'];
const MOON = ['Gefühle kommen schnell und klar. Du brauchst Bewegung, um dich zu spüren.',
  'Du brauchst Ruhe, Berührung und Verlässlichkeit, dann fühlst du dich zuhause.',
  'Du verarbeitest Gefühle durch Sprechen und Denken. Abwechslung nährt dich.',
  'Tiefe Bindungsfähigkeit. Sicherheit und Erinnerungen sind dein Nest.',
  'Du brauchst Wärme, Anerkennung und Spielfreude, um dich sicher zu fühlen.',
  'Ordnung beruhigt dich. Du zeigst Zuneigung durch Hilfe im Detail.',
  'Harmonie ist dein Nährboden. Streit kostet dich mehr als andere.',
  'Gefühle gehen bei dir in die Tiefe, ganz oder gar nicht. Vertrauen lässt du dir verdienen.',
  'Freiheit und Sinn geben dir Halt. Enge macht dich unruhig.',
  'Du zeigst Gefühle zurückhaltend und trägst viel still. Verlässlichkeit ist deine Liebessprache.',
  'Du brauchst Raum und Verbundenheit zugleich: nah sein, ohne zu verschmelzen.',
  'Du nimmst die Stimmungen anderer auf wie ein Schwamm. Rückzug und Träume laden dich auf.'];
const ELEMENT_WELT = {
  Feuer: 'Die Geschichte deines Ordens verläuft in Sprüngen: Entdeckungen, Brände, plötzliche Wenden, die Mut belohnen.',
  Erde: 'Die Geschichte deines Ordens wächst langsam und trägt Früchte: Bauwerke, Bibliotheken, Institutionen, die Jahrhunderte überdauern.',
  Luft: 'Die Geschichte deines Ordens lebt vom Austausch: Briefe, Druckerpressen, Netze. Ideen wandern schneller als Menschen.',
  Wasser: 'Die Geschichte deines Ordens fließt durch Erinnerung: Mythen, Bilder und Bewegungen, die Herzen erreichen, ehe Köpfe verstehen.',
};
const ZAHL = { 1: 'Anfang und Eigenständigkeit', 2: 'Verbindung und Feingefühl', 3: 'Ausdruck und Freude', 4: 'Ordnung und Aufbau', 5: 'Freiheit und Wandel', 6: 'Fürsorge und Schönheit', 7: 'Suche und Stille', 8: 'Wirkung und Verantwortung', 9: 'Mitgefühl und Vollendung', 11: 'Inspiration und feine Intuition', 22: 'der Meisterbauer, der Visionen baut', 33: 'der Meisterlehrer, der durch Mitgefühl lehrt' };
const LEBENSWEG = { 1: 'Der Weg des Anfangs: Eigenständigkeit, Mut und Führung aus eigener Kraft.', 2: 'Der Weg der Verbindung: Feingefühl, Kooperation, stille Diplomatie.', 3: 'Der Weg des Ausdrucks: Kreativität, Worte und eine Freude, die andere ansteckt.', 4: 'Der Weg des Fundaments: Ordnung, Verlässlichkeit, geduldiger Aufbau.', 5: 'Der Weg der Freiheit: Wandel, Erfahrung und Neugier auf alles.', 6: 'Der Weg der Fürsorge: Verantwortung, Schönheit, Zuhause und Gemeinschaft.', 7: 'Der Weg der Suche: Analyse, Stille und der Sinn hinter den Dingen.', 8: 'Der Weg der Wirkung: Ausdauer, Materie formen und die Verantwortung dafür tragen.', 9: 'Der Weg der Vollendung: Mitgefühl, Weite und das Loslassen.', 11: 'Meisterzahl 11: feine Intuition, Inspiration, ein Antennenherz.', 22: 'Meisterzahl 22: der Meisterbauer, der Visionen in Wirklichkeit baut.', 33: 'Meisterzahl 33: der Meisterlehrer, der durch Mitgefühl lehrt.' };
const SEPH = { 1: 'Die Krone: der Ursprung, der reine Wille zum Sein. Was vor jeder Form war.', 2: 'Die Weisheit: der erste Blitz des Wissens, ungeformt und schöpferisch.', 3: 'Das Verstehen: die große Mutter, die Formen gibt und Zeit gebiert.', 4: 'Die Gnade: freigiebige Liebe, Ausdehnung, Fülle.', 5: 'Die Strenge: Grenze, Mut und Urteilskraft. Was nicht nötig ist, fällt.', 6: 'Die Schönheit: die Mitte, in der Gegensätze sich versöhnen. Das Herz des Baumes.', 7: 'Der Sieg: Ausdauer, Begehren, Kunst, der Drang zu schaffen.', 8: 'Der Glanz: Verstand, Sprache, Ordnung. Wissen, das sich mitteilt.', 9: 'Das Fundament: Träume, Bilder, das Unbewusste. Der Speicher der Seele.', 10: 'Das Reich: die Materie, in der sich alles zeigt. Hier wird Geist Wirklichkeit.' };
const sephName = (n) => SEPHIROTH[gi(n)].name;

export const GATE_NAMES = [null, 'Das Schöpferische', 'Das Empfangende', 'Die Anfangsschwierigkeit', 'Die Jugendtorheit', 'Das Warten', 'Der Streit', 'Das Heer', 'Das Zusammenhalten', 'Des Kleinen Zähmungskraft', 'Das Auftreten', 'Der Friede', 'Die Stockung', 'Gemeinschaft mit Menschen', 'Der Besitz von Großem', 'Die Bescheidenheit', 'Die Begeisterung', 'Die Nachfolge', 'Die Arbeit am Verdorbenen', 'Die Annäherung', 'Die Betrachtung', 'Das Durchbeißen', 'Die Anmut', 'Die Zersplitterung', 'Die Wiederkehr', 'Die Unschuld', 'Des Großen Zähmungskraft', 'Die Ernährung', 'Des Großen Übergewicht', 'Das Abgründige', 'Das Haftende', 'Die Einwirkung', 'Die Dauer', 'Der Rückzug', 'Des Großen Macht', 'Der Fortschritt', 'Die Verfinsterung des Lichts', 'Die Sippe', 'Der Gegensatz', 'Das Hemmnis', 'Die Befreiung', 'Die Minderung', 'Die Mehrung', 'Der Durchbruch', 'Das Entgegenkommen', 'Die Sammlung', 'Das Empordringen', 'Die Bedrängnis', 'Der Brunnen', 'Die Umwälzung', 'Der Tiegel', 'Das Erregende', 'Das Stillehalten', 'Die Entwicklung', 'Das heiratende Mädchen', 'Die Fülle', 'Der Wanderer', 'Das Sanfte', 'Das Heitere', 'Die Auflösung', 'Die Beschränkung', 'Innere Wahrheit', 'Des Kleinen Übergewicht', 'Nach der Vollendung', 'Vor der Vollendung'];
export const LINIEN = { 1: ['Fundament', 'forscht gründlich und sichert ab, bevor sie handelt'], 2: ['Naturtalent', 'wirkt am besten, wenn man sie in Ruhe lässt, und wird dann gerufen'], 3: ['Erfahrung', 'lernt durch Ausprobieren, auch durch Fehler, und wird so zur Fachfrau des Lebens'], 4: ['Netzwerk', 'wirkt durch Beziehungen, Freundschaft und Vertrauen'], 5: ['Wirkung', 'wird als Problemlöserin gesehen und muss lernen, Erwartungen zu filtern'], 6: ['Vorbild', 'durchlebt Lebensphasen, die am Ende zur Weisheit reifen'] };
export const PROFILE = { '1/3': 'Forscher/Märtyrer', '1/4': 'Forscher/Opportunist', '2/4': 'Eremit/Opportunist', '2/5': 'Eremit/Häretiker', '3/5': 'Märtyrer/Häretiker', '3/6': 'Märtyrer/Rollenvorbild', '4/6': 'Opportunist/Rollenvorbild', '4/1': 'Opportunist/Forscher', '5/1': 'Häretiker/Forscher', '5/2': 'Häretiker/Eremit', '6/2': 'Rollenvorbild/Eremit', '6/3': 'Rollenvorbild/Märtyrer' };
const ASPEKT = { konjunktion: 'Sonne und Mond stehen beieinander: Wille und Gefühl ziehen am selben Strang. Du wirkst geschlossen, manchmal einseitig.', sextil: 'Sonne und Mond unterstützen sich: Wille und Gefühl spielen freundlich zusammen.', quadrat: 'Sonne und Mond reiben sich: eine innere Spannung, die dich antreibt und fordert.', trigon: 'Sonne und Mond fließen zusammen: eine Begabung, die dir leicht fällt.', opposition: 'Sonne und Mond stehen sich gegenüber: Du suchst die Balance zwischen Kopf und Bauch, oft durch Beziehungen.', keiner: 'Sonne und Mond gehen eigene Wege: Wille und Gefühl wirken unabhängig voneinander, mit viel Freiraum.' };
const PHASE = { 'Neumond': 'Geboren im Dunkel des Anfangs: Du bist ein Same, Instinkt vor Plan.', 'Zunehmende Sichel': 'Du kämpfst dich aus dem Alten heraus: ein starker Wille zu wachsen.', 'Erstes Viertel': 'Du handelst, entscheidest und räumst Hürden ab.', 'Zunehmender Mond': 'Du verfeinerst, arbeitest und perfektionierst.', 'Vollmond': 'Du siehst beide Seiten: Bewusstsein, Beziehung, Klarheit.', 'Abnehmender Mond': 'Du teilst, gibst weiter und lehrst.', 'Letztes Viertel': 'Du hinterfragst, baust um und lässt los.', 'Abnehmende Sichel': 'Du schließt Kreise und vermittelst Weisheit: der Dienende.' };
const PJAHR = { 1: 'Neubeginn: Säe, was wachsen soll.', 2: 'Geduld und Beziehung: Reife braucht Zeit.', 3: 'Ausdruck und Kreativität: Zeig, was in dir ist.', 4: 'Fundament und Arbeit: Baue, was trägt.', 5: 'Veränderung und Freiheit: Erlaube dir Bewegung.', 6: 'Verantwortung und Zuhause: Kümmere dich um das Nächste.', 7: 'Rückzug und Reflexion: Höre nach innen.', 8: 'Ernte und Wirkung: Sieh, was gewachsen ist.', 9: 'Abschluss und Loslassen: Mach Platz für Neues.' };
const PLANET_THEMA = { jupiter: ['Jupiter', 'Wachstum, Sinn und Chancen'], saturn: ['Saturn', 'Verantwortung, Struktur und Prüfungen'], uranus: ['Uranus', 'Umbruch und plötzliche Freiheit'], neptune: ['Neptun', 'Vision, Träume und die Auflösung von Grenzen'], pluto: ['Pluto', 'tiefgreifenden Wandel von Macht und Strukturen'] };
const ASPEKT_KURZ = { konjunktion: 'Dieses Thema trifft dich direkt, es geht um dich.', sextil: 'Es öffnet dir Türen, wenn du sie nutzt.', quadrat: 'Es fordert dich heraus und bringt dich in Bewegung.', trigon: 'Es trägt dich wie Rückenwind.', opposition: 'Es steht dir gegenüber und verlangt Balance.' };

const fmtDate = (d) => d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
const sign = (lon) => SIGNS[signOf(lon)];

// resonante Epoche einer Sephira (gen-Index i schaltet im Zeitalter max(0, i−2) frei)
const resAge = (seph) => Math.max(0, gi(seph) - 2);

export function lesen(layer, a) {
  const L = [];
  let world = '', title = LAYER_TITLES[layer];
  if (layer === 0) {
    L.push({ h: `Sonne in ${SIGNS[a.sun]} (${a.sunElement})`, p: SUN[a.sun] });
    L.push({ h: `Lebensweg ${a.lebensweg}`, p: LEBENSWEG[a.lebensweg] });
    L.push({ h: `Herrscher: ${RULERS[a.sun]}`, p: `In der Hermetik gehört ${RULERS[a.sun]} zur Sephira ${sephName(a.sonnenSephira)}. Dort schlägt die Kraft deines Zeichens am stärksten.` });
    world = ELEMENT_WELT[a.sunElement];
  } else if (layer === 1) {
    L.push({ h: `Mond in ${SIGNS[a.moon]} (${a.moonElement})`, p: MOON[a.moon] + (a.hasTime ? '' : ' (Ohne Geburtszeit auf Mittag gerechnet, der Mond kann um bis zu 6° abweichen.)') });
    const n = a.name;
    L.push({ h: `Ausdruckszahl ${n.ausdruck}`, p: `Dein Name trägt die Schwingung ${ZAHL[n.ausdruck]}.` });
    L.push({ h: `Seelenzahl ${n.seele}`, p: `Aus den Vokalen deines Namens: ${ZAHL[n.seele]}. Das, wonach du im Innersten suchst.` });
    L.push({ h: `Persönlichkeitszahl ${n.persoenlichkeit}`, p: `Aus den Konsonanten: ${ZAHL[n.persoenlichkeit]}. So wirkst du nach außen.` });
    world = `Die Stimmung der Welt folgt deinem Mond: Sie ist ${a.moonElement === 'Feuer' ? 'bewegt und entschlossen' : a.moonElement === 'Erde' ? 'ruhig und tragend' : a.moonElement === 'Luft' ? 'beweglich und gesprächig' : 'tief und erinnernd'}, und der Orden spürt, wann eine Zeit reif ist.`;
  } else if (layer === 2) {
    L.push({ h: `Deine Sephira: ${sephName(a.lebensSephira)}`, p: `Aus deinem Lebensweg ${a.lebensweg}: ${SEPH[a.lebensSephira]}` });
    L.push({ h: `Dein Name im Baum: ${sephName(a.gematriaSephira)}`, p: `Die Buchstabenwerte deines Namens ergeben ${a.gematria} (Gematria, A = 1 bis Z = 26). Reduziert führt das zu ${sephName(a.gematriaSephira)}: ${SEPH[a.gematriaSephira]}` });
    L.push({ h: `Die Sephira deiner Sonne: ${sephName(a.sonnenSephira)}`, p: `${SEPH[a.sonnenSephira]} Hier kreuzen sich dein Zeichen und der Baum.` });
    world = `Wo dein Baum am hellsten leuchtet, klingt die Zeit nach: ${sephName(a.lebensSephira)} schwingt im Zeitalter ${AGES[resAge(a.lebensSephira)].name}. Dort wirkt der Orden mit dir im Einklang.`;
  } else if (layer === 3) {
    const h = a.hd, P = h.personality, D = h.design, l1 = LINIEN[P.line], l2 = LINIEN[D.line];
    L.push({ h: `Bewusste Sonne: Tor ${P.gate}.${P.line}`, p: `${GATE_NAMES[P.gate]}. Linie ${P.line} („${l1[0]}") ${l1[1]}.` });
    L.push({ h: `Unbewusste Design-Sonne: Tor ${D.gate}.${D.line}`, p: `${GATE_NAMES[D.gate]}. Gerechnet auf den Zeitpunkt etwa 88 Tage vor deiner Geburt, am ${fmtDate(h.designDatum)}. Linie ${D.line} („${l2[0]}") ${l2[1]}.` });
    L.push({ h: `Profil ${h.profil}`, p: `${PROFILE[h.profil] || '—'}: Was du bewusst lebst (${l1[0]}) und was dich unbewusst formt (${l2[0]}).` });
    world = `Im Weltgeschehen entspricht dein Profil dem Muster ${PROFILE[h.profil] || h.profil}: Der Orden gewinnt, wenn er beides zugleich lebt.`;
  } else if (layer === 4) {
    const asp = a.aspekt, ph = a.geburtsphase.name;
    L.push({ h: asp ? `Sonne ${asp.name} Mond` : 'Sonne und Mond', p: ASPEKT[asp ? asp.id : 'keiner'] });
    L.push({ h: `Geburtsphase: ${ph}`, p: PHASE[ph] });
    L.push({ h: `Dein Gleichgewicht`, p: a.sunElement === a.moonElement ? `Sonne und Mond stehen beide im Element ${a.sunElement}: Du lebst, was du fühlst, sehr konzentriert.` : `Sonne im Element ${a.sunElement}, Mond im Element ${a.moonElement}: Du verbindest zwei Arten, die Welt zu erleben.` });
    world = asp && ['quadrat', 'opposition'].includes(asp.id) ? 'Die Welt deines Ordens kennt Reibung: Wendepunkte entstehen dort, wo Gegensätze aufeinandertreffen.' : 'Die Welt deines Ordens findet oft Wege, in denen Gegensätze einander dienen.';
  } else if (layer === 5) {
    L.push({ h: `Persönliches Jahr ${a.persJahr}`, p: PJAHR[a.persJahr] });
    L.push({ h: 'Saturnrückkehr', p: a.saturnrueckkehr ? `Dein Saturn kehrt das nächste Mal um ${fmtDate(a.saturnrueckkehr)} an seinen Geburtsort zurück. Die erste Rückkehr fällt in die späten Zwanziger: die Zeit, in der sich das Leben neu ordnet.` : 'Die nächste Saturnrückkehr liegt weit voraus.' });
    L.push({ h: 'Jupiterrückkehr', p: a.jupiterrueckkehr ? `Dein Jupiter kehrt um ${fmtDate(a.jupiterrueckkehr)} zurück, alle 12 Jahre ein Fenster für Wachstum und neue Horizonte.` : 'Die nächste Jupiterrückkehr liegt noch etwas entfernt.' });
    const lon = a.sunLon;
    const T = a.heute.transit;
    const lines = PLANETS.map((p) => {
      const asp = aspectBetween(T[p], lon), [nm, th] = PLANET_THEMA[p];
      return `${nm} in ${sign(T[p])}: ${th}. ${asp ? ASPEKT_KURZ[asp.id] : 'Er berührt dich nur am Rande.'}`;
    });
    L.push({ h: `Der Himmel heute (${fmtDate(new Date())})`, p: lines.join(' ') });
    world = `Die Welt von heute steht unter Pluto in ${sign(T.pluto)} und Saturn in ${sign(T.saturn)}: Wandel und Struktur ringen miteinander. Dein Orden spiegelt, was die echte Welt gerade durchlebt.`;
  } else {
    const e = a.lebensSephira, ns = a.name;
    L.push({ h: 'Dein Bild', p: `${SIGNS[a.sun]}-Sonne, ${SIGNS[a.moon]}-Mond, Lebensweg ${a.lebensweg}, Profil ${a.hd.profil}. Du bist ${a.sunElement === a.moonElement ? 'aus einem Guss' : 'ein Wesen zweier Elemente'}, geführt von ${sephName(e)}.` });
    const ber = ((a.lebensweg + ns.ausdruck) % 9) || 9;
    L.push({ h: `Deine Berufungszahl ${ber}`, p: `Aus Lebensweg und Ausdruckszahl: ${ZAHL[ber]}. Was dein Leben und dein Name zusammen rufen.` });
    L.push({ h: 'Das Große Werk', p: `Alles, was du hier erfahren hast, sind Spiegel: Sie zeigen dir nichts, was nicht schon in dir liegt. Der Orden hat sieben Durchgänge gebraucht, um dir zu zeigen, wer die Frage stellt.` });
    world = `Die Welt und du habt dieselbe Signatur: ${sephName(e)} im Baum, ${a.sunElement} in der Sonne. Die Sterne zwingen nichts, aber sie erinnern dich, dass du Teil eines größeren Musters bist.`;
  }
  return { title, blocks: L, world, note: HINWEIS };
}
