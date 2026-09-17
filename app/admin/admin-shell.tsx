"use client"

import {
  Building2,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/astryx"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/astryx"
import { Spinner } from "@/components/astryx"
import { useAdminSession } from "@/lib/api/admin-hooks"
import { logout } from "@/lib/api/auth"
import { cn } from "@/lib/utils"

const shellClassName = "admin-workspace"

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
      href: "/admin",
      label: t("overview"),
      icon: LayoutDashboard,
    },
    {
      href: "/admin/reservation",
      label: t("reservations"),
      icon: CalendarClock,
    },
    { href: "/admin/facility", label: t("facilities"), icon: Building2 },
    { href: "/admin/announcement", label: t("announcements"), icon: Megaphone },
    { href: "/admin/user", label: t("users"), icon: Users },
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
        <aside className="admin-sidebar">
          <Card size="sm" className="admin-sidebar-card">
            <CardHeader>
              <CardTitle>{t("workspace")}</CardTitle>
            </CardHeader>
          </Card>
        </aside>
        <main className="admin-content flex items-start gap-2 text-sm text-muted-foreground">
          <Spinner />
          {t("checking")}
        </main>
      </div>
    )
  }
  if (!session.authenticated) return null

  return (
    <div className={shellClassName}>
      <aside className="admin-sidebar">
        <Card size="sm" className="admin-sidebar-card">
          <CardHeader className="admin-sidebar-heading">
            <CardTitle>{t("workspace")}</CardTitle>
            <span>HFI Utility Center</span>
          </CardHeader>
          <CardContent className="admin-sidebar-body">
            <nav className="admin-nav">
              {navigationItems.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href)
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant={active ? "secondary" : "ghost"}
                    className={`admin-nav-item ${active ? "admin-nav-item--active" : ""}`}
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
              size="icon-sm"
              className="admin-logout-button"
              title={t("logout")}
              aria-label={t("logout")}
              onClick={signOut}
            >
              <LogOut />
            </Button>
          </CardContent>
        </Card>
      </aside>
      <div className="admin-content">{children}</div>
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
    <Card className={cn("admin-section h-full", className)}>
      <CardHeader className="admin-section__header">
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
    <header className="admin-page-header">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </header>
  )
}
