'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSlot(data: {
  start_time: string
  end_time: string
  price: number
  location_address: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  try {
    // Verificar se o usuário é instrutor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'INSTRUTOR') {
      return { error: 'Apenas instrutores podem criar slots' }
    }

    // Verificar conflitos de horário
    const { data: existingSlots } = await supabase
      .from('slots')
      .select('*')
      .eq('instructor_id', user.id)
      .or(`start_time.lte.${data.end_time},end_time.gte.${data.start_time}`)

    if (existingSlots && existingSlots.length > 0) {
      return { error: 'Já existe um horário neste período' }
    }

    // Criar slot
    const { data: slot, error } = await supabase
      .from('slots')
      .insert({
        instructor_id: user.id,
        start_time: data.start_time,
        end_time: data.end_time,
        price: data.price,
        location_address: data.location_address,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/instrutor/agenda')
    return { slot }
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar slot' }
  }
}

export async function getInstructorSlots() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  try {
    const { data: slots, error } = await supabase
      .from('slots')
      .select('*')
      .eq('instructor_id', user.id)
      .order('start_time', { ascending: true })

    if (error) throw error

    return { slots }
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar slots' }
  }
}

export async function deleteSlot(slotId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  try {
    const { error } = await supabase
      .from('slots')
      .delete()
      .eq('id', slotId)
      .eq('instructor_id', user.id)

    if (error) throw error

    revalidatePath('/instrutor/agenda')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao deletar slot' }
  }
}

export async function getAvailableSlots(instructorId: string) {
  const supabase = await createClient()

  try {
    const { data: slots, error } = await supabase
      .from('slots')
      .select('*')
      .eq('instructor_id', instructorId)
      .eq('is_booked', false)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })

    if (error) throw error

    return { slots }
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar slots' }
  }
}

