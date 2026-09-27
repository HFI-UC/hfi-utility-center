"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

export function RouteEnter({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div key={pathname} className="t-route-enter min-w-0">
      {children}
    </div>
  )
}
