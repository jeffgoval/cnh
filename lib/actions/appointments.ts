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
    
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao atualizar agendamento' }
  }
}

