import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heading, Text } from '@/components/ui/typography'
import { GraduationCap, Car, Calendar, Shield, Clock, MapPin, CheckCircle2, Sparkles } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: 'Instrutores Verificados',
      description: 'Todos os instrutores passam por verificação de documentos e credenciais',
    },
    {
      icon: Calendar,
      title: 'Agendamento Simples',
      description: 'Reserve suas aulas em poucos cliques com horários flexíveis',
    },
    {
      icon: Clock,
      title: 'Horários Flexíveis',
      description: 'Escolha o melhor horário que se encaixa na sua rotina',
    },
    {
      icon: MapPin,
      title: 'Localização Conveniente',
      description: 'Encontre instrutores perto de você ou escolha o local da aula',
    },
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-blue-50/50 to-purple-50/30 dark:from-primary/10 dark:via-blue-950/20 dark:to-purple-950/10">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />

        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 gap-1 px-4 py-1.5">
              <Sparkles className="h-3 w-3" />
              Conectando alunos e instrutores
            </Badge>

            <Heading level={1} className="mb-6">
              <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                AgendaCNH
              </span>
            </Heading>

            <Text variant="large" className="mb-4">
              Marketplace de Instrutores de Trânsito
            </Text>

            <Text variant="muted" className="mx-auto mb-10 max-w-2xl">
              A plataforma que conecta você com instrutores de direção verificados e autônomos.
              Agende suas aulas com facilidade e segurança.
            </Text>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/cadastro">
                <Button size="lg" className="gap-2 px-8 text-sm font-medium shadow-lg hover:shadow-xl transition-shadow">
                  <GraduationCap className="h-5 w-5" />
                  Começar Agora
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="gap-2 px-8 text-sm font-medium">
                  Fazer Login
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative shapes */}
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-purple-300/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-2xl font-medium tracking-tight sm:text-3xl mb-4">
              Por que escolher o AgendaCNH?
            </h2>
            <p className="text-lg text-muted-foreground">
              A forma mais moderna e segura de agendar suas aulas de direção
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="border-2 transition-all hover:shadow-lg hover:border-primary/50">
                  <CardHeader>
                    <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-base font-medium">{feature.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* For Students/Instructors Section */}
      <section className="bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="border-2 hover:shadow-xl transition-all hover:border-primary/50 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-950/20 dark:to-background">
              <CardHeader>
                <div className="mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Para Alunos</CardTitle>
                <CardDescription className="text-base">
                  Encontre o instrutor perfeito para você
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Instrutores verificados</p>
                    <p className="text-sm text-muted-foreground">
                      Todos com documentos e credenciais validados
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Agendamento instantâneo</p>
                    <p className="text-sm text-muted-foreground">
                      Reserve sua aula em segundos, sem burocracia
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Horários sob medida</p>
                    <p className="text-sm text-muted-foreground">
                      Escolha quando e onde fazer sua aula
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all hover:border-primary/50 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-950/20 dark:to-background">
              <CardHeader>
                <div className="mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <Car className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Para Instrutores</CardTitle>
                <CardDescription className="text-base">
                  Gerencie seu negócio com autonomia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Agenda digital completa</p>
                    <p className="text-sm text-muted-foreground">
                      Organize seus horários de forma profissional
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Precificação livre</p>
                    <p className="text-sm text-muted-foreground">
                      Você define seus preços e condições
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Alunos qualificados</p>
                    <p className="text-sm text-muted-foreground">
                      Receba apenas alunos realmente interessados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-primary py-24 sm:py-32">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-medium tracking-tight text-white sm:text-3xl mb-6">
              Pronto para começar?
            </h2>
            <p className="text-lg text-blue-100 mb-10">
              Junte-se a centenas de alunos e instrutores que já confiam no AgendaCNH
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/cadastro">
                <Button size="lg" variant="secondary" className="gap-2 px-8 shadow-xl hover:shadow-2xl transition-shadow">
                  <GraduationCap className="h-5 w-5" />
                  Criar Conta Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}



