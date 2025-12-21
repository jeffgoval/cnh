# AgendaCNH - Marketplace de Instrutores de Trânsito

MVP de um marketplace para conectar alunos e instrutores de trânsito autônomos, desenvolvido com Next.js 15, Supabase e TypeScript.

## 🚀 Tecnologias

- **Next.js 15** (App Router) com React 19
- **Supabase** (PostgreSQL, Auth, Storage, RLS)
- **TypeScript** para type safety
- **Tailwind CSS** para estilização
- **Shadcn/UI** para componentes
- **Server Actions** para lógica de negócio

## 📋 Funcionalidades Implementadas

### Autenticação
- ✅ Login e cadastro com Supabase Auth
- ✅ Seleção de role (ALUNO/INSTRUTOR)
- ✅ Redirecionamento baseado em role

### Instrutor
- ✅ Onboarding com upload de documentos (CNH, credencial)
- ✅ Gerenciamento de agenda (criar/visualizar/deletar slots)
- ✅ Lista de agendamentos com filtros de status
- ✅ Confirmação e conclusão de aulas
- ✅ Auto-aprovação de verificação (MVP)

### Aluno
- ✅ Busca de instrutores verificados
- ✅ Visualização de horários disponíveis
- ✅ Agendamento de aulas com observações
- ✅ Cancelamento de aulas
- ✅ Dashboard com estatísticas

### Banco de Dados
- ✅ 4 tabelas principais: profiles, instructor_assets, slots, appointments
- ✅ RLS policies configuradas
- ✅ Triggers para atualização automática de timestamps
- ✅ Índices para otimização de queries

### Storage
- ✅ Bucket configurado para documentos
- ✅ Políticas de acesso privado por usuário
- ✅ Upload de CNH e credencial

## 🗂️ Estrutura do Projeto

```
app/
├── (auth)/
│   ├── login/              # Login
│   └── cadastro/           # Cadastro com seleção de role
├── (dashboard)/
│   ├── instrutor/
│   │   ├── agenda/         # Gerenciar slots
│   │   ├── perfil/         # Upload de docs
│   │   └── aulas/          # Ver agendamentos
│   └── aluno/
│       ├── buscar/         # Buscar instrutores
│       └── minhas-aulas/   # Ver agendamentos
├── api/
│   └── webhooks/           # (Preparado para n8n)
└── page.tsx               # Landing page

components/
└── ui/                    # Componentes Shadcn

lib/
├── supabase/
│   ├── client.ts          # Cliente browser
│   ├── server.ts          # Cliente server
│   └── types.ts           # Types do schema
└── actions/
    ├── upload.ts          # Upload de documentos
    ├── slots.ts           # CRUD de slots
    └── appointments.ts    # CRUD de appointments

supabase/
├── schema.sql             # Schema do banco
├── rls_policies.sql       # Políticas RLS
└── storage_setup.md       # Instruções de setup
```

## 🚦 Setup

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

No Supabase SQL Editor, execute em ordem:

1. `supabase/schema.sql` - Criar tabelas
2. `supabase/rls_policies.sql` - Configurar RLS
3. Seguir `supabase/storage_setup.md` - Criar bucket

### 3. Variáveis de Ambiente

O arquivo `.env.local` já está configurado com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zpsmamardiijslxsvqcn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

### 4. Executar

```bash
npm run dev
```

Acesse: http://localhost:3000

## 📖 Fluxo de Uso

### Instrutor

1. Cadastro → Selecionar "Sou Instrutor"
2. Completar perfil com CPF, RENACH, dados do veículo
3. Upload de CNH e credencial (auto-aprovado no MVP)
4. Criar horários disponíveis na agenda
5. Receber e confirmar agendamentos de alunos

### Aluno

1. Cadastro → Selecionar "Sou Aluno"
2. Buscar instrutores verificados
3. Ver horários disponíveis do instrutor
4. Agendar aula com observações opcionais
5. Acompanhar status do agendamento

## 🔐 Segurança

- **RLS ativo** em todas as tabelas
- Usuários veem apenas seus próprios dados
- Instrutores verificados são públicos
- Storage com acesso privado por usuário
- Server Actions para toda lógica de negócio

## 🎨 Paleta de Cores

- **Primary**: #0061FF (Azul Dropbox)
- **Success**: #10B981
- **Warning**: #F59E0B
- **Error**: #EF4444

## 🔮 Próximos Passos (Não Implementados)

- [ ] Integração com n8n para validação de documentos via IA
- [ ] Notificações WhatsApp
- [ ] Pagamentos (Mercado Pago/Stripe)
- [ ] Sistema de avaliações
- [ ] Calendário visual interativo
- [ ] Filtros avançados de busca
- [ ] Upload de avatar
- [ ] Dark mode

## 📝 Notas

- **Auto-aprovação**: Instrutores são automaticamente aprovados no MVP para facilitar testes
- **Validação**: Implementada localmente (sem n8n/IA no MVP)
- **Preços**: Armazenados em centavos para evitar erros de float
- **Timezone**: Usar timestamps com timezone (timestamptz)

## 🐛 Debug

Se encontrar erros:

1. Verificar se o schema SQL foi executado
2. Verificar se as RLS policies foram aplicadas
3. Verificar se o bucket de storage foi criado
4. Verificar variáveis de ambiente no `.env.local`
5. Limpar cache: `rm -rf .next` e rebuild

## 📄 Licença

Projeto MVP para demonstração.



