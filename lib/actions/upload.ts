'use server'

import { createClient } from '@/lib/supabase/server'

export async function uploadDocument(file: File, documentType: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        upsert: true
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    return { url: publicUrl }
  } catch (error: any) {
    return { error: error.message || 'Erro ao fazer upload do documento' }
  }
}

export async function uploadFile(file: File, bucket: string, path: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${path}.${fileExt}`

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        upsert: true
      })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return { url: publicUrl }
  } catch (error: any) {
    return { error: error.message || 'Erro ao fazer upload' }
  }
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Erro ao deletar arquivo' }
  }
}
