'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/use-user'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useUser()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'ADMIN') {
          router.push('/admin/instrutores')
        } else if (user.role === 'INSTRUTOR') {
          router.push('/instrutor/aulas')
        } else if (user.role === 'ALUNO') {
          router.push('/aluno/buscar')
        } else {
          router.push('/login')
        }
      } else {
        // Not authenticated, redirect to login
        router.push('/login')
      }
    }
  }, [user, loading, router])

  // Show loading state while redirecting
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        <p className="mt-4 text-muted-foreground">Carregando...</p>
      </div>
    </div>
  )
}
