# Setup do Storage Bucket no Supabase

Execute as seguintes etapas no Supabase Dashboard:

## 1. Criar Bucket

1. Acesse Storage no painel do Supabase
2. Clique em "Create bucket"
3. Nome: `documents`
4. **Desmarque** "Public bucket" (será privado)
5. Clique em "Create bucket"

## 2. Configurar Políticas de Storage

Execute este SQL no SQL Editor do Supabase:

```sql
-- Política para upload de documentos
-- Apenas o usuário pode fazer upload de seus próprios documentos
CREATE POLICY "Usuários podem fazer upload de documentos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para visualização de documentos
-- Apenas o usuário pode ver seus próprios documentos
CREATE POLICY "Usuários podem ver seus próprios documentos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para atualização de documentos
-- Apenas o usuário pode atualizar seus próprios documentos
CREATE POLICY "Usuários podem atualizar seus próprios documentos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para deletar documentos
-- Apenas o usuário pode deletar seus próprios documentos
CREATE POLICY "Usuários podem deletar seus próprios documentos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 3. Estrutura de Pastas

Os arquivos serão organizados assim:
```
documents/
  ├── {user_id}/
  │   ├── cnh.jpg
  │   ├── credential.jpg
  │   └── avatar.jpg
```

## 4. Tipos de Arquivo Aceitos

- Imagens: JPG, PNG, WEBP
- Tamanho máximo: 5MB por arquivo



