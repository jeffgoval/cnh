"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { UserRole } from "@/lib/supabase/types"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient()

      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single()

        if (profile) {
          setUser({
            id: profile.id,
            email: authUser.email || "",
            full_name: profile.full_name,
            role: profile.role,
          })
        }
      }

      setLoading(false)
    }

    loadUser()
  }, [])

  return { user, loading }
}
