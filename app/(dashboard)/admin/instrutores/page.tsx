'use client'

import { useState, useEffect } from 'react'
import { getPendingInstructors, approveInstructorAsset } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useUser } from '@/hooks/use-user'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, User, Car, FileText, Phone, Mail, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { formatPhone } from '@/lib/utils/masks'
import { LoadingState } from '@/components/ui/loading-state'

interface PendingInstructor {
    id: string
    full_name: string
    email: string | null
    phone: string | null
    cpf: string | null
    renach_instrutor: string | null
    assets: {
        vehicle_model: string | null
        license_plate: string | null
        categoria: string | null
        cnh_photo_url: string | null
        credential_photo_url: string | null
        verification_status: string
    }[]
}

export default function AdminInstructorsPage() {
    const { user: currentUser, loading: userLoading } = useUser()
    const [instructors, setInstructors] = useState<PendingInstructor[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        if (currentUser?.role === 'ADMIN') {
            loadInstructors()
        }
    }, [currentUser])

    const loadInstructors = async () => {
        setLoading(true)
        const result = await getPendingInstructors()
        if (result.error) {
            toast.error(result.error)
        } else {
            setInstructors(result.instructors as any || [])
        }
        setLoading(false)
    }

    const handleAction = async (instructorId: string, status: 'approved' | 'rejected') => {
        setActionLoading(`${instructorId}-${status}`)
        const result = await approveInstructorAsset(instructorId, status)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(status === 'approved' ? 'Instrutor aprovado!' : 'Instrutor rejeitado')
            loadInstructors()
        }
        setActionLoading(null)
    }

    if (userLoading || (currentUser?.role === 'ADMIN' && loading)) {
        return <LoadingState message="Carregando instrutores pendentes..." />
    }

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-destructive">Acesso Negado</h1>
                <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
                <Button onClick={() => window.location.href = '/'}>Voltar ao Início</Button>
            </div>
        )
    }

    return (
        <DashboardLayout
            userRole={currentUser.role}
            userName={currentUser.full_name || 'Admin'}
            userEmail={currentUser.email}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Instrutores</h1>
                    <p className="text-muted-foreground">
                        Revise e aprove os documentos dos instrutores pendentes no sistema
                    </p>
                </div>

                {instructors.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="rounded-full bg-muted p-6 mb-4">
                                <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Nenhum instrutor pendente</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Todos os instrutores cadastrados já foram revisados ou ainda não enviaram documentos.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {instructors.map((instructor) => {
                            const asset = instructor.assets?.[0]
                            return (
                                <Card key={instructor.id} className="overflow-hidden">
                                    <header className="bg-muted/30 border-b px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold">{instructor.full_name}</h3>
                                                <p className="text-sm text-muted-foreground">{instructor.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                disabled={!!actionLoading}
                                                onClick={() => handleAction(instructor.id, 'rejected')}
                                            >
                                                {actionLoading === `${instructor.id}-rejected` ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                )}
                                                Rejeitar
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                disabled={!!actionLoading}
                                                onClick={() => handleAction(instructor.id, 'approved')}
                                            >
                                                {actionLoading === `${instructor.id}-approved` ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                )}
                                                Aprovar Instrutor
                                            </Button>
                                        </div>
                                    </header>
                                    <CardContent className="p-6">
                                        <div className="grid gap-8 lg:grid-cols-3">
                                            {/* Personal Info */}
                                            <section className="space-y-4">
                                                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <User className="h-4 w-4" /> Informações
                                                </h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">CPF:</span>
                                                        <span className="font-medium">{instructor.cpf || 'Não informado'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">RENACH:</span>
                                                        <span className="font-medium text-blue-600">{instructor.renach_instrutor || 'Não informado'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Telefone:</span>
                                                        <span className="font-medium">{instructor.phone ? formatPhone(instructor.phone) : 'Não informado'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Categoria:</span>
                                                        <Badge variant="outline">{asset?.categoria || 'N/A'}</Badge>
                                                    </div>
                                                </div>
                                            </section>

                                            {/* Vehicle Info */}
                                            <section className="space-y-4">
                                                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <Car className="h-4 w-4" /> Veículo
                                                </h4>
                                                <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm border">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Modelo:</span>
                                                        <span className="font-medium">{asset?.vehicle_model || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Placa:</span>
                                                        <span className="font-medium uppercase">{asset?.license_plate || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </section>

                                            {/* Documents */}
                                            <section className="space-y-4">
                                                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <FileText className="h-4 w-4" /> Documentos
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {asset?.cnh_photo_url ? (
                                                        <a
                                                            href={asset.cnh_photo_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="group relative aspect-video rounded-md border overflow-hidden hover:ring-2 hover:ring-primary transition-all shadow-sm"
                                                        >
                                                            <img src={asset.cnh_photo_url} alt="CNH" className="object-cover w-full h-full" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium">
                                                                <ExternalLink className="h-4 w-4 mr-1" /> Ver CNH
                                                            </div>
                                                        </a>
                                                    ) : (
                                                        <div className="aspect-video rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground bg-muted/20">Sem CNH</div>
                                                    )}

                                                    {asset?.credential_photo_url ? (
                                                        <a
                                                            href={asset.credential_photo_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="group relative aspect-video rounded-md border overflow-hidden hover:ring-2 hover:ring-primary transition-all shadow-sm"
                                                        >
                                                            <img src={asset.credential_photo_url} alt="Credencial" className="object-cover w-full h-full" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium">
                                                                <ExternalLink className="h-4 w-4 mr-1" /> Ver Credencial
                                                            </div>
                                                        </a>
                                                    ) : (
                                                        <div className="aspect-video rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground bg-muted/20">Sem Credencial</div>
                                                    )}
                                                </div>
                                            </section>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
