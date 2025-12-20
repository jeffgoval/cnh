"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Calendar, GraduationCap, Search, User, ClipboardList, Home, Settings, Shield } from "lucide-react"

interface SidebarProps {
  userRole: "ALUNO" | "INSTRUTOR" | "ADMIN"
}

const sidebarLinks = {
  ALUNO: [
    {
      title: "Buscar Instrutores",
      href: "/aluno/buscar",
      icon: Search,
    },
    {
      title: "Minhas Aulas",
      href: "/aluno/minhas-aulas",
      icon: ClipboardList,
    },
    {
      title: "Perfil",
      href: "/aluno/perfil",
      icon: User,
    },
    {
      title: "Configurações",
      href: "/configuracoes",
      icon: Settings,
    },
  ],
  INSTRUTOR: [
    {
      title: "Perfil",
      href: "/instrutor/perfil",
      icon: User,
    },
    {
      title: "Agenda",
      href: "/instrutor/agenda",
      icon: Calendar,
    },
    {
      title: "Aulas Agendadas",
      href: "/instrutor/aulas",
      icon: GraduationCap,
    },
    {
      title: "Configurações",
      href: "/configuracoes",
      icon: Settings,
    },
  ],
  ADMIN: [
    {
      title: "Gestão Instrutores",
      href: "/admin/instrutores",
      icon: Shield,
    },
    {
      title: "Configurações",
      href: "/configuracoes",
      icon: Settings,
    },
  ],
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const links = sidebarLinks[userRole]

  return (
    <div className="flex h-full flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            AgendaCNH
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.title}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <div className="rounded-lg bg-primary/10 p-3 text-sm">
          <p className="font-medium text-primary">
            {userRole === "ALUNO" ? "Modo Aluno" : userRole === "INSTRUTOR" ? "Modo Instrutor" : "Modo Administrador"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {userRole === "ALUNO"
              ? "Encontre e agende suas aulas"
              : userRole === "INSTRUTOR"
                ? "Gerencie seus horários e alunos"
                : "Gestão do sistema e aprovações"}
          </p>
        </div>
      </div>
    </div>
  )
}
