export const EU_RULE_SOURCES = {
  openCategory: {
    authority: 'EASA',
    title: 'Open Category — Low Risk — Civil Drones',
    url: 'https://www.easa.europa.eu/en/domains/drones-air-mobility/operating-drone/open-category-low-risk-civil-drones',
    checked: '2026-08-11',
  },
  easyAccessRules: {
    authority: 'EASA',
    title: 'Easy Access Rules for Unmanned Aircraft Systems — June 2026',
    url: 'https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-unmanned-aircraft-systems',
    checked: '2026-08-11',
  },
  nlSpecific: {
    authority: 'ILT',
    title: 'Nationale voorschriften categorie Specifiek',
    url: 'https://www.ilent.nl/onderwerpen/luchtvaart/drones-en-modelvliegtuigen/regels-voor-drones/specifiek-dronecategorie/nl-regels',
    checked: '2026-08-11',
  },
  sts: {
    authority: 'ILT',
    title: 'Verklaring standaardscenario (STS)',
    url: 'https://www.ilent.nl/onderwerpen/luchtvaart/drones-en-modelvliegtuigen/regels-voor-drones/specifiek-dronecategorie/sts',
    checked: '2026-08-11',
  },
} as const

export const OPEN_CATEGORY_RULES = [
  { id: 'open-vlos', text: 'VLOS of een toegestane UA-observer-configuratie', severity: 'mandatory' },
  { id: 'open-height', text: 'Maximaal 120 m boven het relevante aardoppervlak, behoudens specifieke uitzonderingen', severity: 'mandatory' },
  { id: 'open-dangerous-goods', text: 'Geen gevaarlijke goederen vervoeren en geen materiaal droppen', severity: 'mandatory' },
  { id: 'open-people', text: 'Geen vlucht boven bijeenkomsten van mensen', severity: 'mandatory' },
  { id: 'open-class', text: 'UAS moet voldoen aan de toegestane Open-route: C0–C4, legacy of passend zelfgebouwd UAS', severity: 'mandatory' },
  { id: 'open-geozone', text: 'Toepasselijke geografische zones en nationale beperkingen controleren', severity: 'mandatory' },
] as const

export const OPEN_SUBCATEGORIES = {
  A1: {
    classes: ['C0', 'C1'],
    people: 'C0: over uninvolved persons toegestaan maar vermijden; C1: overvlucht niet verwachten en minimaliseren; nooit over assemblies.',
  },
  A2: {
    classes: ['C2'],
    people: 'Niet over uninvolved persons vliegen; 30 m horizontale afstand, of 5 m met low-speed mode onder de voorwaarden.',
  },
  A3: {
    classes: ['C3', 'C4', 'legacy-under-25kg', 'privately-built-under-25kg'],
    people: 'Niet over uninvolved persons vliegen; 150 m afstand van uninvolved persons en urban areas.',
  },
} as const

export const NL_SPECIFIC_RULES = [
  { id: 'nl-bvlos-authorisation', text: 'BVLOS in Nederland vereist een exploitatievergunning.', severity: 'mandatory' },
  { id: 'nl-bvlos-airspace', text: 'De huidige ILT-voorwaarden voor BVLOS beperken toegestane luchtruimtypen.', severity: 'mandatory' },
  { id: 'nl-local-conditions', text: 'Naast EU-regels gelden Nederlandse local conditions.', severity: 'mandatory' },
  { id: 'nl-geozones', text: 'Actuele geografische zones moeten vóór de operatie worden gecontroleerd.', severity: 'mandatory' },
] as const

export const STS_RULES = {
  'STS-01': 'VLOS boven een controlled ground area in populated environment; C5 UAS vereist.',
  'STS-02': 'BVLOS met airspace observers boven controlled ground area in sparsely populated environment; C6 UAS vereist.',
} as const
