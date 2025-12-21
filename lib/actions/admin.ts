'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { VerificationStatus } from '@/lib/supabase/types'

export async function getPendingInstructors() {
    const supabase = await createClient()

    // Verify user is authenticated and is ADMIN
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Não autenticado' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'ADMIN') {
        return { error: 'Acesso negado. Apenas administradores podem visualizar instrutores pendentes.' }
    }

    try {
        const { data: instructors, error } = await supabase
            .from('profiles')
            .select(`
                *,
                assets:instructor_assets(*)
            `)
            .eq('role', 'INSTRUTOR')
            .eq('instructor_assets.verification_status', 'pending')

        if (error) throw error

        // Double check filtering in JS in case Supabase join filtering behaves unexpectedly
        const pendingInstructors = instructors?.filter(i =>
            i.assets && i.assets.length > 0 && i.assets.some((a: any) => a.verification_status === 'pending')
        ) || []

        return { instructors: pendingInstructors }
    } catch (error: any) {
        return { error: error.message || 'Erro ao buscar instrutores pendentes' }
    }
}

export async function approveInstructorAsset(instructorId: string, status: VerificationStatus) {
    const supabase = await createClient()

    // Verify user is authenticated and is ADMIN
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Não autenticado' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'ADMIN') {
        return { error: 'Acesso negado. Apenas administradores podem aprovar/rejeitar instrutores.' }
    }

    // Validate instructorId exists and belongs to an instructor
    if (!instructorId || typeof instructorId !== 'string') {
        return { error: 'ID de instrutor inválido' }
    }

    const { data: instructor } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', instructorId)
        .eq('role', 'INSTRUTOR')
        .single()

    if (!instructor) {
        return { error: 'Instrutor não encontrado' }
    }

    try {
        // 1. Update instructor_assets status
        const { error: assetError } = await supabase
            .from('instructor_assets')
            .update({ verification_status: status })
            .eq('instructor_id', instructorId)

        if (assetError) throw assetError

        // 2. If approved, update profile document_verified
        if (status === 'approved') {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ document_verified: true })
                .eq('id', instructorId)

            if (profileError) throw profileError
        } else {
            // If rejected, ensure document_verified is false
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ document_verified: false })
                .eq('id', instructorId)

            if (profileError) throw profileError
        }

        revalidatePath('/admin/instrutores')
        return { success: true }
    } catch (error: any) {
        return { error: error.message || 'Erro ao processar aprovação' }
    }
}
