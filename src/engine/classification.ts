export type ClassificationInput = {
  flight: 'VLOS' | 'EVLOS' | 'BVLOS'
  altitude: number
  mtom?: number
  cClass: string
  people: 'Geen personen verwacht' | 'Incidenteel personen aanwezig' | 'Veel personen aanwezig' | 'Assembly of people'
  environment: 'Open gebied' | 'Stedelijk gebied' | 'Industrieel gebied' | 'Landelijk gebied'
}

export type ClassificationResult = {
  category: 'Open' | 'Specific' | 'Needs review'
  subcategory?: 'A1' | 'A2' | 'A3'
  severity: 'ok' | 'warning' | 'blocked'
  title: string
  reason: string
  checks: { label: string; status: 'pass' | 'warning' | 'fail'; detail: string }[]
}

/**
 * Preliminary EU classification engine.
 *
 * This deliberately does not claim to be a complete legal determination.
 * Geographical zones, national rules, dangerous goods, dropping material,
 * obstacle exceptions, STS/PDRA and SORA are separate decision layers.
 */
export function classifyOperation(input: ClassificationInput): ClassificationResult {
  const checks: ClassificationResult['checks'] = []

  if (input.altitude > 120) {
    checks.push({ label: 'Hoogte', status: 'fail', detail: 'Geplande hoogte is boven 120 m AGL; dit valt niet binnen de normale Open-beperking.' })
  } else {
    checks.push({ label: 'Hoogte', status: 'pass', detail: 'Geplande hoogte is maximaal 120 m.' })
  }

  if (input.mtom !== undefined && input.mtom > 25) {
    checks.push({ label: 'MTOM', status: 'fail', detail: 'MTOM is boven 25 kg; dit past niet binnen de normale Open-voorwaarden.' })
  } else {
    checks.push({ label: 'MTOM', status: 'pass', detail: 'MTOM is niet boven 25 kg of is nog niet ingevuld.' })
  }

  if (input.flight === 'BVLOS') {
    checks.push({ label: 'VLOS/BVLOS', status: 'warning', detail: 'BVLOS vereist een specifieke controle. Er bestaan beperkte Open-uitzonderingen; anders valt de operatie in Specific.' })
  } else {
    checks.push({ label: 'VLOS/BVLOS', status: 'pass', detail: 'VLOS/EVLOS is geselecteerd.' })
  }

  if (input.people === 'Assembly of people') {
    checks.push({ label: 'Mensenmenigte', status: 'fail', detail: 'Een Open-operatie mag niet over een bijeenkomst van mensen worden uitgevoerd.' })
  } else {
    checks.push({ label: 'Mensen', status: 'warning', detail: 'Afstand/overvlucht van niet-betrokken personen moet nog tegen de gekozen subcategorie worden gecontroleerd.' })
  }

  if (input.cClass === 'C2') {
    checks.push({ label: 'C-klasse', status: 'pass', detail: 'C2 kan in Open/A2 worden gebruikt onder de bijbehorende voorwaarden.' })
  } else if (input.cClass === 'C3' || input.cClass === 'C4') {
    checks.push({ label: 'C-klasse', status: 'warning', detail: `${input.cClass} wijst in Open richting A3 met de bijbehorende afstandsbeperkingen.` })
  } else if (input.cClass === 'C0' || input.cClass === 'C1') {
    checks.push({ label: 'C-klasse', status: 'pass', detail: `${input.cClass} kan binnen A1 vallen als alle overige voorwaarden zijn vervuld.` })
  } else {
    checks.push({ label: 'C-klasse', status: 'warning', detail: 'C-klasse ontbreekt; controle van legacy/privately-built voorwaarden is nodig.' })
  }

  const hardSpecific = input.altitude > 120 || (input.mtom !== undefined && input.mtom > 25)
  if (hardSpecific) {
    return {
      category: 'Specific', severity: 'blocked', title: 'Specific controleren',
      reason: 'Minstens één basisvoorwaarde voor Open is overschreden. Een passende Specific-route (bijvoorbeeld STS, PDRA, OA of LUC) moet worden bepaald.', checks,
    }
  }

  if (input.flight === 'BVLOS' || input.people === 'Veel personen aanwezig' || input.environment === 'Stedelijk gebied' && (input.cClass === 'C3' || input.cClass === 'C4')) {
    return {
      category: 'Needs review', severity: 'warning', title: 'Aanvullende beoordeling nodig',
      reason: 'De operatie kan niet veilig als eenvoudige Open-case worden geclassificeerd zonder aanvullende operationele gegevens.', checks,
    }
  }

  let subcategory: ClassificationResult['subcategory']
  if (input.cClass === 'C2') subcategory = 'A2'
  else if (input.cClass === 'C0' || input.cClass === 'C1') subcategory = 'A1'
  else if (input.cClass === 'C3' || input.cClass === 'C4') subcategory = 'A3'

  return {
    category: 'Open', subcategory, severity: 'warning', title: `Open${subcategory ? ` · ${subcategory}` : ''} — voorwaarden controleren`,
    reason: 'De basisgegevens passen bij Open, maar geozones, nationale voorschriften en alle operationele beperkingen moeten nog worden gecontroleerd.', checks,
  }
}
