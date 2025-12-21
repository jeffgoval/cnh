'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getInstructorTimeline() {
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
    return { error: 'Acesso negado. Apenas instrutores podem visualizar a timeline.' }
  }

  try {
    // Get today's appointments for this instructor
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 7) // Next 7 days

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        slot:slots(*),
        student:profiles!appointments_student_id_fkey(id, full_name, avatar_url)
      `)
      .eq('instructor_id', user.id)
      .gte('created_at', today.toISOString())
      .lte('created_at', tomorrow.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    return { appointments: appointments || [] }
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar timeline' }
  }
}

export async function getInstructorStats() {
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
    return { error: 'Acesso negado. Apenas instrutores podem visualizar estatísticas.' }
  }

  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    // Count today's appointments
    const { count: todayCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('instructor_id', user.id)
      .gte('created_at', today.toISOString())
      .in('status', ['pending', 'confirmed', 'completed'])

    // Count this week's appointments
    const { count: weekCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('instructor_id', user.id)
      .gte('created_at', weekStart.toISOString())
      .in('status', ['pending', 'confirmed', 'completed'])

    // Get month earnings
    const { data: monthAppointments } = await supabase
      .from('appointments')
      .select('slot:slots(price)')
      .eq('instructor_id', user.id)
      .eq('status', 'completed')
      .gte('created_at', monthStart.toISOString())

    const monthEarnings = monthAppointments?.reduce((sum, apt: any) => {
      return sum + (apt.slot?.price || 0)
    }, 0) || 0

    return {
      stats: {
        today: todayCount || 0,
        week: weekCount || 0,
        monthEarnings
      }
    }
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar estatísticas' }
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  if (!appointmentId || typeof appointmentId !== 'string') {
    return { error: 'ID de agendamento inválido' }
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .or(`instructor_id.eq.${user.id},student_id.eq.${user.id}`)

    if (error) throw error

    revalidatePath('/instrutor/aulas')
    revalidatePath('/aluno/minhas-aulas')

    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar status do agendamento' }
  }
}

export async function createAppointment(data: {
  slot_id: string
  instructor_id: string
  notes?: string
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

  if (profile?.role !== 'ALUNO') {
    return { error: 'Acesso negado. Apenas alunos podem criar agendamentos.' }
  }

  try {
    // Check if slot is available
    const { data: slot } = await supabase
      .from('slots')
      .select('is_booked')
      .eq('id', data.slot_id)
      .single()

    if (slot?.is_booked) {
      return { error: 'Este horário já foi reservado' }
    }

    // Create appointment
    const { error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        slot_id: data.slot_id,
        instructor_id: data.instructor_id,
        student_id: user.id,
        notes: data.notes,
        status: 'pending'
      })

    if (appointmentError) throw appointmentError

    // Mark slot as booked
    const { error: slotError } = await supabase
      .from('slots')
      .update({ is_booked: true })
      .eq('id', data.slot_id)

    if (slotError) throw slotError

    revalidatePath('/aluno/minhas-aulas')
    revalidatePath('/instrutor/aulas')

    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar agendamento' }
  }
}
