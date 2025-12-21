'use server'

import { createClient } from '@/lib/supabase/server'

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Buscar role do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: 'Perfil não encontrado' }
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
    // Determinar bucket baseado no role
    // ADMIN pode escolher, mas por padrão usa 'aluno'
    let bucketName = 'aluno'
    if (profile.role === 'INSTRUTOR') {
      bucketName = 'professor'
    } else if (profile.role === 'ADMIN') {
      // ADMIN pode usar qualquer bucket, mas por padrão usa 'aluno'
      bucketName = 'aluno'
    }
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${fileType}.${fileExt}`

    // Fazer upload no bucket correto
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw uploadError

    // Gerar signed URL (válida por 1 ano) já que o bucket é privado
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000) // 1 ano em segundos

    if (signedUrlError) throw signedUrlError

    return { url: signedUrlData?.signedUrl || '' }
  } catch (error: any) {
    console.error('Erro no upload:', error)
    return { error: error.message || 'Erro ao fazer upload' }
  }
}



