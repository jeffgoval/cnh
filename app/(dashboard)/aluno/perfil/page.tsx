'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/lib/actions/profile'
import { uploadDocument } from '@/lib/actions/upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useUser } from '@/hooks/use-user'
import { toast } from 'sonner'
import { User, Phone, Mail, Save, Loader2 } from 'lucide-react'
import { PhoneInput } from '@/components/ui/phone-input'
import { LoadingState } from '@/components/ui/loading-state'
import { ProfileAvatar } from '@/components/profile/profile-avatar'

export default function StudentProfilePage() {
    const { user, loading: userLoading } = useUser()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        avatar_url: '',
    })

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                phone: '', // We'll fetch this from profile
                avatar_url: '', // We'll fetch this from profile
            })
            loadProfileData()
        }
    }, [user])

    const loadProfileData = async () => {
        if (!user) return
        const supabase = createClient()
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                avatar_url: profile.avatar_url || '',
            })
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const uploadData = new FormData()
        uploadData.append('file', file)
        uploadData.append('type', 'avatar')

        try {
            const result = await uploadDocument(uploadData)
            if (result.error) {
                toast.error(result.error)
            } else if (result.url) {
                setFormData(prev => ({ ...prev, avatar_url: result.url! }))
                toast.success('Foto carregada com sucesso')
            }
        } catch (error) {
            toast.error('Erro ao fazer upload da foto')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await updateProfile(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Perfil atualizado com sucesso')
            }
        } catch (error) {
            toast.error('Erro ao salvar perfil')
        } finally {
            setLoading(false)
        }
    }

    if (userLoading) {
        return <LoadingState message="Carregando seu perfil..." />
    }

    if (!user) {
        return <div className="flex h-screen items-center justify-center">Faça login para continuar</div>
    }

    return (
        <DashboardLayout
            userRole={user.role}
            userName={formData.full_name || undefined}
            userEmail={user.email}
        >
            <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                    <h1 className="text-2xl font-medium tracking-tight">Meu Perfil</h1>
                    <p className="text-muted-foreground mt-2">
                        Gerencie suas informações pessoais e foto de perfil
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-[250px_1fr]">
                    {/* Avatar Section */}
                    <div className="space-y-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center gap-4">
                                    <ProfileAvatar
                                        url={formData.avatar_url}
                                        name={formData.full_name}
                                        onUploadSuccess={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
                                    />
                                    <div className="text-center">
                                        <h3 className="font-medium text-lg">{formData.full_name || 'Usuário'}</h3>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                    <Badge variant="secondary" className="px-3">Aluno</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações Pessoais</CardTitle>
                                <CardDescription>
                                    Estas informações estarão visíveis para seus instrutores
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="full_name">Nome Completo</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="full_name"
                                                    className="pl-9"
                                                    value={formData.full_name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                                                    placeholder="Seu nome completo"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    className="pl-9 bg-muted cursor-not-allowed"
                                                    value={user.email}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Telefone / WhatsApp</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <PhoneInput
                                                id="phone"
                                                className="pl-9"
                                                value={formData.phone}
                                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button type="submit" disabled={loading} className="px-8">
                                            {loading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Salvar Alterações
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
