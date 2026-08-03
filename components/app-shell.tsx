"use client"

import { CalendarPlus, List, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations("nav")
  const pathname = usePathname()
  const navigationLinks = [
    {
      href: "/",
      label: t("home"),
      className: "hidden lg:block",
    },
    { href: "/reservation/create", label: t("book"), icon: CalendarPlus },
    { href: "/reservation/search", label: t("reservations"), icon: List },
    { href: "/admin/login", label: t("admin"), className: "hidden md:block" },
  ]
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div>
          <div className="mx-auto flex min-h-16 max-w-[96rem] items-center justify-between gap-4 px-4 py-2 sm:px-8">
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 px-2 font-semibold"
              asChild
            >
              <Link href="/">
                <span className="sm:hidden">HFI UC</span>
                <span className="hidden sm:inline">HFI Utility Center</span>
              </Link>
            </Button>
            <nav className="flex min-w-0 items-center gap-1">
              {navigationLinks.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href)
                return (
                  <Button
                    key={link.href}
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      link.className,
                      link.icon && "w-8 px-0 sm:w-auto sm:px-2.5"
                    )}
                    title={link.label}
                    asChild
                  >
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                    >
                      {link.icon ? <link.icon className="sm:hidden" /> : null}
                      <span
                        className={link.icon ? "hidden sm:inline" : undefined}
                      >
                        {link.label}
                      </span>
                    </Link>
                  </Button>
                )
              })}
              <span
                className="mx-1 hidden h-5 border-l sm:block"
                aria-hidden="true"
              />
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
        </div>
      </header>
      {children}
    </div>
  )
}
