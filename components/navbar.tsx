"use client"

import {
  CalendarPlus,
  House,
  Languages,
  List,
  Menu,
  Moon,
  Shield,
  Sun,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { useAppLocale } from "@/app/providers"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export function Navbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const t = useTranslations("nav")
  const { resolvedTheme, setTheme } = useTheme()
  const navigationLinks = [
    { href: "/", label: t("home"), icon: House },
    { href: "/reservation/create", label: t("book"), icon: CalendarPlus },
    { href: "/reservation/search", label: t("reservations"), icon: List },
    { href: "/admin/reservations", label: t("admin"), icon: Shield },
  ]

  function linkIsActive(href: string) {
    if (href === "/") return pathname === href
    if (href === "/admin/reservations") return pathname.startsWith("/admin")
    return pathname.startsWith(href)
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 h-16 shrink-0 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-8">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="shrink-0 font-bold"
          >
            <Link href="/">HFI Utility Center</Link>
          </Button>

          <nav className="hidden min-w-0 items-center gap-1 md:flex">
            {navigationLinks.map((item) => {
              const active = linkIsActive(item.href)
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                >
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                  >
                    <item.icon />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
            <span className="mx-1 h-5 border-l" aria-hidden />
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon-sm"
              title={t("theme")}
              onClick={toggleTheme}
            >
              <Sun className="hidden dark:block" />
              <Moon className="dark:hidden" />
            </Button>
          </nav>

          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden"
                title={t("menu")}
              >
                <Menu />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{t("menu")}</DrawerTitle>
                <DrawerDescription>{t("menuDescription")}</DrawerDescription>
              </DrawerHeader>
              <nav className="grid gap-1 px-4">
                {navigationLinks.map((item) => {
                  const active = linkIsActive(item.href)
                  return (
                    <DrawerClose key={item.href} asChild>
                      <Button
                        asChild
                        variant={active ? "secondary" : "ghost"}
                        size="lg"
                        className="w-full justify-start"
                      >
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                        >
                          <item.icon />
                          {item.label}
                        </Link>
                      </Button>
                    </DrawerClose>
                  )
                })}
              </nav>
              <DrawerFooter>
                <div className="grid grid-cols-2 gap-2">
                  <LanguageSwitcher drawer />
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={toggleTheme}
                  >
                    <Sun className="hidden dark:block" />
                    <Moon className="dark:hidden" />
                    {t("theme")}
                  </Button>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  )
}

function LanguageSwitcher({ drawer = false }: { drawer?: boolean }) {
  const { locale, setLocale } = useAppLocale()
  const t = useTranslations("nav")
  const nextLocale = locale === "zh-CN" ? "en-US" : "zh-CN"

  return (
    <Button
      variant={drawer ? "outline" : "ghost"}
      size={drawer ? "default" : "sm"}
      className={drawer ? "w-full" : undefined}
      onClick={() => setLocale(nextLocale)}
      title={t("switchLanguage")}
    >
      <Languages />
      {t("languageShort")}
    </Button>
  )
}
