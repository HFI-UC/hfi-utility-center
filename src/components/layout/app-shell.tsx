import type { ReactNode } from "react"

import { AppFooter } from "@/components/layout/app-footer"
import { AppHeader } from "@/components/layout/app-header"
import { RouteEnter } from "@/components/layout/route-enter"
import { cn } from "@/lib/utils"

export type ShellWidth = "wide" | "narrow" | "full"

function frameClass(width: ShellWidth) {
  if (width === "full") return "w-full min-w-0"
  return cn(
    "mx-auto w-full min-w-0 flex-1 px-[max(1rem,env(safe-area-inset-left))] py-5 pr-[max(1rem,env(safe-area-inset-right))] sm:px-6 sm:py-6 lg:px-8 lg:py-6",
    width === "narrow" ? "max-w-3xl" : "max-w-7xl",
  )
}

export function AppShell({
  children,
  className,
  width = "wide",
  headerActions,
}: {
  children: ReactNode
  className?: string
  width?: ShellWidth
  headerActions?: ReactNode
}) {
  return (
    <div className={cn("flex min-h-svh flex-col", className)}>
      <AppHeader actions={headerActions} />
      <main id="main-content" className={frameClass(width)}>
        <RouteEnter>{children}</RouteEnter>
      </main>
      <AppFooter />
    </div>
  )
}

export function AppFrame({
  children,
  className,
  width = "wide",
}: {
  children: ReactNode
  className?: string
  width?: ShellWidth
}) {
  return (
    <main id="main-content" className={cn(frameClass(width), className)}>
      <RouteEnter>{children}</RouteEnter>
    </main>
  )
}
