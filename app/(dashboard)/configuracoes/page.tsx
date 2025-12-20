'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useUser } from '@/hooks/use-user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Bell, Shield, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
    const { user, loading: userLoading } = useUser()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    })
    const supabase = createClient()

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passwords.new !== passwords.confirm) {
            toast.error('As senhas não coincidem')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.new
            })

            if (error) throw error

            toast.success('Senha atualizada com sucesso')
            setPasswords({ current: '', new: '', confirm: '' })
        } catch (error: any) {
            toast.error(error.message || 'Erro ao atualizar senha')
        } finally {
            setLoading(false)
        }
    }

    if (userLoading) {
        return <div className="flex h-screen items-center justify-center">Carregando...</div>
    }

    if (!user) {
        return <div className="flex h-screen items-center justify-center">Faça login para continuar</div>
    }

    return (
        <DashboardLayout
            userRole={user.role}
            userName={user.full_name || undefined}
            userEmail={user.email}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-medium tracking-tight">Configurações</h1>
                    <p className="text-muted-foreground mt-2">
                        Gerencie sua conta e preferências de notificação
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Notifications */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-primary" />
                                <div>
                                    <CardTitle>Notificações</CardTitle>
                                    <CardDescription>
                                        Escolha como deseja ser avisado sobre seus agendamentos
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b">
                                <div className="space-y-0.5">
                                    <Label>Notificações por Email</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receba atualizações sobre agendamentos e cancelamentos por email
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between py-2 border-b">
                                <div className="space-y-0.5">
                                    <Label>Notificações via WhatsApp</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receba lembretes de aulas diretamente no seu celular
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div className="space-y-0.5">
                                    <Label>Novidades da Plataforma</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Receba emails sobre novos recursos e melhorias
                                    </p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security / Password */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <div>
                                    <CardTitle>Segurança</CardTitle>
                                    <CardDescription>
                                        Mantenha sua conta segura alterando sua senha regularmente
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">Nova Senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="new-password"
                                                type={showPassword ? "text" : "password"}
                                                className="pl-9"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="confirm-password"
                                                type={showPassword ? "text" : "password"}
                                                className="pl-9"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Atualizando...
                                            </>
                                        ) : (
                                            'Alterar Senha'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Account Management */}
                    <Card className="border-destructive/20 bg-destructive/5">
                        <CardHeader>
                            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                            <CardDescription>
                                Ações irreversíveis relacionadas à sua conta
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="font-medium">Excluir Conta</p>
                                    <p className="text-sm text-muted-foreground">
                                        Ao excluir sua conta, todos os seus dados serão removidos permanentemente
                                    </p>
                                </div>
                                <Button variant="destructive">Excluir Minha Conta</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
