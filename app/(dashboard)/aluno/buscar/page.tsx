'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Heading, Text } from '@/components/ui/typography'
import { SearchContextBar } from '@/components/search/context-bar'
import { InstructorCard } from '@/components/search/instructor-card'
import { useUser } from '@/hooks/use-user'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Instructor {
  id: string
  full_name: string
  bio: string | null
  phone: string | null
  avatar_url: string | null
  document_verified: boolean
  categoria?: 'A' | 'B' | 'AB' | 'ACC'
  is_premium?: boolean
}

export default function BuscarPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadInstructors()
    }
  }, [user])

  const loadInstructors = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'INSTRUTOR')
        .eq('document_verified', true)
        .order('full_name')

      if (error) throw error

      // Mock: Add categoria and premium status
      const categories: Array<'A' | 'B' | 'AB' | 'ACC'> = ['A', 'B', 'AB', 'ACC']
      const enrichedData = (data || []).map(instructor => ({
        ...instructor,
        categoria: categories[Math.floor(Math.random() * categories.length)],
        is_premium: Math.random() > 0.7
      }))

      setInstructors(enrichedData)
    } catch (error: any) {
      toast.error('Erro ao carregar instrutores')
    } finally {
      setLoading(false)
    }
  }

  const handleInstructorClick = (instructor: Instructor) => {
    router.push(`/aluno/instrutor/${instructor.id}`)
  }

  const handleLocationClick = () => {
    toast.info('Seletor de localização em desenvolvimento')
  }

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  if (userLoading || loading) {
    return (
      <DashboardLayout userRole={user?.role || "ALUNO"}>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <Text variant="muted" className="mt-4">Carregando...</Text>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Text>Faça login para continuar</Text>
      </div>
    )
  }

  // Filter instructors by selected categories
  const filteredInstructors = selectedCategories.length > 0
    ? instructors.filter(instructor =>
      instructor.categoria && selectedCategories.includes(instructor.categoria)
    )
    : instructors

  return (
    <DashboardLayout
      userRole={user?.role || "ALUNO"}
      userName={user.full_name || undefined}
      userEmail={user.email}
    >
      {/* Compact Header */}
      <div className="mb-4">
        <Heading level={1}>Instrutores</Heading>
      </div>

      {/* Context Bar (sticky) */}
      <SearchContextBar
        selectedCategories={selectedCategories}
        onLocationClick={handleLocationClick}
        onCategoryToggle={handleCategoryToggle}
        className="-mx-6 px-6"
      />

      {/* Instructor List */}
      <div className="max-w-2xl mx-auto space-y-3 mt-6">
        {filteredInstructors.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Heading level={3}>Nenhum instrutor encontrado</Heading>
                <Text variant="muted" className="max-w-sm mx-auto">
                  {selectedCategories.length > 0
                    ? 'Não encontramos instrutores com essas categorias'
                    : 'Não encontramos instrutores disponíveis no momento'
                  }
                </Text>
              </div>
              {selectedCategories.length > 0 && (
                <Button onClick={() => setSelectedCategories([])}>
                  Limpar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredInstructors.map((instructor) => (
            <InstructorCard
              key={instructor.id}
              id={instructor.id}
              name={instructor.full_name}
              photo={instructor.avatar_url}
              categoria={instructor.categoria || 'B'}
              distance={Math.random() * 5 + 0.5}
              price={Math.random() * 50 + 100}
              featured={instructor.is_premium}
              verified={instructor.document_verified}
              onClick={() => handleInstructorClick(instructor)}
            />
          ))
        )}
      </div>

      {/* First-time user hint */}
      {filteredInstructors.length > 0 && (
        <div className="max-w-2xl mx-auto mt-8">
          <Text variant="muted" className="text-center">
            Aqui você encontra instrutores próximos para aulas práticas
          </Text>
        </div>
      )}
    </DashboardLayout>
  )
}


