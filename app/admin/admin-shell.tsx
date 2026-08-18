"use client"

import { Building2, CalendarClock, LogOut, Users } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useAdminSession } from "@/lib/api/admin-hooks"
import { logout } from "@/lib/api/auth"
import { cn } from "@/lib/utils"

const shellClassName =
  "mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl flex-1 gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname === "/admin/login") return children

  return (
    <AuthenticatedAdminShell pathname={pathname}>
      {children}
    </AuthenticatedAdminShell>
  )
}

function AuthenticatedAdminShell({
  pathname,
  children,
}: {
  pathname: string
  children: React.ReactNode
}) {
  const t = useTranslations("admin")
  const router = useRouter()
  const session = useAdminSession(pathname)
  const navigationItems = [
    {
      href: "/admin/reservations",
      label: t("reservations"),
      icon: CalendarClock,
    },
    { href: "/admin/facilities", label: t("facilities"), icon: Building2 },
    { href: "/admin/users", label: t("users"), icon: Users },
  ]

  async function signOut() {
    try {
      await logout()
    } finally {
      router.replace("/admin/login")
    }
  }

  if (session.checking) {
    return (
      <div className={shellClassName}>
        <aside>
          <Card size="sm" className="min-h-52 lg:min-h-56">
            <CardHeader>
              <CardTitle>{t("workspace")}</CardTitle>
            </CardHeader>
          </Card>
        </aside>
        <main className="flex items-start gap-2 text-sm text-muted-foreground">
          <Spinner />
          {t("checking")}
        </main>
      </div>
    )
  }
  if (!session.authenticated) return null

  return (
    <div className={shellClassName}>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card size="sm" className="min-h-52 lg:min-h-56">
          <CardHeader>
            <CardTitle>{t("workspace")}</CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
              {navigationItems.map((item) => {
                const active = pathname === item.href
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={active ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                    >
                      <item.icon />
                      {item.label}
                    </Link>
                  </Button>
                )
              })}
            </nav>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={signOut}
            >
              <LogOut />
              {t("logout")}
            </Button>
          </CardContent>
        </Card>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function AdminSection({
  title,
  children,
  className,
  action,
}: {
  title: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  )
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: React.ReactNode
}) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </header>
  )
}
