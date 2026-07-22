"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { checkLogin } from "@/lib/api/auth"

export function useAdminSession(enabled = true) {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState({ pathname: "", authenticated: false })

  useEffect(() => {
    if (!enabled) return
    let active = true
    checkLogin().then(() => { if (active) setSession({ pathname, authenticated: true }) }).catch(() => {
      if (!active) return
      setSession({ pathname, authenticated: false })
      router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`)
    })
    return () => { active = false }
  }, [enabled, pathname, router])
  if (!enabled) return { checking: false, authenticated: false }
  return { checking: session.pathname !== pathname, authenticated: session.pathname === pathname && session.authenticated }
}
