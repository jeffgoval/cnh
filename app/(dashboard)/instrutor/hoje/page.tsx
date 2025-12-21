'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getInstructorTimeline, getInstructorStats, updateAppointmentStatus } from '@/lib/actions/appointments'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Heading, Text } from '@/components/ui/typography'
import { useUser } from '@/hooks/use-user'
import { toast } from 'sonner'
import { CheckCircle2, Circle, AlertCircle, XCircle, Car, Bike, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/money'
import Link from 'next/link'

interface TimelineItem {
  id: string
  type: 'completed' | 'current' | 'upcoming' | 'cancelled'
  datetime: string
  studentName: string
  categoria: 'A' | 'B' | 'AB' | 'ACC'
  price: number
  note?: string
  status: string
}

export default function MeuDiaPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [stats, setStats] = useState({ today: 0, week: 0, monthEarnings: 0 })
  const [loading, setLoading] = useState(true)
  const [startingClass, setStartingClass] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)

    // Carregar timeline e stats em paralelo
    const [timelineResult, statsResult] = await Promise.all([
      getInstructorTimeline(),
      getInstructorStats()
    ])

    if (timelineResult.error) {
      toast.error(timelineResult.error)
    } else if (timelineResult.appointments) {
      processTimeline(timelineResult.appointments)
    }

    if (statsResult.error) {
      toast.error(statsResult.error)
    } else if (statsResult.stats) {
      setStats(statsResult.stats)
    }

    setLoading(false)
  }

  const processTimeline = (appointments: any[]) => {
    const now = new Date()
    const nowTime = now.getTime()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const todayEnd = todayStart + 24 * 60 * 60 * 1000

    const items: TimelineItem[] = appointments
      .filter(apt => apt.status !== 'cancelled' || apt.slot.start_time < now.toISOString())
      .map(apt => {
        const startTime = new Date(apt.slot.start_time).getTime()
        const endTime = new Date(apt.slot.end_time).getTime()

        let type: TimelineItem['type'] = 'upcoming'

        if (apt.status === 'cancelled') {
          type = 'cancelled'
        } else if (apt.status === 'completed') {
          type = 'completed'
        } else if (startTime <= nowTime && nowTime <= endTime) {
          type = 'current'
        } else if (startTime < nowTime) {
          type = 'completed'
        }

        return {
          id: apt.id,
          type,
          datetime: apt.slot.start_time,
          studentName: apt.student?.full_name || 'Aluno',
          categoria: apt.slot.categoria || 'B',
          price: apt.slot.price || 0,
          note: apt.notes,
          status: apt.status
        }
      })
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())

    // Limitar a 10 itens - priorizar completed recentes + current + upcoming
    const completed = items.filter(i => i.type === 'completed').slice(-3)
    const current = items.filter(i => i.type === 'current')
    const upcoming = items.filter(i => i.type === 'upcoming').slice(0, 6)
    const cancelled = items.filter(i => i.type === 'cancelled').slice(-1)

    const finalTimeline = [...completed, ...current, ...upcoming, ...cancelled].slice(0, 10)
    setTimeline(finalTimeline)
  }

  const handleStartClass = async (itemId: string) => {
    setStartingClass(itemId)
    // Por enquanto, apenas confirmar
    const result = await updateAppointmentStatus(itemId, 'confirmed')
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Aula iniciada!')
      loadData()
    }
    setStartingClass(null)
  }

  const formatDate = () => {
    const date = new Date()
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRelativeDay = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    if (itemDate.getTime() === today.getTime()) {
      return 'Hoje'
    } else if (itemDate.getTime() === tomorrow.getTime()) {
      return 'Amanhã'
    } else if (itemDate > tomorrow) {
      return 'Próximos dias'
    } else {
      return null
    }
  }

  const renderTimelineItem = (item: TimelineItem, index: number, items: TimelineItem[]) => {
    const prevItem = index > 0 ? items[index - 1] : null
    const currentDay = getRelativeDay(item.datetime)
    const prevDay = prevItem ? getRelativeDay(prevItem.datetime) : null
    const showSeparator = currentDay && currentDay !== prevDay

    const VehicleIcon = item.categoria === 'A' ? Bike : Car

    return (
      <div key={item.id}>
        {showSeparator && (
          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-border" />
            <Text variant="small" className="text-muted-foreground font-medium">
              {currentDay}
            </Text>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}

        {/* AULA CONCLUÍDA */}
        {item.type === 'completed' && (
          <Card className="bg-muted/30 border-muted">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Text variant="small" className="text-muted-foreground">Aula concluída</Text>
                  <Text className="font-medium">{item.studentName}</Text>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatTime(item.datetime)}</span>
                    <span>•</span>
                    <VehicleIcon className="h-3.5 w-3.5" />
                  </div>
                  {item.note && (
                    <Text variant="small" className="text-muted-foreground italic">"{item.note}"</Text>
                  )}
                </div>
                <Text className="font-semibold text-green-600 flex-shrink-0">
                  + {formatCurrency(item.price)}
                </Text>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AULA ATUAL / IMINENTE */}
        {item.type === 'current' && (
          <Card className="border-2 border-primary bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <Text variant="small" className="text-primary font-medium">Agora</Text>
                    <Text className="font-semibold text-lg">{item.studentName}</Text>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <VehicleIcon className="h-4 w-4" />
                      <span>{item.categoria === 'A' ? 'Moto' : 'Carro'}</span>
                      <span>•</span>
                      <span className="text-muted-foreground">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleStartClass(item.id)}
                    disabled={startingClass === item.id}
                  >
                    {startingClass === item.id ? 'Iniciando...' : 'Iniciar aula'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AULA FUTURA */}
        {item.type === 'upcoming' && (
          <Card className="hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Text variant="small" className="text-muted-foreground">{formatTime(item.datetime)}</Text>
                  <Text className="font-medium">{item.studentName}</Text>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <VehicleIcon className="h-3.5 w-3.5" />
                    <span>{item.categoria === 'A' ? 'Moto' : 'Carro'}</span>
                  </div>
                </div>
                <Text className="text-muted-foreground flex-shrink-0">
                  {formatCurrency(item.price)}
                </Text>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AULA CANCELADA */}
        {item.type === 'cancelled' && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 space-y-1">
                  <Text variant="small" className="text-amber-700">Aula cancelada</Text>
                  <Text className="font-medium text-amber-900">{item.studentName}</Text>
                  <Text variant="small" className="text-amber-600">{formatTime(item.datetime)}</Text>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  if (userLoading || loading) {
    return (
      <DashboardLayout userRole={user?.role || "INSTRUTOR"}>
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
      userRole={user?.role || "INSTRUTOR"}
      userName={user?.full_name || undefined}
      userEmail={user?.email}
    >
      <div className="space-y-6 max-w-2xl mx-auto pb-8">
        {/* 📌 CABEÇALHO */}
        <div>
          <Heading level={1}>Meu dia</Heading>
          <Text variant="muted" className="mt-1 capitalize">{formatDate()}</Text>
        </div>

        {/* 📌 VISÃO GERAL */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          <Card className="flex-shrink-0 min-w-[140px] border-l-4 border-l-primary">
            <CardContent className="p-4">
              <Text variant="small" className="text-muted-foreground">Hoje</Text>
              <Heading level={2} className="mt-1">{stats.today}</Heading>
              <Text variant="small" className="text-muted-foreground">aulas</Text>
            </CardContent>
          </Card>

          <Card className="flex-shrink-0 min-w-[140px] border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <Text variant="small" className="text-muted-foreground">Semana</Text>
              <Heading level={2} className="mt-1">{stats.week}</Heading>
              <Text variant="small" className="text-muted-foreground">aulas</Text>
            </CardContent>
          </Card>

          <Card className="flex-shrink-0 min-w-[140px] border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <Text variant="small" className="text-muted-foreground">Mês</Text>
              <Heading level={2} className="mt-1 text-green-600">{formatCurrency(stats.monthEarnings)}</Heading>
              <Text variant="small" className="text-muted-foreground">ganho</Text>
            </CardContent>
          </Card>
        </div>

        {/* 📌 LINHA DO TEMPO */}
        <div className="space-y-3">
          {timeline.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <Heading level={3}>Nenhuma aula hoje</Heading>
                  <Text variant="muted" className="max-w-sm mx-auto">
                    Abra horários na agenda para receber pedidos
                  </Text>
                </div>
                <Link href="/instrutor/agenda">
                  <Button size="lg">Abrir agenda</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            timeline.map((item, index) => renderTimelineItem(item, index, timeline))
          )}
        </div>

        {/* 📌 BOTÃO FINAL */}
        {timeline.length > 0 && (
          <div className="pt-4">
            <Link href="/instrutor/agenda">
              <Button variant="outline" size="lg" className="w-full">
                Ver agenda completa
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
