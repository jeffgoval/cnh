'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

  try {
    // Verificar se o usuário é aluno
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'ALUNO') {
      return { error: 'Apenas alunos podem fazer agendamentos' }
    }

    // Verificar se o slot está disponível
    const { data: slot } = await supabase
      .from('slots')
      .select('*')
      .eq('id', data.slot_id)
      .eq('is_booked', false)
      .single()

    if (!slot) {
      return { error: 'Horário não disponível' }
    }

    // Criar appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        slot_id: data.slot_id,
        student_id: user.id,
        instructor_id: data.instructor_id,
        notes: data.notes,
        status: 'pending',
      })
      .select()
      .single()

    if (appointmentError) throw appointmentError

    // Marcar slot como ocupado
    const { error: slotError } = await supabase
      .from('slots')
      .update({ is_booked: true })
      .eq('id', data.slot_id)

    if (slotError) throw slotError

    revalidatePath('/aluno/minhas-aulas')
    revalidatePath('/instrutor/aulas')
    
    return { appointment }
  } catch (error: any) {
    return { error: error.message || 'Erro ao criar agendamento' }
  }
}

export async function getStudentAppointments() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        slot:slots(*),
        instructor:profiles!appointments_instructor_id_fkey(*)
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { appointments }
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar agendamentos' }
  }
}

export async function getStudentTimeline() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  try {
    const now = new Date()

    // Buscar aulas concluídas + futuras
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        slot:slots(*),
        instructor:profiles!appointments_instructor_id_fkey(full_name, phone)
      `)
      .eq('student_id', user.id)
      .neq('status', 'cancelled')
      .order('slot(start_time)', { ascending: false })
      .limit(10)

    if (error) throw error

    return { appointments }
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar timeline' }
  }
}

export async function getInstructorAppointments() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  try {
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        slot:slots(*),
        student:profiles!appointments_student_id_fkey(*)
      `)
      .eq('instructor_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { appointments }
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar agendamentos' }
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: 'confirmed' | 'completed' | 'cancelled') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .or(`instructor_id.eq.${user.id},student_id.eq.${user.id}`)

    if (error) throw error

    // Se cancelar, liberar o slot
    if (status === 'cancelled') {
      const { data: appointment } = await supabase
        .from('appointments')
        .select('slot_id')
        .eq('id', appointmentId)
        .single()

      if (appointment) {
        await supabase
          .from('slots')
          .update({ is_booked: false })
          .eq('id', appointment.slot_id)
      }
    }

    revalidatePath('/aluno/minhas-aulas')
    revalidatePath('/instrutor/aulas')
    revalidatePath('/instrutor/hoje')

    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar agendamento' }
  }
}

export async function getInstructorTimeline() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  try {
    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Buscar aulas dos últimos 7 dias + futuras
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        slot:slots(*),
        student:profiles!appointments_student_id_fkey(full_name, phone)
      `)
      .eq('instructor_id', user.id)
      .gte('slot.start_time', sevenDaysAgo.toISOString())
      .order('slot(start_time)', { ascending: true })

    if (error) throw error

    return { appointments }
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

  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Aulas de hoje
    const { data: todayAppointments } = await supabase
      .from('appointments')
      .select('id, slot:slots(start_time)')
      .eq('instructor_id', user.id)
      .gte('slot.start_time', today.toISOString())
      .lt('slot.start_time', tomorrow.toISOString())
      .neq('status', 'cancelled')

    // Aulas da semana
    const { data: weekAppointments } = await supabase
      .from('appointments')
      .select('id, slot:slots(start_time)')
      .eq('instructor_id', user.id)
      .gte('slot.start_time', startOfWeek.toISOString())
      .lt('slot.start_time', endOfWeek.toISOString())
      .neq('status', 'cancelled')

    // Ganhos do mês (aulas completadas)
    const { data: monthEarnings } = await supabase
      .from('appointments')
      .select('slot:slots(price)')
      .eq('instructor_id', user.id)
      .eq('status', 'completed')
      .gte('slot.start_time', startOfMonth.toISOString())
      .lte('slot.start_time', endOfMonth.toISOString())

    const totalEarnings = monthEarnings?.reduce((sum, apt: any) => sum + (apt.slot?.price || 0), 0) || 0

    return {
      stats: {
        today: todayAppointments?.length || 0,
        week: weekAppointments?.length || 0,
        monthEarnings: totalEarnings
      }
    }
  } catch (error: any) {
    return { error: error.message || 'Erro ao buscar estatísticas' }
  }
}



