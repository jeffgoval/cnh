'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStudentTimeline, updateAppointmentStatus } from '@/lib/actions/appointments'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Heading, Text } from '@/components/ui/typography'
import { useUser } from '@/hooks/use-user'
import { toast } from 'sonner'
import { CheckCircle2, Circle, Car, Bike, Search, MapPin, DollarSign, Phone, MessageCircle, Clock, X } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/money'
import { formatPhone } from '@/lib/utils/masks'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface TimelineItem {
  id: string
  type: 'completed' | 'next' | 'upcoming'
  datetime: string
  instructorName: string
  categoria: 'A' | 'B' | 'AB' | 'ACC'
  feedback?: string
  status: string
  location_address?: string
  price?: number
  instructorPhone?: string | null
  end_time?: string
  appointmentId: string
}

export default function MinhasAulasPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)

    const result = await getStudentTimeline()

    if (result.error) {
      toast.error(result.error)
    } else if (result.appointments) {
      processTimeline(result.appointments)
    }

    setLoading(false)
  }

  const processTimeline = (appointments: any[]) => {
    const now = new Date()
    const nowTime = now.getTime()

    const items: TimelineItem[] = appointments
      .map(apt => {
        const startTime = new Date(apt.slot.start_time).getTime()
        let type: TimelineItem['type'] = 'upcoming'

        if (apt.status === 'completed' || startTime < nowTime) {
          type = 'completed'
        } else if (startTime >= nowTime) {
          type = 'upcoming'
        }

        return {
          id: apt.id,
          type,
          datetime: apt.slot.start_time,
          instructorName: apt.instructor?.full_name || 'Instrutor',
          categoria: apt.slot.categoria || 'B',
          feedback: apt.notes,
          status: apt.status,
          location_address: apt.slot.location_address,
          price: apt.slot.price,
          instructorPhone: apt.instructor?.phone || null,
          end_time: apt.slot.end_time,
          appointmentId: apt.id
        }
      })

    // Separar completed e upcoming
    const completed = items.filter(i => i.type === 'completed').slice(0, 5)
    const upcoming = items.filter(i => i.type === 'upcoming')

    // Marcar a próxima como "next"
    if (upcoming.length > 0) {
      upcoming[0].type = 'next'
    }

    // Combinar: completed + next + upcoming (máx 8-10 itens)
    const finalTimeline = [...completed, ...upcoming.slice(0, 5)]
    setTimeline(finalTimeline)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (itemDate.getTime() === today.getTime()) {
      return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    } else if (itemDate.getTime() === tomorrow.getTime()) {
      return `Amanhã às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    return `${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  }

  const handleContactWhatsApp = (phone: string | null, instructorName: string) => {
    if (!phone) {
      toast.error('Telefone não disponível')
      return
    }

    const cleanPhone = phone.replace(/\D/g, '')
    const message = encodeURIComponent(
      `Olá ${instructorName}, tenho uma aula agendada e gostaria de entrar em contato.`
    )
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank')
  }

  const handleCancelClick = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return

    setCancellingId(appointmentToCancel)
    try {
      const result = await updateAppointmentStatus(appointmentToCancel, 'cancelled')
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Aula cancelada com sucesso')
        setExpandedItemId(null)
        loadData()
      }
    } catch (error: any) {
      toast.error('Erro ao cancelar aula')
    } finally {
      setCancellingId(null)
      setAppointmentToCancel(null)
      setCancelDialogOpen(false)
    }
  }

  const renderTimelineItem = (item: TimelineItem, index: number, items: TimelineItem[]) => {
    const VehicleIcon = item.categoria === 'A' ? Bike : Car

    // Separador de seções
    const showCompletedSeparator = index === 0 && item.type === 'completed'
    const prevItem = index > 0 ? items[index - 1] : null
    const showNextSeparator = item.type === 'next' && prevItem?.type === 'completed'
    const showUpcomingSeparator = item.type === 'upcoming' && prevItem?.type !== 'upcoming'

    return (
      <div key={item.id}>
        {showCompletedSeparator && (
          <div className="mb-3">
            <Text variant="small" className="text-muted-foreground font-medium">Últimas aulas</Text>
          </div>
        )}
        {showNextSeparator && (
          <div className="my-4">
            <Text variant="small" className="text-muted-foreground font-medium">Próxima</Text>
          </div>
        )}
        {showUpcomingSeparator && (
          <div className="my-4">
            <Text variant="small" className="text-muted-foreground font-medium">Agendadas</Text>
          </div>
        )}

        {/* AULA CONCLUÍDA */}
        {item.type === 'completed' && (
          <Card className="bg-muted/30 border-muted mb-3">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Text variant="small" className="text-muted-foreground">Aula concluída</Text>
                  <div className="flex items-center gap-2">
                    <VehicleIcon className="h-4 w-4 text-muted-foreground" />
                    <Text className="font-medium">{item.categoria === 'A' ? 'Moto' : 'Carro'}</Text>
                  </div>
                  <Text variant="small" className="text-muted-foreground">
                    Instrutor: {item.instructorName}
                  </Text>
                  <Text variant="small" className="text-muted-foreground">
                    {formatTime(item.datetime)}
                  </Text>
                  {item.feedback && (
                    <div className="mt-2 p-2 bg-background rounded border border-border/50">
                      <Text variant="small" className="italic text-muted-foreground">
                        "{item.feedback}"
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PRÓXIMA AULA - ÚNICA FONTE DE VERDADE */}
        {item.type === 'next' && (
          <Card className="border-2 border-primary bg-primary/5 mb-3">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <Text variant="small" className="text-primary font-medium">Próxima aula</Text>
                    <Text className="font-semibold">
                      {formatDate(item.datetime)} • {item.categoria === 'A' ? 'Moto' : 'Carro'}
                    </Text>
                    <Text variant="small" className="text-muted-foreground">
                      Instrutor: {item.instructorName}
                    </Text>
                  </div>

                  {/* DETALHES EXPANDIDOS */}
                  {expandedItemId === item.id && (
                    <div className="space-y-3 pt-2 border-t border-primary/20">
                      {item.location_address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <Text variant="small" className="text-muted-foreground">Local</Text>
                            <Text variant="small" className="font-medium">{item.location_address}</Text>
                          </div>
                        </div>
                      )}

                      {item.price !== undefined && (
                        <div className="flex items-start gap-2">
                          <DollarSign className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <Text variant="small" className="text-muted-foreground">Preço</Text>
                            <Text variant="small" className="font-medium text-primary">
                              {formatCurrency(item.price)}
                            </Text>
                          </div>
                        </div>
                      )}

                      {item.instructorPhone && (
                        <div className="flex items-start gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <Text variant="small" className="text-muted-foreground">Telefone</Text>
                            <Text variant="small" className="font-medium">
                              {formatPhone(item.instructorPhone)}
                            </Text>
                          </div>
                        </div>
                      )}

                      {item.end_time && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <Text variant="small" className="text-muted-foreground">Horário</Text>
                            <Text variant="small" className="font-medium">
                              {formatTimeRange(item.datetime, item.end_time)}
                            </Text>
                          </div>
                        </div>
                      )}

                      {item.feedback && (
                        <div className="flex items-start gap-2">
                          <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          <div>
                            <Text variant="small" className="text-muted-foreground">Observações</Text>
                            <Text variant="small" className="italic">{item.feedback}</Text>
                          </div>
                        </div>
                      )}

                      {/* AÇÕES */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        {item.instructorPhone && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleContactWhatsApp(item.instructorPhone, item.instructorName)}
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Contatar instrutor
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCancelClick(item.appointmentId)}
                          disabled={cancellingId === item.appointmentId}
                        >
                          {cancellingId === item.appointmentId ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                              Cancelando...
                            </>
                          ) : (
                            <>
                              <X className="mr-2 h-4 w-4" />
                              Cancelar aula
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* BOTÃO VER DETALHES / OCULTAR */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto"
                    onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                  >
                    {expandedItemId === item.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AULA FUTURA */}
        {item.type === 'upcoming' && (
          <Card className="hover:border-primary/30 transition-colors mb-3">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Text className="font-medium">{formatDate(item.datetime)}</Text>
                  <Text variant="small" className="text-muted-foreground">
                    {item.instructorName}
                  </Text>
                  <div className="flex items-center gap-2">
                    <VehicleIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <Text variant="small">{item.categoria === 'A' ? 'Moto' : 'Carro'}</Text>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Função para gerar mensagem de status dinâmica
  const getStatusMessage = () => {
    const nextClass = timeline.find(i => i.type === 'next')
    const hasCompletedClasses = timeline.some(i => i.type === 'completed')
    const completedCount = timeline.filter(i => i.type === 'completed').length

    if (nextClass) {
      return 'Você tem uma aula prática agendada.'
    } else if (hasCompletedClasses && completedCount >= 3) {
      return 'Seu progresso está consistente.'
    } else if (!nextClass && !hasCompletedClasses) {
      return 'Que tal agendar sua próxima aula?'
    } else {
      return 'Continue praticando para evoluir.'
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

  return (
    <DashboardLayout
      userRole={user?.role || "ALUNO"}
      userName={user?.full_name || undefined}
      userEmail={user?.email}
    >
      <div className="space-y-6 max-w-2xl mx-auto pb-8">
        {/* 1️⃣ SAUDAÇÃO - Contexto humano */}
        <div>
          <Heading level={1}>Olá, {user?.full_name?.split(' ')[0] || 'Aluno'}</Heading>
          <Text variant="muted" className="mt-1">Você está no controle da sua prática</Text>
        </div>

        {/* 2️⃣ MENSAGEM DE STATUS - 1 linha, dinâmica, interpretação */}
        <div>
          <Text className="text-base">{getStatusMessage()}</Text>
        </div>

        {/* 3️⃣ TIMELINE - ÚNICA FONTE DE VERDADE */}
        <div className="space-y-3">
          {timeline.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <Heading level={3}>Quando você concluir suas aulas</Heading>
                  <Text variant="muted" className="max-w-sm mx-auto">
                    Elas aparecem aqui
                  </Text>
                </div>
                <Link href="/aluno/buscar">
                  <Button size="lg">Agendar primeira aula</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            timeline.map((item, index) => renderTimelineItem(item, index, timeline))
          )}
        </div>
      </div>

      {/* Dialog de confirmação de cancelamento */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false)
          setAppointmentToCancel(null)
        }}
        onConfirm={handleCancelConfirm}
        title="Cancelar aula"
        description="Tem certeza que deseja cancelar esta aula? Esta ação não pode ser desfeita."
        confirmText="Cancelar aula"
        cancelText="Manter aula"
        variant="destructive"
      />
    </DashboardLayout>
  )
}


