"use client"

import { Info, LogIn, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslations } from "next-intl"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations("nav")
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-foreground bg-background">
        <div className="mx-auto flex h-16 max-w-[96rem] items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3 text-sm font-bold">
            <span className="block size-3 bg-red-600" aria-hidden="true" />
            <span>HFI <span className="hidden sm:inline">UTILITY CENTER</span><span className="sm:hidden">UC</span></span>
          </Link>
          <nav className="flex items-center gap-0">
            <Button asChild variant="ghost" size="sm">
              <Link href="/reservation/search">{t("reservations")}</Link>
            </Button>
            <Button asChild variant="ghost" size="icon-sm" title={t("about")}><Link href="/about"><Info /></Link></Button>
            <Button asChild variant="ghost" size="icon-sm" title={t("admin")}>
              <Link href="/admin/login"><LogIn /></Link>
            </Button>
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
      </header>
      {children}
    </div>
  )
}
