'use client'

import { useState, useEffect } from 'react'
import { createSlot, getInstructorSlots, deleteSlot } from '@/lib/actions/slots'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useUser } from '@/hooks/use-user'
import { toast } from 'sonner'
import { Calendar, Clock, MapPin, DollarSign, Plus, Trash2, CalendarCheck } from 'lucide-react'
import { CurrencyInput } from '@/components/ui/currency-input'
import { formatCurrency, parseCurrencyToDecimal } from '@/lib/utils/money'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

interface Slot {
  id: string
  start_time: string
  end_time: string
  price: number
  location_address: string
  is_booked: boolean
}

export default function AgendaPage() {
  const { user, loading: userLoading } = useUser()
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    price: 'R$ 0,00',
    location_address: '',
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadSlots()
    }
  }, [user])

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

  const loadSlots = async () => {
    const result = await getInstructorSlots()
    if (result.error) {
      toast.error(result.error)
    } else if (result.slots) {
      setSlots(result.slots)
    }
  }

  const handleStartTimeChange = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, start_time: value }

      // If start_time is set, automatically set end_time to 1 hour later
      if (value) {
        const startDate = new Date(value)
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000)

        // Use local time components to format YYYY-MM-DDTHH:mm to avoid timezone issues
        const year = endDate.getFullYear()
        const month = String(endDate.getMonth() + 1).padStart(2, '0')
        const day = String(endDate.getDate()).padStart(2, '0')
        const hours = String(endDate.getHours()).padStart(2, '0')
        const minutes = String(endDate.getMinutes()).padStart(2, '0')

        const formattedEnd = `${year}-${month}-${day}T${hours}:${minutes}`
        newData.end_time = formattedEnd
      }

      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createSlot({
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        price: parseCurrencyToDecimal(formData.price),
        location_address: formData.location_address,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Horário criado com sucesso!')
        setShowForm(false)
        setFormData({
          start_time: '',
          end_time: '',
          price: 'R$ 0,00',
          location_address: '',
        })
        loadSlots()
      }
    } catch (error: any) {
      toast.error('Erro ao criar horário')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slotId: string) => {
    setDeleteId(slotId)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    const result = await deleteSlot(deleteId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Horário excluído')
      loadSlots()
    }
    setDeleteId(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  return (
    <DashboardLayout
      userRole={user?.role || "INSTRUTOR"}
      userName={user?.full_name || undefined}
      userEmail={user?.email}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Minha Agenda</h1>
            <p className="text-muted-foreground">
              Gerencie seus horários disponíveis para aulas
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto"
            size="lg"
          >
            {showForm ? (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Novo Horário
              </>
            )}
          </Button>
        </div>

        {showForm && (
          <Card className="border-2 shadow-lg transition-all hover:shadow-xl">
            <CardHeader className="space-y-1 bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl">Criar Novo Horário</CardTitle>
              </div>
              <CardDescription>
                Adicione um novo horário disponível para aulas
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Data/Hora Início
                    </Label>
                    <Input
                      id="start"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="text-base"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end" className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Data/Hora Fim
                    </Label>
                    <Input
                      id="end"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                      className="text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Preço da Aula
                  </Label>
                  <CurrencyInput
                    id="price"
                    value={formData.price}
                    onChange={(val) => setFormData(prev => ({ ...prev, price: val }))}
                    className="text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Local da Aula
                  </Label>
                  <Input
                    id="location"
                    placeholder="Rua, Bairro, Cidade"
                    value={formData.location_address}
                    onChange={(e) => setFormData(prev => ({ ...prev, location_address: e.target.value }))}
                    className="text-base"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Horário
                    </>
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>
        )}

        <div className="grid gap-4">
          {slots.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhum horário cadastrado</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Clique em &quot;Novo Horário&quot; para adicionar sua disponibilidade e começar a receber agendamentos.
                </p>
                <Button onClick={() => setShowForm(true)} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Horário
                </Button>
              </CardContent>
            </Card>
          ) : (
            slots.map((slot) => (
              <Card
                key={slot.id}
                className="transition-all hover:shadow-md hover:border-primary/50"
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={slot.is_booked ? "default" : "secondary"}
                          className="gap-1"
                        >
                          <CalendarCheck className="h-3 w-3" />
                          {slot.is_booked ? 'Reservado' : 'Disponível'}
                        </Badge>
                      </div>

                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">
                            {formatDate(slot.start_time)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            até {formatDate(slot.end_time)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm">{slot.location_address}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-lg font-medium text-primary">
                          {formatCurrency(slot.price)}
                        </span>
                      </div>
                    </div>

                    {!slot.is_booked && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(slot.id)}
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Excluir Horário"
        description="Deseja realmente excluir este horário disponível? Esta ação não poderá ser desfeita."
        confirmText="Excluir"
        variant="destructive"
      />
    </DashboardLayout>
  )
}

