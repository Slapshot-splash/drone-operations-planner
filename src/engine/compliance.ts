import { classifyOperation, ClassificationInput, ClassificationResult } from './classification'
import { NL_SPECIFIC_RULES, OPEN_CATEGORY_RULES } from './euRules'

export type ComplianceItem = {
  id: string
  title: string
  status: 'pass' | 'warning' | 'required'
  detail: string
  source?: string
}

export function buildComplianceAssessment(input: ClassificationInput & {
  dangerousGoods?: boolean
  droppingMaterial?: boolean
  geoZoneChecked?: boolean
  pilotTrainingConfirmed?: boolean
  operatorRegistrationConfirmed?: boolean
}): { classification: ClassificationResult; items: ComplianceItem[] } {
  const classification = classifyOperation(input)
  const items: ComplianceItem[] = []

  if (classification.category === 'Open') {
    for (const rule of OPEN_CATEGORY_RULES) {
      items.push({
        id: rule.id,
        title: rule.text,
        status: 'warning',
        detail: 'Controleer deze voorwaarde voordat de operatie wordt vrijgegeven.',
        source: 'EASA Open Category',
      })
    }
  } else {
    items.push({
      id: 'specific-route',
      title: 'Bepaal de toepasselijke Specific-route',
      status: 'required',
      detail: 'Controleer STS, PDRA, operational authorisation of een andere toepasselijke route.',
      source: 'EASA / ILT',
    })
    items.push(...NL_SPECIFIC_RULES.map((rule) => ({
      id: rule.id,
      title: rule.text,
      status: 'required' as const,
      detail: 'Nederlandse local conditions moeten worden gecontroleerd.',
      source: 'ILT',
    })))
  }

  if (input.dangerousGoods) {
    items.push({ id: 'dangerous-goods', title: 'Gevaarlijke goederen', status: 'required', detail: 'De Open-route is hierdoor niet passend; aanvullende beoordeling is nodig.', source: 'EASA / EU 2019/947' })
  }
  if (input.droppingMaterial) {
    items.push({ id: 'dropping-material', title: 'Materiaal droppen', status: 'required', detail: 'De Open-route is hierdoor niet passend; aanvullende beoordeling is nodig.', source: 'EASA / EU 2019/947' })
  }
  if (!input.geoZoneChecked) {
    items.push({ id: 'geo-zones', title: 'Geografische zones controleren', status: 'required', detail: 'Controleer de actuele Nederlandse UAS-geozones voor de exacte locatie en datum.', source: 'ILT' })
  }
  if (!input.operatorRegistrationConfirmed) {
    items.push({ id: 'operator-registration', title: 'Exploitantregistratie controleren', status: 'warning', detail: 'Bepaal op basis van UAS en operatie of registratie verplicht is.', source: 'EASA / RDW' })
  }
  if (!input.pilotTrainingConfirmed) {
    items.push({ id: 'pilot-training', title: 'Pilotcompetentie controleren', status: 'warning', detail: 'De vereiste opleiding/bevoegdheid hangt af van de operationele route.', source: 'EASA / ILT' })
  }

  return { classification, items }
}
