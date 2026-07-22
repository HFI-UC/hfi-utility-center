"use client"

import {
  BarChart3,
  Building2,
  CalendarClock,
  LogOut,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAdminSession } from "@/features/admin/use-admin-session"
import { logout } from "@/lib/api/auth"
import { useTranslations } from "next-intl"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin")
  const items = [
    {
      href: "/admin/reservations",
      label: t("reservations"),
      icon: CalendarClock,
    },
    { href: "/admin/facilities", label: t("facilities"), icon: Building2 },
    { href: "/admin/users", label: t("users"), icon: Users },
    { href: "/admin/analytics", label: t("analytics"), icon: BarChart3 },
  ]
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === "/admin/login"
  const session = useAdminSession(!isLoginPage)
  if (isLoginPage) return children
  if (session.checking)
    return (
      <main className="mx-auto max-w-7xl px-4 py-12 text-sm text-muted-foreground sm:px-6">
        {t("checking")}
      </main>
    )
  if (!session.authenticated) return null
  return (
    <div className="mx-auto grid max-w-[96rem] gap-0 px-4 py-8 sm:px-8 lg:grid-cols-[15rem_1fr]">
      <aside className="border-b pb-5 lg:min-h-[calc(100svh-8rem)] lg:border-r lg:border-b-0 lg:pr-6">
        <p className="mb-5 text-[0.6875rem] font-semibold text-muted-foreground uppercase">
          {t("workspace")}
        </p>
        <nav className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
          {items.map((item, index) => (
            <Button
              key={item.href}
              asChild
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="h-11 justify-start"
            >
              <Link href={item.href}>
                <span className="font-mono text-[0.625rem] text-muted-foreground">
                  0{index + 1}
                </span>
                <item.icon />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="mt-4 justify-start"
          onClick={async () => {
            await logout().catch(() => undefined)
            router.replace("/admin/login")
          }}
        >
          <LogOut />
          {t("logout")}
        </Button>
      </aside>
      <div className="pt-8 lg:pt-0 lg:pl-10">{children}</div>
    </div>
  )
}
