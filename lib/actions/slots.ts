'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAvailableSlots(instructorId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  if (!instructorId || typeof instructorId !== 'string') {
    return { error: 'ID de instrutor inválido' }
  }

  try {
    const now = new Date()

    const { data: slots, error } = await supabase
      .from('slots')
      .select('*')
      .eq('instructor_id', instructorId)
      .eq('is_booked', false)
      .gte('start_time', now.toISOString())
      .order('start_time', { ascending: true })
      .limit(20)

    if (error) throw error

    return { slots: slots || [] }
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar horários disponíveis' }
  }
}

export async function createSlot(data: {
  start_time: string
  end_time: string
  price: number
  location_address: string
  categoria: 'A' | 'B' | 'AB' | 'ACC'
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'INSTRUTOR') {
    return { error: 'Acesso negado. Apenas instrutores podem criar horários.' }
  }

  try {
    const { error } = await supabase
      .from('slots')
      .insert({
        ...data,
        instructor_id: user.id,
        is_booked: false
      })

    if (error) throw error

    revalidatePath('/instrutor/agenda')

    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar horário' }
  }
}

export async function deleteSlot(slotId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  if (!slotId || typeof slotId !== 'string') {
    return { error: 'ID de horário inválido' }
  }

  try {
    const { error } = await supabase
      .from('slots')
      .delete()
      .eq('id', slotId)
      .eq('instructor_id', user.id)
      .eq('is_booked', false)

    if (error) throw error

    revalidatePath('/instrutor/agenda')

    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao deletar horário' }
  }
}
