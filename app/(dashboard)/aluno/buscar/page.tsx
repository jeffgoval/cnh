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
import { Calendar, MapPin, Clock, Phone, Star, CheckCircle2 } from 'lucide-react'
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
        loadSlots(selectedInstructor.id)
      }
    } catch (error: any) {
      toast.error('Erro ao agendar aula')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (userLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Buscar Instrutores</h1>
          <p className="text-muted-foreground mt-2">
            Encontre instrutores verificados e agende sua próxima aula
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lista de Instrutores */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-medium">Instrutores Disponíveis</h2>
              <Badge variant="secondary" className="font-normal">
                {instructors.length} {instructors.length === 1 ? 'instrutor' : 'instrutores'}
              </Badge>
            </div>

            {instructors.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Star className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
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
                      className={`cursor-pointer transition-all ${isSelected
                        ? 'border-primary shadow-sm'
                        : 'hover:border-muted-foreground/30'
                        }`}
                      onClick={() => handleSelectInstructor(instructor)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="h-14 w-14">
                              <AvatarImage src={instructor.avatar_url || ''} alt={instructor.full_name} />
                              <AvatarFallback className="bg-muted text-foreground font-medium">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5 border-2 border-background">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-medium">
                              {instructor.full_name}
                            </CardTitle>
                            {instructor.bio && (
                              <CardDescription className="mt-1 text-sm line-clamp-2">
                                {instructor.bio}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      {instructor.phone && (
                        <CardContent className="pt-0">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{formatPhone(instructor.phone)}</span>
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
            <div className="mb-1">
              <h2 className="text-lg font-medium">
                {selectedInstructor ? `Horários - ${selectedInstructor.full_name.split(' ')[0]}` : 'Horários Disponíveis'}
              </h2>
              {selectedInstructor && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selecione um horário para agendar sua aula
                </p>
              )}
            </div>

            {selectedInstructor ? (
              <>
                {slots.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        Nenhum horário disponível no momento
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Campo de Observações */}
                    <Card className="bg-muted/30">
                      <CardContent className="pt-5 pb-5">
                        <Label htmlFor="notes" className="text-sm font-medium">
                          Observações (opcional)
                        </Label>
                        <Input
                          id="notes"
                          className="mt-2"
                          placeholder="Ex: Preciso praticar baliza"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </CardContent>
                    </Card>

                    {/* Lista de Slots */}
                    <div className="space-y-3">
                      {slots.map((slot) => (
                        <Card key={slot.id} className="hover:border-muted-foreground/30 transition-colors">
                          <CardContent className="pt-5 pb-5">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <div className="font-medium">
                                      {formatDate(slot.start_time)}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-0.5">
                                      Duração: 1 hora
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                  <span className="line-clamp-2">{slot.location_address}</span>
                                </div>
                                <div className="text-xl font-medium">
                                  {formatCurrency(slot.price)}
                                </div>
                              </div>
                              <Button
                                onClick={() => handleBookSlot(slot)}
                                disabled={loading}
                                size="default"
                                className="w-full sm:w-auto"
                              >
                                {loading ? 'Agendando...' : 'Agendar'}
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
              <Card>
                <CardContent className="py-16 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-1">
                    Selecione um instrutor
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Escolha um instrutor ao lado para ver os horários
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
