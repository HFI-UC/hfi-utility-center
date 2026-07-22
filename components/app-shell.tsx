"use client"

import { Moon, Sun } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslations } from "next-intl"

export function AppShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations("nav")
  const pathname = usePathname()
  const links = [
    {
      href: "/",
      label: t("home"),
      className: "hidden lg:block",
    },
    { href: "/reservation/create", label: t("book") },
    { href: "/reservation/search", label: t("reservations") },
    { href: "/admin/login", label: t("admin"), className: "hidden md:block" },
  ]
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div>
          <div className="mx-auto flex min-h-16 max-w-[96rem] items-center justify-between gap-4 px-4 py-2 sm:px-8">
            <Button asChild variant="ghost" size="sm">
              <Link href="/" className="font-semibold">
                HFI Utility Center
              </Link>
            </Button>
            <nav className="flex min-w-0 items-center gap-1">
              {links.map((link) => {
                const active =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href)
                return (
                  <Button
                    key={link.href}
                    asChild
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    className={link.className}
                  >
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                    >
                      {link.label}
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
