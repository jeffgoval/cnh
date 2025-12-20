'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getStudentAppointments, updateAppointmentStatus } from '@/lib/actions/appointments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useUser } from '@/hooks/use-user'
import { toast } from 'sonner'
import { Calendar, MapPin, Phone, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle, BookOpen } from 'lucide-react'
import { formatPhone } from '@/lib/utils/masks'
import { formatCurrency } from '@/lib/utils/money'
import { LoadingState } from '@/components/ui/loading-state'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface Appointment {
  id: string
  status: string
  notes: string | null
  created_at: string
  slot: {
    start_time: string
    end_time: string
    location_address: string
    price: number
  }
  instructor: {
    full_name: string
    phone: string | null
  }
}

export default function MinhasAulasPage() {
  const { user, loading: userLoading } = useUser()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)

  const loadAppointments = async () => {
    const result = await getStudentAppointments()
    if (result.error) {
      toast.error(result.error)
    } else {
      setAppointments(result.appointments || [])
    }
  }

  useEffect(() => {
    if (user) {
      loadAppointments()
    }
  }, [user])

  if (userLoading) {
    return <LoadingState message="Carregando seus agendamentos..." />
  }

  if (!user) {
    return <div className="flex h-screen items-center justify-center">Faça login para continuar</div>
  }

  const handleCancel = (appointmentId: string) => {
    setCancelId(appointmentId)
  }

  const confirmCancel = async () => {
    if (!cancelId) return

    setLoading(cancelId)
    const result = await updateAppointmentStatus(cancelId, 'cancelled')

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Aula cancelada')
      loadAppointments()
    }
    setLoading(null)
    setCancelId(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusInfo = (status: string) => {
    const config = {
      pending: {
        variant: 'warning' as const,
        label: 'Aguardando',
        icon: AlertCircle,
      },
      confirmed: {
        variant: 'info' as const,
        label: 'Confirmada',
        icon: CheckCircle2,
      },
      completed: {
        variant: 'success' as const,
        label: 'Concluída',
        icon: CheckCircle2,
      },
      cancelled: {
        variant: 'destructive' as const,
        label: 'Cancelada',
        icon: XCircle,
      },
    }[status] || {
      variant: 'secondary' as const,
      label: status,
      icon: Clock,
    }

    return config
  }

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }

  return (
    <DashboardLayout
      userRole={user?.role || "ALUNO"}
      userName={user.full_name || undefined}
      userEmail={user.email}
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Minhas Aulas</h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe e gerencie seus agendamentos
            </p>
          </div>
          <Link href="/aluno/buscar">
            <Button size="lg" className="w-full sm:w-auto">
              <BookOpen className="mr-2 h-4 w-4" />
              Agendar Nova Aula
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardDescription>Total de Aulas</CardDescription>
              <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardDescription>Confirmadas</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600">{stats.confirmed}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardDescription>Concluídas</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600">{stats.completed}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Lista de Agendamentos */}
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma aula agendada</h3>
                <p className="text-muted-foreground mb-6">
                  Comece agendando sua primeira aula com um instrutor verificado
                </p>
                <Link href="/aluno/buscar">
                  <Button size="lg">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Buscar Instrutores
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            appointments.map((appointment) => {
              const statusInfo = getStatusInfo(appointment.status)
              const StatusIcon = statusInfo.icon
              const instructorInitials = appointment.instructor.full_name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {instructorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <h3 className="text-lg font-semibold">
                                {appointment.instructor.full_name}
                              </h3>
                              <Badge variant={statusInfo.variant} className="gap-1">
                                <StatusIcon className="h-3 w-3" />
                                {statusInfo.label}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                <span>{formatDate(appointment.slot.start_time)}</span>
                              </div>
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{appointment.slot.location_address}</span>
                              </div>
                              {appointment.instructor.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="h-4 w-4 flex-shrink-0" />
                                  <span>{formatPhone(appointment.instructor.phone)}</span>
                                </div>
                              )}
                              {appointment.notes && (
                                <div className="flex items-start gap-2 text-sm bg-muted/50 p-3 rounded-md">
                                  <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                  <span>{appointment.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-primary">
                            {formatCurrency(appointment.slot.price)}
                          </div>
                        </div>
                      </div>

                      {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                        <div className="flex justify-end pt-2 border-t">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancel(appointment.id)}
                            disabled={loading === appointment.id}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            {loading === appointment.id ? 'Cancelando...' : 'Cancelar Aula'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={confirmCancel}
        title="Cancelar Aula"
        description="Deseja realmente cancelar esta aula? Esta ação notificará o instrutor."
        confirmText="Confirmar Cancelamento"
        variant="destructive"
      />
    </DashboardLayout>
  )
}

