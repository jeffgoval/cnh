import { ReactNode } from "react"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: ReactNode
  userRole: "ALUNO" | "INSTRUTOR" | "ADMIN"
  userName?: string
  userEmail?: string
}

export function DashboardLayout({
  children,
  userRole,
  userName,
  userEmail,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-64 lg:block">
        <Sidebar userRole={userRole} />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
