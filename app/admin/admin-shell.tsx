"use client"

import { Building2, CalendarClock, LogOut, Users } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import { Button, buttonVariants } from "@/components/ui/button"
import { useAdminSession } from "@/lib/api/admin-hooks"
import { logout } from "@/lib/api/auth"
import { cn } from "@/lib/utils"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin")
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === "/admin/login"
  const session = useAdminSession(!isLoginPage)
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
    await logout().catch(() => undefined)
    router.replace("/admin/login")
  }

  if (isLoginPage) return children
  if (session.checking) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 text-sm text-muted-foreground sm:px-6">
        {t("checking")}
      </main>
    )
  }
  if (!session.authenticated) return null

  return (
    <div className="mx-auto grid max-w-[96rem] px-4 py-8 sm:px-8 lg:grid-cols-[15rem_1fr]">
      <aside className="border-b pb-5 lg:min-h-[calc(100svh-8rem)] lg:border-r lg:border-b-0 lg:pr-6">
        <p className="mb-5 text-[0.6875rem] font-semibold text-muted-foreground uppercase">
          {t("workspace")}
        </p>
        <nav className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-1">
          {navigationItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  buttonVariants({
                    variant: active ? "secondary" : "ghost",
                  }),
                  "w-full justify-start"
                )}
              >
                <item.icon />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <Button variant="ghost" className="mt-4" onClick={() => void signOut()}>
          <LogOut />
          {t("logout")}
        </Button>
      </aside>
      <div className="pt-8 lg:pt-0 lg:pl-10">{children}</div>
    </div>
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
    <header className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
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
