"use client"

import { CalendarPlus, Languages, List, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Navbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const t = useTranslations("nav")
  const { resolvedTheme, setTheme } = useTheme()
  const navigationLinks = [
    { href: "/", label: t("home"), className: "hidden lg:inline-flex" },
    { href: "/reservation/create", label: t("book"), icon: CalendarPlus },
    { href: "/reservation/search", label: t("reservations"), icon: List },
    {
      href: "/admin/login",
      label: t("admin"),
      className: "hidden md:inline-flex",
    },
  ]

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex min-h-16 max-w-[96rem] items-center justify-between gap-4 px-4 py-2 sm:px-8">
          <Link
            href="/"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "shrink-0 px-2 font-semibold",
            })}
          >
            <span className="sm:hidden">HFI UC</span>
            <span className="hidden sm:inline">HFI Utility Center</span>
          </Link>
          <nav className="flex min-w-0 items-center gap-1">
            {navigationLinks.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={item.label}
                  className={cn(
                    buttonVariants({
                      variant: active ? "secondary" : "ghost",
                      size: "sm",
                    }),
                    item.className,
                    item.icon && "w-8 px-0 sm:w-auto sm:px-2.5"
                  )}
                >
                  {item.icon ? <item.icon className="sm:hidden" /> : null}
                  <span className={item.icon ? "hidden sm:inline" : undefined}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
            <span className="mx-1 hidden h-5 border-l sm:block" aria-hidden />
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon-sm"
              title={t("theme")}
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              <Sun className="hidden dark:block" />
              <Moon className="dark:hidden" />
            </Button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  )
}

function LanguageSwitcher() {
  const locale = useLocale()
  const t = useTranslations("nav")
  const nextLocale = locale === "zh-CN" ? "en-US" : "zh-CN"

  function switchLanguage() {
    window.localStorage.setItem("hfiuc-locale", nextLocale)
    window.dispatchEvent(
      new CustomEvent("hfiuc-locale-change", { detail: nextLocale })
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLanguage}
      title={t("switchLanguage")}
    >
      <Languages />
      <span className="hidden sm:inline">{t("languageShort")}</span>
    </Button>
  )
}
