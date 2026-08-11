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
  if (error) throw error
  if (!data.user) throw new Error('Je bent niet ingelogd.')
  return data.user
}

export async function listOperations(): Promise<StoredOperation[]> {
  await requireUser()
  const { data, error } = await supabase!
    .from('operations')
    .select('id,name,location,date,category,status,planner_data')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as StoredOperation[]
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
      location: values.location,
      date: values.date || null,
      category: values.category,
      status: 'Concept',
      planner_data: values.plannerData,
    })
    .select('id,name,location,date,category,status,planner_data')
    .single()

  if (error) throw error
  return data as StoredOperation
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
      location: values.location,
      date: values.date || null,
      category: values.category,
      status: values.status ?? 'Concept',
      planner_data: values.plannerData,
    })
    .eq('id', id)

  if (error) throw error
}

export async function getOperation(id: string): Promise<StoredOperation> {
  await requireUser()
  const { data, error } = await supabase!
    .from('operations')
    .select('id,name,location,date,category,status,planner_data')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as StoredOperation
}
