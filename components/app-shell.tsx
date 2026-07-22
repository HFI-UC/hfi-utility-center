"use client"

import { Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { SwissFooterBar } from "@/components/swiss-frame"
import { useLocale, useTranslations } from "next-intl"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations("nav")
  const locale = useLocale()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-background">
        <div className="border-b border-foreground">
          <div className="mx-auto flex min-h-16 max-w-[96rem] items-center justify-between gap-4 px-4 py-2 sm:px-8">
          <Link href="/" className="shrink-0 leading-none">
            <span className="block text-sm font-black sm:text-base">HFI Utility Center</span>
            <span className="mt-1 hidden text-[0.6875rem] font-bold sm:block">{locale === "zh-CN" ? "教学空间预约系统" : "Campus Room Booking"}</span>
          </Link>
          <nav className="flex min-w-0 items-center text-xs font-bold sm:text-sm">
            <Link href="/" className="hidden px-3 py-2 hover:text-red-600 lg:block">{locale === "zh-CN" ? "首页" : "Home"}</Link>
            <Link href="/reservation/create" className="px-2 py-2 hover:text-red-600 sm:px-3">{t("book")}</Link>
            <Link href="/reservation/search" className="px-2 py-2 hover:text-red-600 sm:px-3">{t("reservations")}</Link>
            <Link href="/admin/login" className="hidden px-3 py-2 hover:text-red-600 md:block">{t("admin")}</Link>
            <Link href="/about" className="hidden px-3 py-2 hover:text-red-600 xl:block">{t("about")}</Link>
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
