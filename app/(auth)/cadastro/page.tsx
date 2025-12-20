'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import type { UserRole } from '@/lib/supabase/types'

export default function CadastroPage() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!role) {
      toast.error('Selecione seu tipo de cadastro')
      return
    }

    setLoading(true)

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Erro ao criar usuário')

      // 2. Criar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          role,
          full_name: fullName,
          email,
        })

      if (profileError) throw profileError

      toast.success('Cadastro realizado com sucesso!')

      // Redirecionar baseado no role
      if (role === 'ADMIN') {
        router.push('/admin/instrutores')
      } else if (role === 'INSTRUTOR') {
        router.push('/instrutor/perfil')
      } else {
        router.push('/aluno/buscar')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Cadastro</CardTitle>
            <CardDescription>
              Escolha como você deseja se cadastrar
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Button
              variant="outline"
              className="h-32 flex-col space-y-2"
              onClick={() => setRole('ALUNO')}
            >
              <div className="text-4xl">🎓</div>
              <div className="font-semibold">Sou Aluno</div>
              <div className="text-xs text-muted-foreground">
                Quero encontrar instrutores
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-32 flex-col space-y-2"
              onClick={() => setRole('INSTRUTOR')}
            >
              <div className="text-4xl">🚗</div>
              <div className="font-semibold">Sou Instrutor</div>
              <div className="text-xs text-muted-foreground">
                Quero oferecer aulas
              </div>
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Faça login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Cadastro - {role === 'ALUNO' ? 'Aluno' : 'Instrutor'}
          </CardTitle>
          <CardDescription>
            Preencha seus dados para criar sua conta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSignUp}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                placeholder="João da Silva"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 6 caracteres
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setRole(null)}
              disabled={loading}
            >
              Voltar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

