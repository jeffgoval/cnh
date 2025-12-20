'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadDocument } from '@/lib/actions/upload'
import { updateInstructorData } from '@/lib/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useUser } from '@/hooks/use-user'
import { toast } from 'sonner'
import { User, Car, Upload, CheckCircle2, FileText, Shield, Loader2, Save, Phone, Fingerprint, AlertCircle } from 'lucide-react'
import { PhoneInput } from '@/components/ui/phone-input'
import { LoadingState } from '@/components/ui/loading-state'
import { ProfileAvatar } from '@/components/profile/profile-avatar'
import type { Categoria, VerificationStatus } from '@/lib/supabase/types'

export default function InstructorProfilePage() {
  const { user: currentUser, loading: userLoading } = useUser()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [profile, setProfile] = useState({
    full_name: '',
    cpf: '',
    renach_instrutor: '',
    phone: '',
    avatar_url: '',
    bio: '',
    document_verified: false,
  })
  const [assets, setAssets] = useState({
    vehicle_model: '',
    license_plate: '',
    categoria: 'B' as Categoria,
    cnh_photo_url: '',
    credential_photo_url: '',
    verification_status: 'pending' as VerificationStatus,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (currentUser) {
      loadProfile()
    }
  }, [currentUser])

  const loadProfile = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser?.id)
        .maybeSingle()

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          cpf: profileData.cpf || '',
          renach_instrutor: profileData.renach_instrutor || '',
          phone: profileData.phone || '',
          avatar_url: profileData.avatar_url || '',
          bio: profileData.bio || '',
          document_verified: profileData.document_verified || false,
        })
      }

      const { data: assetsData } = await supabase
        .from('instructor_assets')
        .select('*')
        .eq('instructor_id', currentUser?.id)
        .maybeSingle()

      if (assetsData) {
        setAssets({
          vehicle_model: assetsData.vehicle_model || '',
          license_plate: assetsData.license_plate || '',
          categoria: assetsData.categoria || 'B',
          cnh_photo_url: assetsData.cnh_photo_url || '',
          credential_photo_url: assetsData.credential_photo_url || '',
          verification_status: assetsData.verification_status || 'pending',
        })
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cnh' | 'credential' | 'avatar') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(type)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      const result = await uploadDocument(formData)

      if (result.error) {
        toast.error(result.error)
        return
      }

      if (type === 'cnh') {
        setAssets(prev => ({ ...prev, cnh_photo_url: result.url! }))
      } else if (type === 'credential') {
        setAssets(prev => ({ ...prev, credential_photo_url: result.url! }))
      } else if (type === 'avatar') {
        setProfile(prev => ({ ...prev, avatar_url: result.url! }))
      }

      toast.success('Upload realizado com sucesso!')
    } catch (error: any) {
      toast.error('Erro ao fazer upload')
    } finally {
      setUploading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateInstructorData(
        {
          full_name: profile.full_name,
          cpf: profile.cpf,
          renach_instrutor: profile.renach_instrutor,
          phone: profile.phone,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
        },
        {
          vehicle_model: assets.vehicle_model,
          license_plate: assets.license_plate,
          categoria: assets.categoria,
          cnh_photo_url: assets.cnh_photo_url,
          credential_photo_url: assets.credential_photo_url,
        }
      )

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Perfil atualizado com sucesso!')
        loadProfile() // Reload to get potential server-side updates
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar perfil')
    } finally {
      setLoading(false)
    }
  }

  if (userLoading) {
    return <LoadingState message="Carregando informações do instrutor..." />
  }

  if (!currentUser) {
    return <div className="flex h-screen items-center justify-center">Faça login para continuar</div>
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'I'

  return (
    <DashboardLayout
      userRole={currentUser.role}
      userName={profile.full_name || undefined}
      userEmail={currentUser.email}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Mantenha suas informações e documentos do veículo atualizados
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar: Profile Photo & Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <ProfileAvatar
                    url={profile.avatar_url}
                    name={profile.full_name}
                    onUploadSuccess={(url) => setProfile(prev => ({ ...prev, avatar_url: url }))}
                  />
                  <div className="text-center">
                    <h3 className="font-medium text-lg">{profile.full_name || 'Instrutor'}</h3>
                    <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="default" className="bg-blue-600">Instrutor</Badge>
                    {profile.document_verified ? (
                      <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Verificado</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Aguardando Verificação</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Status da Conta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Documentos:</span>
                    {assets.verification_status === 'approved' ? (
                      <span className="font-medium text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Aprovados
                      </span>
                    ) : assets.verification_status === 'rejected' ? (
                      <span className="font-medium text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Rejeitados
                      </span>
                    ) : (
                      <span className="font-medium text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Pendente
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Visibilidade:</span>
                    <span className={`font-medium ${profile.document_verified && assets.verification_status === 'approved' ? 'text-primary' : 'text-muted-foreground'}`}>
                      {profile.document_verified && assets.verification_status === 'approved' ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form Fields */}
          <div className="space-y-6">
            {/* Personal Data */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Dados Pessoais</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cpf"
                        className="pl-9"
                        placeholder="000.000.000-00"
                        value={profile.cpf}
                        onChange={(e) => setProfile(prev => ({ ...prev, cpf: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone / WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <PhoneInput
                        id="phone"
                        className="pl-9"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renach">RENACH do Instrutor</Label>
                  <Input
                    id="renach"
                    placeholder="00000000000"
                    value={profile.renach_instrutor}
                    onChange={(e) => setProfile(prev => ({ ...prev, renach_instrutor: e.target.value }))}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Data */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <CardTitle>Dados do Veículo</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle">Modelo do Veículo</Label>
                    <Input
                      id="vehicle"
                      placeholder="Ex: Fiat Argo 2023"
                      value={assets.vehicle_model}
                      onChange={(e) => setAssets(prev => ({ ...prev, vehicle_model: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plate">Placa</Label>
                    <Input
                      id="plate"
                      placeholder="ABC-1234"
                      value={assets.license_plate}
                      onChange={(e) => setAssets(prev => ({ ...prev, license_plate: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria CNH</Label>
                  <Select
                    value={assets.categoria}
                    onValueChange={(value) => setAssets(prev => ({ ...prev, categoria: value as Categoria }))}
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACC">ACC - Ciclomotores (até 50cc)</SelectItem>
                      <SelectItem value="A">A - Motocicletas e Triciclos</SelectItem>
                      <SelectItem value="B">B - Automóveis e Utilitários</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>Documentos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      CNH Digital
                    </Label>
                    <div className="flex flex-col gap-3">
                      {assets.cnh_photo_url ? (
                        <div className="relative aspect-video rounded-lg border-2 border-dashed bg-muted flex items-center justify-center overflow-hidden group">
                          <img src={assets.cnh_photo_url} alt="CNH" className="object-cover w-full h-full opacity-50 transition-opacity group-hover:opacity-70" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            {assets.verification_status === 'approved' ? (
                              <CheckCircle2 className="h-10 w-10 text-green-600" />
                            ) : (
                              <AlertCircle className="h-10 w-10 text-amber-600" />
                            )}
                          </div>
                          <label
                            htmlFor="cnh-upload"
                            className="absolute inset-0 cursor-pointer"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-center p-4 bg-muted/50 relative">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <div className="text-xs text-muted-foreground">Clique para enviar</div>
                          <label htmlFor="cnh-upload" className="absolute inset-0 cursor-pointer" />
                        </div>
                      )}
                      <input
                        id="cnh-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'cnh')}
                        disabled={!!uploading}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      Credencial (DETRAN)
                    </Label>
                    <div className="flex flex-col gap-3">
                      {assets.credential_photo_url ? (
                        <div className="relative aspect-video rounded-lg border-2 border-dashed bg-muted flex items-center justify-center overflow-hidden group">
                          <img src={assets.credential_photo_url} alt="Credencial" className="object-cover w-full h-full opacity-50 transition-opacity group-hover:opacity-70" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            {assets.verification_status === 'approved' ? (
                              <CheckCircle2 className="h-10 w-10 text-green-600" />
                            ) : (
                              <AlertCircle className="h-10 w-10 text-amber-600" />
                            )}
                          </div>
                          <label
                            htmlFor="credential-upload"
                            className="absolute inset-0 cursor-pointer"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 text-center p-4 bg-muted/50 relative">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <div className="text-xs text-muted-foreground">Clique para enviar</div>
                          <label htmlFor="credential-upload" className="absolute inset-0 cursor-pointer" />
                        </div>
                      )}
                      <input
                        id="credential-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'credential')}
                        disabled={!!uploading}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 sticky bottom-6 z-10">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push('/instrutor/agenda')}
                disabled={loading || !!uploading}
              >
                Cancelar
              </Button>
              <Button type="submit" size="lg" disabled={loading || !!uploading} className="bg-primary text-primary-foreground shadow-lg px-10">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Perfil
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
