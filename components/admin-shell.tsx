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
    <div className="mx-auto grid max-w-[96rem] gap-0 px-4 py-8 sm:px-8 lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-foreground pb-5 lg:min-h-[calc(100svh-8rem)] lg:border-r lg:border-b-0 lg:pr-6">
        <p className="swiss-label mb-5">{t("workspace")}</p>
        <nav className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
          {items.map((item, index) => <Link key={item.href} href={item.href} className={cn("flex h-12 items-center gap-3 border-t border-foreground/25 px-2 text-sm font-bold hover:bg-red-600 hover:text-white", pathname === item.href && "bg-foreground text-background hover:bg-red-600")}><span className="font-mono text-[0.625rem] text-red-600">0{index + 1}</span><item.icon className="size-4" />{item.label}</Link>)}
        </nav>
        <Button variant="ghost" className="mt-4 justify-start" onClick={async () => { await logout().catch(() => undefined); router.replace("/admin/login") }}><LogOut />{t("logout")}</Button>
      </aside>
      <div className="pt-8 lg:pl-10 lg:pt-0">{children}</div>
    </div>
  )
}
