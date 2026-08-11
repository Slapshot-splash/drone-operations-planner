export type DroneRecord = {
  id: string
  model: string
  manufacturer: string
  classMark: string
  category: string
  type: 'Multirotor' | 'Fixed wing' | 'VTOL' | 'Other'
  source: 'EASA'
}

// Initial seed from EASA's public "Drones for EU Operations" register.
// Production should synchronize the complete machine-readable EASA dataset.
export const droneCatalog: DroneRecord[] = [
  { id: 'MT4MFVD', model: 'DJI Mini 4 Pro Fly More Combo', manufacturer: 'DJI GmbH', classMark: 'C0', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'MT3PDCE', model: 'DJI Mini 3', manufacturer: 'DJI GmbH', classMark: 'C0', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'QF3W4K', model: 'DJI Avata 2', manufacturer: 'DJI GmbH', classMark: 'C1', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'EB3WBC', model: 'DJI Air 3', manufacturer: 'DJI GmbH', classMark: 'C1', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'CZ3SCL', model: 'DJI Air 3S', manufacturer: 'DJI GmbH', classMark: 'C1', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'DA2SUE1A', model: 'DJI Air 2S', manufacturer: 'DJI GmbH', classMark: 'C1', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'L2C', model: 'DJI Mavic 3 Classic', manufacturer: 'DJI GmbH', classMark: 'C1', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'L2AA', model: 'DJI Mavic 3 V2.0', manufacturer: 'DJI GmbH', classMark: 'C1', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'L2PA', model: 'DJI Mavic 3 Cine V2.0', manufacturer: 'DJI GmbH', classMark: 'C1', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'M3E-EU', model: 'DJI Mavic 3E EU', manufacturer: 'DJI GmbH', classMark: 'C2 with low speed mode', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'M3T-EU', model: 'DJI Mavic 3T EU', manufacturer: 'DJI GmbH', classMark: 'C2 with low speed mode', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'M3M-EU', model: 'DJI Mavic 3M EU', manufacturer: 'DJI GmbH', classMark: 'C2 with low speed mode', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'M4E', model: 'DJI Matrice 4E', manufacturer: 'DJI GmbH', classMark: 'C2 with low speed mode', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'M4T', model: 'DJI Matrice 4T', manufacturer: 'DJI GmbH', classMark: 'C2 with low speed mode', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'L3A', model: 'DJI Mavic 4 Pro', manufacturer: 'DJI GmbH', classMark: 'C2 with low speed mode', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'L3B', model: 'DJI Mavic 4 Pro', manufacturer: 'DJI GmbH', classMark: 'C2 with low speed mode', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'L2S', model: 'DJI Mavic 3 Pro', manufacturer: 'DJI GmbH', classMark: 'C2 with low speed mode', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'L2E', model: 'DJI Mavic 3 Pro Cine', manufacturer: 'DJI GmbH', classMark: 'C2 with low speed mode', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'M30-EU', model: 'DJI M30 EU', manufacturer: 'DJI GmbH', classMark: 'C2 with low speed mode', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'M30T-EU', model: 'DJI M30T EU', manufacturer: 'DJI GmbH', classMark: 'C2 with low speed mode', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'M4D', model: 'DJI Matrice 4D', manufacturer: 'DJI GmbH', classMark: 'C6 (STS 02)', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'T740', model: 'DJI Inspire 3', manufacturer: 'DJI GmbH', classMark: 'C3', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'Matrice 350', model: 'DJI Matrice 350 RTK', manufacturer: 'DJI GmbH', classMark: 'C3', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
  { id: 'Matrice 400', model: 'DJI Matrice 400', manufacturer: 'DJI GmbH', classMark: 'C3', category: 'Open / Standard', type: 'Multirotor', source: 'EASA' },
]

export const droneCatalogSource = {
  name: 'EASA Drones for EU Operations',
  strategy: 'machine-readable-sync',
}
