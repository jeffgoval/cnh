'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: {
    full_name?: string
    phone?: string
    bio?: string
    avatar_url?: string
    cpf?: string
    renach_instrutor?: string
    document_verified?: boolean
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Não autenticado' }
    }

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

        if (error) throw error

        revalidatePath('/aluno/perfil')
        revalidatePath('/instrutor/perfil')
        revalidatePath('/aluno/buscar')

        return { success: true }
    } catch (error: any) {
        return { error: error.message || 'Erro ao atualizar perfil' }
    }
}

export async function updateInstructorData(profileData: any, assetData: any) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Não autenticado' }
    }

    try {
        // 1. Update Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                ...profileData,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

        if (profileError) throw profileError

        // 2. Update/Insert Assets
        const { data: existingAssets } = await supabase
            .from('instructor_assets')
            .select('id')
            .eq('instructor_id', user.id)
            .maybeSingle()

        if (existingAssets) {
            const { error: assetsError } = await supabase
                .from('instructor_assets')
                .update({
                    ...assetData,
                    updated_at: new Date().toISOString(),
                })
                .eq('instructor_id', user.id)
            if (assetsError) throw assetsError
        } else {
            const { error: assetsError } = await supabase
                .from('instructor_assets')
                .insert({
                    ...assetData,
                    instructor_id: user.id,
                    verification_status: 'pending',
                })
            if (assetsError) throw assetsError
        }

        revalidatePath('/instrutor/perfil')
        revalidatePath('/aluno/buscar')

        return { success: true }
    } catch (error: any) {
        return { error: error.message || 'Erro ao atualizar dados do instrutor' }
    }
}

export async function getInstructorPublicProfile(instructorId: string) {
    const supabase = await createClient()

    try {
        // Get instructor profile data
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, bio, phone, avatar_url, document_verified, created_at')
            .eq('id', instructorId)
            .eq('role', 'INSTRUTOR')
            .maybeSingle()

        if (profileError) throw profileError
        if (!profile) {
            return { error: 'Instrutor não encontrado' }
        }

        // Get instructor assets (vehicle and documents info)
        const { data: assets, error: assetsError } = await supabase
            .from('instructor_assets')
            .select('vehicle_model, license_plate, categoria, verification_status')
            .eq('instructor_id', instructorId)
            .maybeSingle()

        if (assetsError) throw assetsError

        return {
            success: true,
            data: {
                profile,
                assets
            }
        }
    } catch (error: any) {
        return { error: error.message || 'Erro ao carregar perfil do instrutor' }
    }
}

export async function updateAccountSettings(data: {
    // Placeholder for account-specific settings like notifications or password
    // Password change usually happens via supabase.auth.updateUser
    email_notifications?: boolean
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Não autenticado' }
    }

    try {
        // This could also be stored in a separate 'settings' table or in profiles
        // For now, let's assume it's just a mock or we add it to metadata if needed
        // In a real app, you'd have a 'settings' table or JSONB column in 'profiles'

        return { success: true }
    } catch (error: any) {
        return { error: error.message || 'Erro ao atualizar configurações' }
    }
}
