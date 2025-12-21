'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useUser } from '@/hooks/use-user'
import { Card, CardContent } from '@/components/ui/card'
import { Heading, Text } from '@/components/ui/typography'
import { Search } from 'lucide-react'

export default function BuscarPage() {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <DashboardLayout userRole="ALUNO">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user || user.role !== 'ALUNO') {
    return (
      <DashboardLayout userRole={user?.role}>
        <div className="flex h-screen flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-medium text-destructive">Acesso Negado</h1>
          <p className="text-muted-foreground">Apenas alunos podem acessar esta página</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      userRole={user.role}
      userName={user.full_name || undefined}
      userEmail={user.email}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <Heading level={1}>Buscar Instrutores</Heading>
          <Text variant="muted" className="mt-1">
            Encontre o instrutor ideal para suas aulas
          </Text>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <Heading level={3}>Em Desenvolvimento</Heading>
            <Text variant="muted" className="mt-2 max-w-sm mx-auto">
              A funcionalidade de busca de instrutores está sendo implementada
            </Text>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
