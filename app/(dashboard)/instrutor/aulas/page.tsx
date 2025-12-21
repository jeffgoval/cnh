'use client'

import { useState, useEffect } from 'react'
import { getInstructorAppointments, updateAppointmentStatus } from '@/lib/actions/appointments'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useUser } from '@/hooks/use-user'
import { toast } from 'sonner'
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  User,
  GraduationCap,
  AlertCircle,
  CalendarCheck,
} from 'lucide-react'
import { formatPhone } from '@/lib/utils/masks'
import { formatCurrency } from '@/lib/utils/money'

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
  student: {
    full_name: string
    phone: string | null
  }
}

export default function AulasInstructorPage() {
  const { user, loading: userLoading } = useUser()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    const result = await getInstructorAppointments()
    if (result.error) {
      toast.error(result.error)
    } else {
      setAppointments(result.appointments || [])
    }
  }

  const handleUpdateStatus = async (appointmentId: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    setLoading(appointmentId)
    const result = await updateAppointmentStatus(appointmentId, status)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Status atualizado')
      loadAppointments()
    }
    setLoading(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: {
        variant: 'secondary' as const,
        icon: AlertCircle,
        label: 'Pendente',
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100',
      },
      confirmed: {
        variant: 'default' as const,
        icon: CalendarCheck,
        label: 'Confirmada',
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100',
      },
      completed: {
        variant: 'default' as const,
        icon: CheckCircle,
        label: 'Concluída',
        className: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100',
      },
      cancelled: {
        variant: 'destructive' as const,
        icon: XCircle,
        label: 'Cancelada',
        className: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100',
      },
    }[status] || {
      variant: 'secondary' as const,
      icon: AlertCircle,
      label: status,
      className: '',
    }

    const Icon = config.icon

    return (
      <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  if (userLoading) {
    return (
      <DashboardLayout userRole={user?.role || "INSTRUTOR"}>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }

  return (
    <DashboardLayout
      userRole={user?.role || "INSTRUTOR"}
      userName={user?.full_name || undefined}
      userEmail={user?.email}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Minhas Aulas</h1>
          <p className="text-muted-foreground">
            Gerencie seus agendamentos e confirme aulas com alunos
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-primary transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Aulas
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-medium">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Todas as aulas agendadas
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendentes
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-medium text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Aguardando confirmação
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Confirmadas
                </CardTitle>
                <CalendarCheck className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-medium text-blue-600">{stats.confirmed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Prontas para acontecer
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Concluídas
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-medium text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Aulas finalizadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Agendamentos */}
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <GraduationCap className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum agendamento</h3>
                <p className="text-muted-foreground max-w-sm">
                  Você ainda não tem aulas agendadas. Assim que os alunos reservarem horários, eles aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card
                key={appointment.id}
                className="transition-all hover:shadow-md hover:border-primary/50"
              >
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            <User className="h-6 w-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-medium">
                              {appointment.student?.full_name || 'Aluno não identificado'}
                            </h3>
                            {getStatusBadge(appointment.status)}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span>{formatDate(appointment.slot.start_time)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span>{appointment.slot.location_address}</span>
                            </div>

                            {appointment.student?.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span>{formatPhone(appointment.student.phone)}</span>
                              </div>
                            )}

                            {appointment.notes && (
                              <div className="flex items-start gap-2 text-sm">
                                <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <span className="text-muted-foreground italic">{appointment.notes}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 pt-1">
                              <DollarSign className="h-5 w-5 text-primary flex-shrink-0" />
                              <span className="text-lg font-medium text-primary">
                                {formatCurrency(appointment.slot.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {appointment.status === 'pending' && (
                      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end pt-2 border-t">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                          disabled={loading === appointment.id}
                          className="w-full sm:w-auto"
                        >
                          {loading === appointment.id ? (
                            <>
                              <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                              Confirmando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirmar Aula
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateStatus(appointment.id, 'cancelled')}
                          disabled={loading === appointment.id}
                          className="w-full sm:w-auto"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    )}

                    {appointment.status === 'confirmed' && (
                      <div className="flex justify-end pt-2 border-t">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(appointment.id, 'completed')}
                          disabled={loading === appointment.id}
                          className="w-full sm:w-auto"
                        >
                          {loading === appointment.id ? (
                            <>
                              <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                              Atualizando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Marcar como Concluída
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}



