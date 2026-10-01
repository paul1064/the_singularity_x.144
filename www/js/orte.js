// ─────────────────────────────────────────────────────────────
//  Geburtsorte (offline): Name, Land, Breite, Länge, Zeitzone (IANA).
//  Die Zeitzone liefert die damals gültige Ortszeit samt Sommerzeit (Intl der Laufzeit kennt die Geschichte).
// ─────────────────────────────────────────────────────────────
// [Name, Land, Breite°N, Länge°O, Zeitzone]
export const ORTE = [
  ['Wien', 'Österreich', 48.21, 16.37, 'Europe/Vienna'], ['Graz', 'Österreich', 47.07, 15.44, 'Europe/Vienna'], ['Linz', 'Österreich', 48.31, 14.29, 'Europe/Vienna'],
  ['Salzburg', 'Österreich', 47.80, 13.04, 'Europe/Vienna'], ['Innsbruck', 'Österreich', 47.27, 11.39, 'Europe/Vienna'], ['Klagenfurt', 'Österreich', 46.62, 14.31, 'Europe/Vienna'],
  ['Bregenz', 'Österreich', 47.50, 9.75, 'Europe/Vienna'], ['St. Pölten', 'Österreich', 48.20, 15.63, 'Europe/Vienna'], ['Villach', 'Österreich', 46.61, 13.85, 'Europe/Vienna'],
  ['Wels', 'Österreich', 48.16, 14.03, 'Europe/Vienna'], ['Dornbirn', 'Österreich', 47.41, 9.74, 'Europe/Vienna'], ['Eisenstadt', 'Österreich', 47.85, 16.52, 'Europe/Vienna'],
  ['Berlin', 'Deutschland', 52.52, 13.41, 'Europe/Berlin'], ['Hamburg', 'Deutschland', 53.55, 9.99, 'Europe/Berlin'], ['München', 'Deutschland', 48.14, 11.58, 'Europe/Berlin'],
  ['Köln', 'Deutschland', 50.94, 6.96, 'Europe/Berlin'], ['Frankfurt am Main', 'Deutschland', 50.11, 8.68, 'Europe/Berlin'], ['Stuttgart', 'Deutschland', 48.78, 9.18, 'Europe/Berlin'],
  ['Düsseldorf', 'Deutschland', 51.23, 6.78, 'Europe/Berlin'], ['Leipzig', 'Deutschland', 51.34, 12.37, 'Europe/Berlin'], ['Dresden', 'Deutschland', 51.05, 13.74, 'Europe/Berlin'],
  ['Hannover', 'Deutschland', 52.37, 9.74, 'Europe/Berlin'], ['Nürnberg', 'Deutschland', 49.45, 11.08, 'Europe/Berlin'], ['Bremen', 'Deutschland', 53.08, 8.80, 'Europe/Berlin'],
  ['Dortmund', 'Deutschland', 51.51, 7.47, 'Europe/Berlin'], ['Essen', 'Deutschland', 51.46, 7.01, 'Europe/Berlin'], ['Freiburg', 'Deutschland', 47.99, 7.85, 'Europe/Berlin'],
  ['Zürich', 'Schweiz', 47.38, 8.54, 'Europe/Zurich'], ['Bern', 'Schweiz', 46.95, 7.45, 'Europe/Zurich'], ['Basel', 'Schweiz', 47.56, 7.59, 'Europe/Zurich'],
  ['Genf', 'Schweiz', 46.20, 6.14, 'Europe/Zurich'], ['Luzern', 'Schweiz', 47.05, 8.31, 'Europe/Zurich'], ['Vaduz', 'Liechtenstein', 47.14, 9.52, 'Europe/Vaduz'],
  ['Bozen', 'Italien', 46.50, 11.35, 'Europe/Rome'], ['Rom', 'Italien', 41.90, 12.50, 'Europe/Rome'], ['Mailand', 'Italien', 45.46, 9.19, 'Europe/Rome'],
  ['Venedig', 'Italien', 45.44, 12.32, 'Europe/Rome'], ['Neapel', 'Italien', 40.85, 14.27, 'Europe/Rome'], ['Florenz', 'Italien', 43.77, 11.26, 'Europe/Rome'],
  ['Paris', 'Frankreich', 48.86, 2.35, 'Europe/Paris'], ['Marseille', 'Frankreich', 43.30, 5.37, 'Europe/Paris'], ['Lyon', 'Frankreich', 45.76, 4.84, 'Europe/Paris'],
  ['Straßburg', 'Frankreich', 48.57, 7.75, 'Europe/Paris'], ['Brüssel', 'Belgien', 50.85, 4.35, 'Europe/Brussels'], ['Amsterdam', 'Niederlande', 52.37, 4.90, 'Europe/Amsterdam'],
  ['Luxemburg', 'Luxemburg', 49.61, 6.13, 'Europe/Luxembourg'], ['London', 'Vereinigtes Königreich', 51.51, -0.13, 'Europe/London'], ['Manchester', 'Vereinigtes Königreich', 53.48, -2.24, 'Europe/London'],
  ['Edinburgh', 'Vereinigtes Königreich', 55.95, -3.19, 'Europe/London'], ['Dublin', 'Irland', 53.35, -6.26, 'Europe/Dublin'], ['Madrid', 'Spanien', 40.42, -3.70, 'Europe/Madrid'],
  ['Barcelona', 'Spanien', 41.39, 2.17, 'Europe/Madrid'], ['Lissabon', 'Portugal', 38.72, -9.14, 'Europe/Lisbon'], ['Kopenhagen', 'Dänemark', 55.68, 12.57, 'Europe/Copenhagen'],
  ['Stockholm', 'Schweden', 59.33, 18.07, 'Europe/Stockholm'], ['Oslo', 'Norwegen', 59.91, 10.75, 'Europe/Oslo'], ['Helsinki', 'Finnland', 60.17, 24.94, 'Europe/Helsinki'],
  ['Reykjavik', 'Island', 64.15, -21.94, 'Atlantic/Reykjavik'], ['Warschau', 'Polen', 52.23, 21.01, 'Europe/Warsaw'], ['Krakau', 'Polen', 50.06, 19.94, 'Europe/Warsaw'],
  ['Prag', 'Tschechien', 50.08, 14.44, 'Europe/Prague'], ['Brünn', 'Tschechien', 49.20, 16.61, 'Europe/Prague'], ['Bratislava', 'Slowakei', 48.15, 17.11, 'Europe/Bratislava'],
  ['Budapest', 'Ungarn', 47.50, 19.04, 'Europe/Budapest'], ['Ljubljana', 'Slowenien', 46.06, 14.51, 'Europe/Ljubljana'], ['Zagreb', 'Kroatien', 45.81, 15.98, 'Europe/Zagreb'],
  ['Belgrad', 'Serbien', 44.79, 20.45, 'Europe/Belgrade'], ['Sarajevo', 'Bosnien', 43.86, 18.41, 'Europe/Sarajevo'], ['Bukarest', 'Rumänien', 44.43, 26.10, 'Europe/Bucharest'],
  ['Sofia', 'Bulgarien', 42.70, 23.32, 'Europe/Sofia'], ['Athen', 'Griechenland', 37.98, 23.73, 'Europe/Athens'], ['Istanbul', 'Türkei', 41.01, 28.98, 'Europe/Istanbul'],
  ['Ankara', 'Türkei', 39.93, 32.86, 'Europe/Istanbul'], ['Kiew', 'Ukraine', 50.45, 30.52, 'Europe/Kyiv'], ['Moskau', 'Russland', 55.76, 37.62, 'Europe/Moscow'],
  ['Sankt Petersburg', 'Russland', 59.93, 30.34, 'Europe/Moscow'], ['Kairo', 'Ägypten', 30.04, 31.24, 'Africa/Cairo'], ['Alexandria', 'Ägypten', 31.20, 29.92, 'Africa/Cairo'],
  ['Jerusalem', 'Israel', 31.77, 35.22, 'Asia/Jerusalem'], ['Tel Aviv', 'Israel', 32.09, 34.78, 'Asia/Jerusalem'], ['Dubai', 'VAE', 25.20, 55.27, 'Asia/Dubai'],
  ['Teheran', 'Iran', 35.69, 51.39, 'Asia/Tehran'], ['Delhi', 'Indien', 28.61, 77.21, 'Asia/Kolkata'], ['Mumbai', 'Indien', 19.08, 72.88, 'Asia/Kolkata'],
  ['Bangkok', 'Thailand', 13.76, 100.50, 'Asia/Bangkok'], ['Singapur', 'Singapur', 1.35, 103.82, 'Asia/Singapore'], ['Peking', 'China', 39.90, 116.41, 'Asia/Shanghai'],
  ['Shanghai', 'China', 31.23, 121.47, 'Asia/Shanghai'], ['Hongkong', 'China', 22.32, 114.17, 'Asia/Hong_Kong'], ['Tokio', 'Japan', 35.68, 139.69, 'Asia/Tokyo'],
  ['Seoul', 'Südkorea', 37.57, 126.98, 'Asia/Seoul'], ['Sydney', 'Australien', -33.87, 151.21, 'Australia/Sydney'], ['Melbourne', 'Australien', -37.81, 144.96, 'Australia/Melbourne'],
  ['Perth', 'Australien', -31.95, 115.86, 'Australia/Perth'], ['Auckland', 'Neuseeland', -36.85, 174.76, 'Pacific/Auckland'], ['Kapstadt', 'Südafrika', -33.92, 18.42, 'Africa/Johannesburg'],
  ['Johannesburg', 'Südafrika', -26.20, 28.05, 'Africa/Johannesburg'], ['Nairobi', 'Kenia', -1.29, 36.82, 'Africa/Nairobi'], ['Lagos', 'Nigeria', 6.52, 3.38, 'Africa/Lagos'],
  ['Casablanca', 'Marokko', 33.57, -7.59, 'Africa/Casablanca'], ['New York', 'USA', 40.71, -74.01, 'America/New_York'], ['Washington', 'USA', 38.91, -77.04, 'America/New_York'],
  ['Boston', 'USA', 42.36, -71.06, 'America/New_York'], ['Miami', 'USA', 25.76, -80.19, 'America/New_York'], ['Chicago', 'USA', 41.88, -87.63, 'America/Chicago'],
  ['Houston', 'USA', 29.76, -95.37, 'America/Chicago'], ['Denver', 'USA', 39.74, -104.99, 'America/Denver'], ['Los Angeles', 'USA', 34.05, -118.24, 'America/Los_Angeles'],
  ['San Francisco', 'USA', 37.77, -122.42, 'America/Los_Angeles'], ['Seattle', 'USA', 47.61, -122.33, 'America/Los_Angeles'], ['Toronto', 'Kanada', 43.65, -79.38, 'America/Toronto'],
  ['Vancouver', 'Kanada', 49.28, -123.12, 'America/Vancouver'], ['Mexiko-Stadt', 'Mexiko', 19.43, -99.13, 'America/Mexico_City'], ['Havanna', 'Kuba', 23.11, -82.37, 'America/Havana'],
  ['Bogotá', 'Kolumbien', 4.71, -74.07, 'America/Bogota'], ['Lima', 'Peru', -12.05, -77.04, 'America/Lima'], ['São Paulo', 'Brasilien', -23.55, -46.63, 'America/Sao_Paulo'],
  ['Rio de Janeiro', 'Brasilien', -22.91, -43.17, 'America/Sao_Paulo'], ['Buenos Aires', 'Argentinien', -34.60, -58.38, 'America/Argentina/Buenos_Aires'], ['Santiago', 'Chile', -33.45, -70.67, 'America/Santiago'],
];
// Zeitzonen für „anderer Ort" (Auswahl)
export const ZONEN = [
  ['Europe/Berlin', 'Mitteleuropa (MEZ/MESZ)'], ['Europe/London', 'Westeuropa (London)'], ['Europe/Athens', 'Osteuropa (Athen)'], ['Europe/Moscow', 'Moskau'],
  ['Asia/Dubai', 'Dubai'], ['Asia/Kolkata', 'Indien'], ['Asia/Bangkok', 'Bangkok'], ['Asia/Shanghai', 'China'], ['Asia/Tokyo', 'Japan'], ['Australia/Sydney', 'Ostaustralien'],
  ['Pacific/Auckland', 'Neuseeland'], ['America/Sao_Paulo', 'Brasilien'], ['America/New_York', 'US-Ostküste'], ['America/Chicago', 'US-Mitte'], ['America/Denver', 'US-Berge'],
  ['America/Los_Angeles', 'US-Westküste'], ['Africa/Cairo', 'Ägypten'], ['Africa/Johannesburg', 'Südafrika'], ['UTC', 'UTC (Weltzeit)'],
];
export const ortLabel = (o) => `${o[0]}, ${o[1]}`;
// Eingabetext → Ort aus der Liste (Stadt allein oder „Stadt, Land")
export function findeOrt(text) {
  const t = String(text || '').trim().toLowerCase(); if (!t) return null;
  return ORTE.find((o) => ortLabel(o).toLowerCase() === t) || ORTE.find((o) => o[0].toLowerCase() === t) || null;
}
export const profilOrt = (o) => ({ n: o[0], land: o[1], lat: o[2], lon: o[3], tz: o[4] });
