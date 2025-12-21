# 🔒 Como Aplicar RLS Policies - GUIA RÁPIDO

## ⚡ Método 1: Dashboard Supabase (MAIS FÁCIL)

### Passo a Passo:

1. **Abra o Supabase Dashboard:**
   - Acesse: https://supabase.com/dashboard/project/vnnuwpgmzfqrzsameytl

2. **Vá para SQL Editor:**
   - No menu lateral esquerdo, clique em **SQL Editor**
   - Ou acesse direto: https://supabase.com/dashboard/project/vnnuwpgmzfqrzsameytl/sql/new

3. **Cole o SQL:**
   - Abra o arquivo `supabase/rls_policies.sql`
   - Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
   - Cole no SQL Editor do Supabase

4. **Execute:**
   - Clique no botão **RUN** (ou pressione Ctrl+Enter)
   - Aguarde aparecer: ✅ Success. No rows returned

5. **Verifique:**
   - Role até o final do arquivo
   - Execute as queries de verificação que estão lá
   - Deve mostrar que RLS está habilitado em todas as tabelas

---

## 🚀 Método 2: Via CLI (PARA QUEM JÁ USA SUPABASE CLI)

```bash
# 1. Login no Supabase
npx supabase login

# 2. Link com o projeto
npx supabase link --project-ref vnnuwpgmzfqrzsameytl

# 3. Executar o SQL
npx supabase db push

# OU executar direto:
npx supabase db execute --file supabase/rls_policies.sql
```

---

## ✅ Como Saber se Funcionou?

Depois de aplicar, execute este teste no SQL Editor:

```sql
-- Deve retornar TRUE para todas as tabelas
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'instructor_assets', 'slots', 'appointments')
ORDER BY tablename;
```

Resultado esperado:
```
profiles             | t (true)
instructor_assets    | t (true)
slots                | t (true)
appointments         | t (true)
```

---

## 🔥 Teste de Segurança

Após aplicar, teste se está funcionando:

1. **No console do navegador da sua aplicação:**
```javascript
const supabase = createClient()

// Tente se auto-promover a ADMIN (deve FALHAR)
await supabase.from('profiles')
  .update({ role: 'ADMIN' })
  .eq('id', 'seu_user_id')

// Resultado esperado: ❌ Error: new row violates row-level security policy
```

2. **Se der erro = RLS FUNCIONANDO! ✅**

---

## 📋 O que o RLS Faz?

- ✅ Impede usuários de mudarem o próprio role
- ✅ Impede usuários de auto-aprovar documentos
- ✅ Bloqueia visualização de dados de outros usuários
- ✅ Só admins podem aprovar instrutores
- ✅ Só instrutores podem criar horários
- ✅ Só alunos podem criar agendamentos
- ✅ Cria audit log de ações de admin

---

## ⚠️ IMPORTANTE

**APLIQUE ISSO URGENTE!** Sem RLS, qualquer usuário pode:
- Se promover a ADMIN
- Aprovar sua própria conta
- Ver dados de todos os usuários
- Modificar qualquer dado no banco

Com RLS aplicado, seu sistema fica **REALMENTE SEGURO**! 🔐

---

## 🆘 Problemas?

Se der erro ao executar:
1. Verifique se você tem permissões de admin no projeto Supabase
2. Tente executar em partes menores (uma policy por vez)
3. Entre em contato se precisar de ajuda

---

**Tempo estimado: 2 minutos** ⏱️
