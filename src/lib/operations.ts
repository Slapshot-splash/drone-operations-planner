import { supabase } from './supabase'

export type StoredOperation = {
  id: string
  name: string
  location: string
  date: string | null
  category: string
  status: string
  planner_data: Record<string, unknown>
}

async function requireUser() {
  if (!supabase) throw new Error('Supabase is niet geconfigureerd.')
  const { data, error } = await supabase.auth.getUser()
  if (error) throw new Error(`Inloggen controleren mislukt: ${error.message}`)
  if (!data.user) throw new Error('Je bent niet ingelogd.')
  return data.user
}

function formatSupabaseError(context: string, error: { message?: string; details?: string; hint?: string; code?: string }) {
  const parts = [error.message, error.details, error.hint, error.code ? `code ${error.code}` : ''].filter(Boolean)
  return `${context}: ${parts.join(' — ') || 'onbekende Supabase-fout'}`
}

const operationSelect = 'id,name,location_name,operation_date,classification_category,status,planner_data'

function mapOperation(row: any): StoredOperation {
  return {
    id: row.id,
    name: row.name,
    location: row.location_name ?? '',
    date: row.operation_date ?? null,
    category: row.classification_category ?? '',
    status: row.status,
    planner_data: row.planner_data ?? {},
  }
}

export async function listOperations(): Promise<StoredOperation[]> {
  await requireUser()
  const { data, error } = await supabase!
    .from('operations')
    .select(operationSelect)
    .order('created_at', { ascending: false })

  if (error) throw new Error(formatSupabaseError('Operaties laden mislukt', error))
  return (data ?? []).map(mapOperation)
}

export async function createOperation(values: {
  name: string
  location: string
  date: string
  category: string
  plannerData: Record<string, unknown>
}): Promise<StoredOperation> {
  const user = await requireUser()
  const { data, error } = await supabase!
    .from('operations')
    .insert({
      user_id: user.id,
      name: values.name,
      location_name: values.location,
      operation_date: values.date || null,
      classification_category: values.category,
      status: 'Concept',
      planner_data: values.plannerData,
    })
    .select(operationSelect)
    .single()

  if (error) throw new Error(formatSupabaseError('Nieuwe operatie aanmaken mislukt', error))
  if (!data) throw new Error('Nieuwe operatie aanmaken mislukt: Supabase gaf geen aangemaakte rij terug.')
  return mapOperation(data)
}

export async function updateOperation(id: string, values: {
  name: string
  location: string
  date: string
  category: string
  status?: string
  plannerData: Record<string, unknown>
}): Promise<void> {
  await requireUser()
  const { error } = await supabase!
    .from('operations')
    .update({
      name: values.name,
      location_name: values.location,
      operation_date: values.date || null,
      classification_category: values.category,
      status: values.status ?? 'Concept',
      planner_data: values.plannerData,
    })
    .eq('id', id)

  if (error) throw new Error(formatSupabaseError('Operatie opslaan mislukt', error))
}

export async function getOperation(id: string): Promise<StoredOperation> {
  await requireUser()
  const { data, error } = await supabase!
    .from('operations')
    .select(operationSelect)
    .eq('id', id)
    .single()

  if (error) throw new Error(formatSupabaseError('Operatie laden mislukt', error))
  return mapOperation(data)
}
