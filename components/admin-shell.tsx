"use client"

import { BarChart3, Building2, CalendarClock, LogOut, Users } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAdminSession } from "@/features/admin/use-admin-session"
import { logout } from "@/lib/api/auth"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin")
  const items = [
    { href: "/admin/reservations", label: t("reservations"), icon: CalendarClock },
    { href: "/admin/facilities", label: t("facilities"), icon: Building2 },
    { href: "/admin/users", label: t("users"), icon: Users },
    { href: "/admin/analytics", label: t("analytics"), icon: BarChart3 },
  ]
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === "/admin/login"
  const session = useAdminSession(!isLoginPage)
  if (isLoginPage) return children
  if (session.checking) return <main className="mx-auto max-w-7xl px-4 py-12 text-sm text-muted-foreground sm:px-6">{t("checking")}</main>
  if (!session.authenticated) return null
  return (
    <div className="mx-auto grid max-w-7xl gap-0 px-4 py-6 sm:px-6 lg:grid-cols-[13rem_1fr]">
      <aside className="border-b pb-4 lg:min-h-[calc(100svh-7rem)] lg:border-r lg:border-b-0 lg:pr-5">
        <p className="mb-3 text-xs font-semibold text-red-600">{t("workspace")}</p>
        <nav className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
          {items.map((item) => <Link key={item.href} href={item.href} className={cn("flex h-10 items-center gap-2 px-2 text-sm hover:bg-muted", pathname === item.href && "bg-foreground text-background hover:bg-foreground")}><item.icon className="size-4" />{item.label}</Link>)}
        </nav>
        <Button variant="ghost" className="mt-4 justify-start" onClick={async () => { await logout().catch(() => undefined); router.replace("/admin/login") }}><LogOut />{t("logout")}</Button>
      </aside>
      <div className="pt-7 lg:pl-8 lg:pt-0">{children}</div>
    </div>
  )
}
