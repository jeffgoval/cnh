'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAvailableSlots } from '@/lib/actions/slots'
import { createAppointment } from '@/lib/actions/appointments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useUser } from '@/hooks/use-user'
import { toast } from 'sonner'
import { Calendar, MapPin, Clock, Phone, Star } from 'lucide-react'
import { formatPhone } from '@/lib/utils/masks'
import { formatCurrency } from '@/lib/utils/money'

interface Instructor {
  id: string
  full_name: string
  bio: string | null
  phone: string | null
  avatar_url: string | null
}

interface Slot {
  id: string
  start_time: string
  end_time: string
  price: number
  location_address: string
}

export default function BuscarPage() {
  const { user, loading: userLoading } = useUser()
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadInstructors()
    }
  }, [user])

  const loadInstructors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'INSTRUTOR')
        .eq('document_verified', true)
        .order('full_name')

      if (error) throw error

      setInstructors(data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar instrutores')
    }
  }

  const loadSlots = async (instructorId: string) => {
    const result = await getAvailableSlots(instructorId)
    if (result.error) {
      toast.error(result.error)
    } else {
      setSlots(result.slots || [])
    }
  }

  const handleSelectInstructor = (instructor: Instructor) => {
    setSelectedInstructor(instructor)
    loadSlots(instructor.id)
  }

  const handleBookSlot = async (slot: Slot) => {
    if (!selectedInstructor) return

    setLoading(true)
    try {
      const result = await createAppointment({
        slot_id: slot.id,
        instructor_id: selectedInstructor.id,
        notes,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Aula agendada com sucesso!')
        setNotes('')
        loadSlots(selectedInstructor.id) // Recarregar slots
      }
    } catch (error: any) {
      toast.error('Erro ao agendar aula')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  if (userLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>
  }

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Faça login para continuar</div>
  }

  return (
    <DashboardLayout
      userRole={user?.role || "ALUNO"}
      userName={user.full_name || undefined}
      userEmail={user.email}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buscar Instrutores</h1>
          <p className="text-muted-foreground mt-2">
            Encontre instrutores verificados e agende sua aula de direção
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lista de Instrutores */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Instrutores Disponíveis</h2>
              <Badge variant="secondary">{instructors.length} verificados</Badge>
            </div>

            {instructors.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Nenhum instrutor disponível no momento
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {instructors.map((instructor) => {
                  const isSelected = selectedInstructor?.id === instructor.id
                  const initials = instructor.full_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <Card
                      key={instructor.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:border-primary/50'
                        }`}
                      onClick={() => handleSelectInstructor(instructor)}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarImage src={instructor.avatar_url || ''} alt={instructor.full_name} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {instructor.full_name}
                              <Badge variant="success" className="text-xs">Verificado</Badge>
                            </CardTitle>
                            {instructor.bio && (
                              <CardDescription className="mt-1 line-clamp-2">
                                {instructor.bio}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      {instructor.phone && (
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {formatPhone(instructor.phone)}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {/* Horários Disponíveis */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                {selectedInstructor ? `Horários de ${selectedInstructor.full_name.split(' ')[0]}` : 'Selecione um instrutor'}
              </h2>
            </div>

            {selectedInstructor ? (
              <>
                {slots.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Clock className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Nenhum horário disponível no momento
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Card className="bg-muted/50">
                      <CardContent className="pt-6">
                        <Label htmlFor="notes" className="text-sm font-medium">
                          Observações (opcional)
                        </Label>
                        <Input
                          id="notes"
                          className="mt-2"
                          placeholder="Ex: Preciso praticar baliza e estacionamento"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          Adicione informações relevantes para seu instrutor
                        </p>
                      </CardContent>
                    </Card>

                    <div className="space-y-3">
                      {slots.map((slot) => (
                        <Card key={slot.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <div className="font-semibold">
                                      {formatDate(slot.start_time)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Duração: 1 hora
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-2">{slot.location_address}</span>
                                </div>
                                <div className="text-2xl font-bold text-primary">
                                  {formatCurrency(slot.price)}
                                </div>
                              </div>
                              <Button
                                onClick={() => handleBookSlot(slot)}
                                disabled={loading}
                                size="lg"
                                className="w-full sm:w-auto"
                              >
                                {loading ? 'Agendando...' : 'Agendar Aula'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-lg mb-2">
                    Selecione um instrutor
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Escolha um instrutor ao lado para ver os horários disponíveis
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout >
  )
}

