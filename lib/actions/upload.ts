'use server'

import { createClient } from '@/lib/supabase/server'

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  const file = formData.get('file') as File
  const fileType = formData.get('type') as string

  if (!file) {
    return { error: 'Nenhum arquivo fornecido' }
  }

  // Validar tamanho (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Arquivo muito grande (máximo 5MB)' }
  }

  // Validar tipo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Tipo de arquivo não permitido. Use JPG, PNG ou WEBP' }
  }

  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${fileType}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    return { url: publicUrl }
  } catch (error: any) {
    return { error: error.message || 'Erro ao fazer upload' }
  }
}



