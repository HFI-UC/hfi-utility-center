"use client"

import { Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { SwissFooterBar } from "@/components/swiss-frame"
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
      <header className="sticky top-0 z-30 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
        <div className="border-b border-foreground/15">
          <div className="mx-auto flex min-h-16 max-w-[96rem] items-center justify-between gap-4 px-4 py-2 sm:px-8">
          <Link href="/" className="shrink-0 leading-none">
            <span className="block text-sm font-bold sm:text-base">HFI Utility Center</span>
          </Link>
          <nav className="flex min-w-0 items-center text-xs font-semibold sm:text-sm">
            {links.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href.replace("/login", ""))
              return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={cn("relative px-2 py-3 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:px-3", link.className, active && "text-brand after:absolute after:inset-x-2 after:bottom-1 after:h-0.5 after:bg-brand")}>{link.label}</Link>
            })}
            <span className="mx-1 hidden h-5 border-l border-foreground sm:block" aria-hidden="true" />
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
      <SwissFooterBar />
    </div>
  )
}
