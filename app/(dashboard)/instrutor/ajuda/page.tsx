'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Heading, Text } from '@/components/ui/typography'
import { useUser } from '@/hooks/use-user'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
    question: string
    answer: string
}

const faqs: FAQItem[] = [
    {
        question: 'Posso dar aulas sendo instrutor autônomo?',
        answer: 'Sim. Aulas práticas podem ser realizadas por instrutores autônomos devidamente habilitados, conforme as normas do Detran.'
    },
    {
        question: 'O app substitui a autoescola?',
        answer: 'Não. O app conecta alunos e instrutores para aulas práticas. O processo oficial continua sendo feito pelo Detran.'
    },
    {
        question: 'As aulas são válidas?',
        answer: 'As aulas são registradas no app e servem como histórico de prática. A validação oficial é feita pelo Detran.'
    },
    {
        question: 'O app garante aprovação?',
        answer: 'Não. O app ajuda na prática, mas a aprovação depende do desempenho do aluno na prova.'
    },
    {
        question: 'Posso usar meu próprio veículo?',
        answer: 'Sim, desde que atenda às exigências legais para aulas práticas.'
    }
]

function FAQAccordion({ faq, isOpen, onToggle }: {
    faq: FAQItem
    isOpen: boolean
    onToggle: () => void
}) {
    return (
        <Card className={cn(
            "transition-all cursor-pointer hover:border-primary/30",
            isOpen && "border-primary/50"
        )}>
            <CardContent
                className="py-4"
                onClick={onToggle}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <Text variant="bodyMd" className="font-medium">
                            {faq.question}
                        </Text>
                        {isOpen && (
                            <Text variant="muted" className="mt-3 leading-relaxed">
                                {faq.answer}
                            </Text>
                        )}
                    </div>
                    <ChevronDown
                        className={cn(
                            "h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform",
                            isOpen && "rotate-180"
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

export default function AjudaPage() {
    const { user, loading } = useUser()
    const [openIndex, setOpenIndex] = useState<number | null>(null)

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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <HelpCircle className="h-8 w-8 text-primary" />
                    </div>
                    <Heading level={1}>Perguntas frequentes</Heading>
                    <Text variant="muted" className="max-w-lg mx-auto">
                        Tire suas dúvidas sobre como funciona a plataforma
                    </Text>
                </div>

                {/* FAQ List */}
                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <FAQAccordion
                            key={index}
                            faq={faq}
                            isOpen={openIndex === index}
                            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </div>

                {/* Contact Support */}
                <Card className="bg-muted/50">
                    <CardContent className="py-6 text-center space-y-2">
                        <Heading level={4}>Ainda tem dúvidas?</Heading>
                        <Text variant="muted">
                            Entre em contato pelo email: suporte@agendacnh.com
                        </Text>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
