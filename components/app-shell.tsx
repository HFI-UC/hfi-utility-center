"use client"

import { Moon, Sun } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations("nav")
  const locale = useLocale()
  const pathname = usePathname()
  const links = [
    { href: "/", label: locale === "zh-CN" ? "首页" : "Home", className: "hidden lg:block" },
    { href: "/reservation/create", label: t("book") },
    { href: "/reservation/search", label: t("reservations") },
    { href: "/admin/login", label: t("admin"), className: "hidden md:block" },
    { href: "/about", label: t("about"), className: "hidden xl:block" },
  ]
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div>
          <div className="mx-auto flex min-h-16 max-w-[96rem] items-center justify-between gap-4 px-4 py-2 sm:px-8">
          <Link href="/" className="shrink-0 leading-none">
            <span className="block text-sm font-semibold sm:text-base">HFI Utility Center</span>
          </Link>
          <nav className="flex min-w-0 items-center text-xs font-medium sm:text-sm">
            {links.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
              return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={cn("rounded-md px-2 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:px-3", active && "bg-accent text-foreground", link.className)}>{link.label}</Link>
            })}
            <span className="mx-1 hidden h-5 border-l sm:block" aria-hidden="true" />
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon-sm"
              title={t("theme")}
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? <Sun /> : <Moon />}
            </Button>
          </nav>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
