"use client"

import { usePathname } from "next/navigation"

import { NeoHeader } from "@/components/neo/shared"

export function Navbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (!pathname.startsWith("/admin") || pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="admin-app-shell">
      <NeoHeader />
      <div className="admin-app-shell__content">{children}</div>
    </div>
  )
}
