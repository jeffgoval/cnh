'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getInstructorPublicProfile } from '@/lib/actions/profile'
import { createClient } from '@/lib/supabase/client'
import { createAppointment } from '@/lib/actions/appointments'
import { getAvailableSlots } from '@/lib/actions/slots'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Heading, Text } from '@/components/ui/typography'
import { useUser } from '@/hooks/use-user'
import { toast } from 'sonner'
import { ArrowLeft, Check, Phone, Car, Bike, Calendar, Shield, Loader2, MessageCircle, Clock, MapPin, DollarSign, X } from 'lucide-react'
import { LoadingState } from '@/components/ui/loading-state'
import { formatCurrency } from '@/lib/utils/money'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface InstructorProfile {
  id: string
  full_name: string
  bio: string | null
  phone: string | null
  avatar_url: string | null
  document_verified: boolean
  created_at: string
}

interface InstructorAssets {
  vehicle_model: string | null
  license_plate: string | null
  categoria: 'A' | 'B' | 'AB' | 'ACC' | null
  verification_status: 'pending' | 'approved' | 'rejected'
}

interface Slot {
  id: string
  start_time: string
  end_time: string
  price: number
  location_address: string
  is_booked: boolean
}

export default function InstructorProfileViewPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [profile, setProfile] = useState<InstructorProfile | null>(null)
  const [assets, setAssets] = useState<InstructorAssets | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [bookingNotes, setBookingNotes] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookingClass, setBookingClass] = useState(false)
  const supabase = createClient()

  const instructorId = params.id as string

  useEffect(() => {
    if (instructorId) {
      loadInstructorProfile()
    }
  }, [instructorId])

  const loadInstructorProfile = async () => {
    setLoading(true)
    try {
      const result = await getInstructorPublicProfile(instructorId)

      if (result.error) {
        toast.error(result.error)
        router.push('/aluno/buscar')
        return
      }

      if (result.data) {
        setProfile(result.data.profile)
        setAssets(result.data.assets || null)
      }
    } catch (error: any) {
      toast.error('Erro ao carregar perfil do instrutor')
      router.push('/aluno/buscar')
    } finally {
      setLoading(false)
    }
  }

  const handleContactWhatsApp = () => {
    if (!profile?.phone) {
      toast.error('Telefone não disponível')
      return
    }

    // Clean phone number and open WhatsApp
    const cleanPhone = profile.phone.replace(/\D/g, '')
    const message = encodeURIComponent(
      `Olá ${profile.full_name}, encontrei seu perfil na plataforma e gostaria de agendar uma aula!`
    )
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank')
  }

  const handleBookClass = async () => {
    if (!user) {
      toast.error('Você precisa estar logado')
      return
    }

    // Load available slots and open dialog
    setShowBookingDialog(true)
    loadAvailableSlots()
  }

  const loadAvailableSlots = async () => {
    setLoadingSlots(true)
    try {
      const result = await getAvailableSlots(instructorId)
      if (result.error) {
        toast.error(result.error)
      } else if (result.slots) {
        setAvailableSlots(result.slots)
        if (result.slots.length === 0) {
          toast.info('Este instrutor ainda não tem horários disponíveis')
        }
      }
    } catch (error: any) {
      toast.error('Erro ao carregar horários disponíveis')
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleConfirmBooking = async () => {
    if (!selectedSlotId) {
      toast.error('Selecione um horário')
      return
    }

    if (!user) {
      toast.error('Você precisa estar logado')
      return
    }

    setBookingClass(true)
    try {
      const result = await createAppointment({
        slot_id: selectedSlotId,
        instructor_id: instructorId,
        notes: bookingNotes || undefined
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Aula agendada com sucesso!')
        setShowBookingDialog(false)
        setSelectedSlotId(null)
        setBookingNotes('')
        // Navigate to student's appointments page
        router.push('/aluno/minhas-aulas')
      }
    } catch (error: any) {
      toast.error('Erro ao agendar aula')
    } finally {
      setBookingClass(false)
    }
  }

  if (userLoading || loading) {
    return <LoadingState message="Carregando perfil do instrutor..." />
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Text>Faça login para continuar</Text>
      </div>
    )
  }

  if (!profile) {
    return (
      <DashboardLayout userRole={user.role} userName={user.full_name || undefined} userEmail={user.email}>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <Text>Instrutor não encontrado</Text>
          <Button onClick={() => router.push('/aluno/buscar')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para busca
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const initials = profile.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const getCategoryLabel = (cat: string | null) => {
    if (!cat) return 'Não informado'
    const labels: Record<string, string> = {
      'A': 'Motocicletas e Triciclos',
      'B': 'Automóveis e Utilitários',
      'AB': 'Moto e Carro',
      'ACC': 'Ciclomotores (até 50cc)',
    }
    return labels[cat] || cat
  }

  const getCategoryIcon = (cat: string | null) => {
    if (!cat) return <Car className="h-4 w-4" />
    if (cat === 'A' || cat === 'AB' || cat === 'ACC') {
      return <Bike className="h-4 w-4" />
    }
    return <Car className="h-4 w-4" />
  }

  return (
    <DashboardLayout
      userRole={user.role}
      userName={user.full_name || undefined}
      userEmail={user.email}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/aluno/buscar')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para busca
        </Button>

        {/* Profile Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <Avatar className="h-24 w-24 flex-shrink-0">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Heading level={2}>{profile.full_name}</Heading>
                    {profile.document_verified && (
                      <Badge variant="outline" className="gap-1 bg-green-50 text-green-700 border-green-200">
                        <Check className="h-3 w-3" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  <Text variant="muted" className="mt-1">
                    Instrutor credenciado
                  </Text>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div>
                    <Text className="text-sm">{profile.bio}</Text>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button onClick={handleContactWhatsApp} disabled={!profile.phone}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" onClick={handleBookClass} disabled={bookingClass}>
                    {bookingClass ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Agendando...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        Agendar Aula
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile.phone ? (
                <div>
                  <Text variant="small" className="text-muted-foreground">
                    Telefone / WhatsApp
                  </Text>
                  <Text className="font-medium">{profile.phone}</Text>
                </div>
              ) : (
                <Text variant="muted">Telefone não informado</Text>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                Veículo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {assets?.categoria && (
                <div>
                  <Text variant="small" className="text-muted-foreground">
                    Categoria CNH
                  </Text>
                  <div className="flex items-center gap-2 mt-1">
                    {getCategoryIcon(assets.categoria)}
                    <Text className="font-medium">{getCategoryLabel(assets.categoria)}</Text>
                  </div>
                </div>
              )}
              {assets?.vehicle_model && (
                <div>
                  <Text variant="small" className="text-muted-foreground">
                    Modelo
                  </Text>
                  <Text className="font-medium">{assets.vehicle_model}</Text>
                </div>
              )}
              {!assets?.categoria && !assets?.vehicle_model && (
                <Text variant="muted">Informações do veículo não disponíveis</Text>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Verification Status */}
        {assets?.verification_status === 'approved' && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <Text className="font-medium text-green-900">Documentação Aprovada</Text>
                  <Text variant="small" className="text-green-700">
                    Este instrutor teve seus documentos verificados pela plataforma
                  </Text>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Member Since */}
        <Card>
          <CardContent className="py-4">
            <Text variant="muted" className="text-center">
              Membro desde {new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </Text>
          </CardContent>
        </Card>
      </div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Agendar Aula com {profile.full_name}
            </DialogTitle>
            <DialogDescription>
              Selecione um horário disponível para agendar sua aula
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {loadingSlots ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : availableSlots.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <Text className="font-medium">Nenhum horário disponível</Text>
                  <Text variant="muted" className="mt-2">
                    Este instrutor ainda não cadastrou horários disponíveis. Entre em contato via WhatsApp.
                  </Text>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Horários Disponíveis</Label>
                  <div className="grid gap-3">
                    {availableSlots.map((slot) => {
                      const startDate = new Date(slot.start_time)
                      const endDate = new Date(slot.end_time)
                      const isSelected = selectedSlotId === slot.id

                      return (
                        <Card
                          key={slot.id}
                          className={`transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50 cursor-pointer'
                          }`}
                          onClick={() => setSelectedSlotId(slot.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <Text className="font-medium">
                                    {startDate.toLocaleDateString('pt-BR', {
                                      weekday: 'short',
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </Text>
                                </div>
                                <Text variant="small" className="text-muted-foreground">
                                  {startDate.toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}{' '}
                                  -{' '}
                                  {endDate.toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Text>
                                {slot.location_address && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                    <Text variant="small" className="text-muted-foreground">
                                      {slot.location_address}
                                    </Text>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-primary">
                                  <DollarSign className="h-4 w-4" />
                                  <Text className="font-semibold">{formatCurrency(slot.price)}</Text>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Input
                    id="notes"
                    placeholder="Ex: Primeira aula, preciso de atenção especial em baliza..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBookingDialog(false)
                      setSelectedSlotId(null)
                      setBookingNotes('')
                    }}
                    disabled={bookingClass}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleConfirmBooking} disabled={!selectedSlotId || bookingClass}>
                    {bookingClass ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Agendando...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Confirmar Agendamento
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
