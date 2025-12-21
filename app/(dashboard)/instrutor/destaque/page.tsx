'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Heading, Text } from '@/components/ui/typography'
import { useUser } from '@/hooks/use-user'
import { Sparkles, Check, Crown, TrendingUp, MapPin } from 'lucide-react'

export default function DestaquePage() {
    const { user, loading } = useUser()
    const [isPremium, setIsPremium] = useState(false) // TODO: Get from database

    // Security: Verify user is an INSTRUCTOR
    if (loading) {
        return (
            <DashboardLayout userRole="INSTRUTOR">
                <div className="flex h-96 items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!user || user.role !== 'INSTRUTOR') {
        return (
            <DashboardLayout userRole={user?.role}>
                <div className="flex h-screen flex-col items-center justify-center gap-4">
                    <h1 className="text-2xl font-medium text-destructive">Acesso Negado</h1>
                    <p className="text-muted-foreground">Apenas instrutores podem acessar esta página</p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout
            userRole={user.role}
            userName={user.full_name || undefined}
            userEmail={user.email}
        >
            <div className="space-y-6 max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4">
                        <Crown className="h-8 w-8 text-white" />
                    </div>
                    <Heading level={1}>Apareça mais para alunos da sua região</Heading>
                    <Text variant="muted" className="max-w-lg mx-auto">
                        Instrutores em destaque recebem mais visualizações e pedidos de aula
                    </Text>
                </div>

                {!isPremium ? (
                    <>
                        {/* Benefits */}
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-3">
                                    {[
                                        {
                                            icon: Sparkles,
                                            title: 'Perfil destacado nos resultados',
                                            description: 'Apareça no topo da lista de busca'
                                        },
                                        {
                                            icon: Crown,
                                            title: 'Selo "Instrutor em destaque"',
                                            description: 'Badge exclusivo no seu perfil'
                                        },
                                        {
                                            icon: MapPin,
                                            title: 'Prioridade na lista da região',
                                            description: 'Seja visto primeiro pelos alunos'
                                        },
                                        {
                                            icon: TrendingUp,
                                            title: 'Mais chances de agendamento',
                                            description: 'Aumente suas reservas em até 3x'
                                        },
                                    ].map((benefit, index) => {
                                        const Icon = benefit.icon
                                        return (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Icon className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Text variant="bodyMd" className="font-medium">
                                                        {benefit.title}
                                                    </Text>
                                                    <Text variant="small">
                                                        {benefit.description}
                                                    </Text>
                                                </div>
                                                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing */}
                        <Card className="border-2 border-primary">
                            <CardContent className="pt-6 text-center space-y-4">
                                <div>
                                    <Text variant="small" className="uppercase tracking-wide font-medium text-primary">
                                        Investimento mensal
                                    </Text>
                                    <div className="mt-2">
                                        <Heading level={1} className="inline">R$ 49</Heading>
                                        <Text variant="muted" className="inline">/mês</Text>
                                    </div>
                                </div>

                                <Button size="lg" className="w-full gap-2">
                                    <Crown className="h-4 w-4" />
                                    Ativar destaque
                                </Button>

                                <Text variant="small" className="text-muted-foreground">
                                    Você pode cancelar quando quiser
                                </Text>
                            </CardContent>
                        </Card>

                        {/* Social Proof */}
                        <Card className="bg-muted/50">
                            <CardContent className="py-6">
                                <div className="text-center space-y-2">
                                    <Text variant="bodyMd" className="font-medium">
                                        "Recebi 5x mais pedidos no primeiro mês"
                                    </Text>
                                    <Text variant="small">
                                        — Carlos Silva, Instrutor em São Paulo
                                    </Text>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    /* Active Plan */
                    <Card className="border-2 border-green-500/20 bg-green-50/50">
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <Check className="h-6 w-6 text-green-600" />
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <Heading level={2}>Plano ativo</Heading>
                                <Text variant="muted">
                                    Seu perfil está em destaque
                                </Text>
                            </div>

                            <div className="bg-background rounded-lg p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <Text variant="small" className="text-muted-foreground">
                                        Próxima renovação
                                    </Text>
                                    <Text variant="bodyMd" className="font-medium">
                                        20 de Janeiro, 2025
                                    </Text>
                                </div>
                                <div className="flex justify-between items-center">
                                    <Text variant="small" className="text-muted-foreground">
                                        Valor mensal
                                    </Text>
                                    <Text variant="bodyMd" className="font-medium">
                                        R$ 49,00
                                    </Text>
                                </div>
                            </div>

                            <Button variant="outline" size="lg" className="w-full">
                                Gerenciar plano
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
