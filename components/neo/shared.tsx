"use client"

import {
  useEffect,
  useState,
  type MouseEventHandler,
  type ReactNode,
} from "react"
import {
  ArrowUpRight,
  CalendarDays,
  Heart,
  Home,
  Languages,
  List,
  Menu,
  Moon,
  Settings2,
  Sparkles,
  Sun,
  X,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { Button as AstryxButton, Card as AstryxCard } from "@astryxdesign/core"

import { useAppLocale } from "@/app/providers"

export type Tone = "success" | "warning" | "info" | "danger" | "neutral"

export function BrandLogo({ dark = false }: { dark?: boolean }) {
  return (
    <span className={`brand-logo ${dark ? "brand-logo--dark" : ""}`}>
      <Image
        src="/assets/hfi-logo.svg"
        alt="HFI"
        width={48}
        height={31}
        className="brand-logo__image"
        priority
      />
    </span>
  )
}

export function ActionButton({
  children,
  icon,
  endContent,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  type = "button",
  className = "",
  ariaLabel,
  href,
  target,
  rel,
}: {
  children: ReactNode
  icon?: ReactNode
  endContent?: ReactNode
  variant?: "primary" | "secondary" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  className?: string
  ariaLabel?: string
  href?: string
  target?: string
  rel?: string
}) {
  return (
    <AstryxButton
      label={ariaLabel ?? (typeof children === "string" ? children : "操作")}
      variant={variant}
      size={size}
      type={type}
      href={href}
      target={target}
      rel={rel}
      icon={icon}
      endContent={endContent}
      isDisabled={disabled}
      onClick={onClick}
      className={`action-button action-button--${variant} action-button--${size} ${className}`.trim()}
    >
      {children}
    </AstryxButton>
  )
}

export function Surface({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <AstryxCard
      className={`surface ${className}`.trim()}
      variant="default"
      elevation="none"
      padding={0}
    >
      {children}
    </AstryxCard>
  )
}

export function StatusBadge({
  tone,
  children,
}: {
  tone: Tone
  children: ReactNode
}) {
  return (
    <span className={`status-badge status-badge--${tone}`}>
      <i aria-hidden="true" />
      {children}
    </span>
  )
}

export function NeoHeader({ home = false }: { home?: boolean }) {
  const pathname = usePathname()
  const t = useTranslations("nav")
  const neo = useTranslations("neo.nav")
  const { locale, setLocale } = useAppLocale()
  const { resolvedTheme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navItems = [
    {
      href: "/",
      label: t("home"),
      description: neo("homeDescription"),
      icon: Home,
    },
    {
      href: "/reservation/create",
      label: t("book"),
      description: neo("bookDescription"),
      icon: CalendarDays,
    },
    {
      href: "/reservation/search",
      label: t("reservations"),
      description: neo("reservationsDescription"),
      icon: List,
    },
    {
      href: "/admin/reservation",
      label: t("admin"),
      description: neo("adminDescription"),
      icon: Settings2,
    },
  ]

  useEffect(() => {
    if (!mobileOpen) return

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false)
    }

    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [mobileOpen])

  function isActive(href: string) {
    if (href === "/admin/reservation") return pathname.startsWith("/admin")
    return href === "/" ? pathname === href : pathname.startsWith(href)
  }

  function toggleLocale() {
    setLocale(locale === "zh-CN" ? "en-US" : "zh-CN")
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <header className={`site-header ${home ? "site-header--floating" : ""}`}>
      <Link className="brand-lockup" href="/" aria-label={neo("returnHome")}>
        <BrandLogo />
        <span className="brand-lockup__title">Utility Center</span>
      </Link>
      <nav className="site-nav" aria-label="主导航">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              className={`site-nav__item ${active ? "site-nav__item--active" : ""}`}
              href={href}
              key={href}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={15} strokeWidth={2.25} />
              <span>{label}</span>
            </Link>
          )
        })}
        <span className="site-nav__divider" aria-hidden="true" />
        <button
          className="icon-button"
          type="button"
          aria-label={t("switchLanguage")}
          title={t("switchLanguage")}
          onClick={toggleLocale}
        >
          <Languages size={17} />
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label={t("theme")}
          title={t("theme")}
          onClick={toggleTheme}
        >
          {resolvedTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <a
          className="hfi-one-button"
          href="https://hfi.one"
          target="_blank"
          rel="noreferrer"
        >
          <Sparkles className="hfi-one-button__spark" size={15} />
          <span>HFI.one</span>
          <ArrowUpRight className="hfi-one-button__arrow" size={14} />
        </a>
      </nav>
      <button
        className={`mobile-menu-button ${mobileOpen ? "mobile-menu-button--open" : ""}`}
        aria-label={mobileOpen ? neo("closeMenu") : neo("openMenu")}
        aria-expanded={mobileOpen}
        aria-controls="mobile-navigation"
        onClick={() => setMobileOpen((open) => !open)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {mobileOpen ? (
        <>
          <button
            className="mobile-nav-backdrop"
            aria-label={neo("closeMenu")}
            onClick={() => setMobileOpen(false)}
          />
          <nav
            id="mobile-navigation"
            className="mobile-nav-panel"
            aria-label="移动端主导航"
          >
            <div className="mobile-nav-panel__header">
              <div>
                <strong>{t("menu")}</strong>
                <span>HFI Utility Center</span>
              </div>
              <div className="mobile-nav-panel__preferences">
                <button
                  type="button"
                  aria-label={t("switchLanguage")}
                  title={t("switchLanguage")}
                  onClick={toggleLocale}
                >
                  <Languages size={16} />
                </button>
                <button
                  type="button"
                  aria-label={t("theme")}
                  title={t("theme")}
                  onClick={toggleTheme}
                >
                  {resolvedTheme === "dark" ? (
                    <Sun size={16} />
                  ) : (
                    <Moon size={16} />
                  )}
                </button>
              </div>
            </div>
            <div className="mobile-nav-panel__links">
              {navItems.map(({ href, label, description, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link
                    href={href}
                    key={href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`mobile-nav-panel__item ${active ? "mobile-nav-panel__item--active" : ""}`}
                  >
                    <span className="mobile-nav-panel__icon">
                      <Icon size={18} />
                    </span>
                    <span className="mobile-nav-panel__copy">
                      <strong>{label}</strong>
                      <small>{description}</small>
                    </span>
                    {active ? (
                      <span className="mobile-nav-panel__current">
                        {neo("current")}
                      </span>
                    ) : (
                      <ArrowUpRight
                        className="mobile-nav-panel__arrow"
                        size={15}
                      />
                    )}
                  </Link>
                )
              })}
              <a
                href="https://hfi.one"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMobileOpen(false)}
                className="mobile-nav-panel__hfi"
              >
                <span className="mobile-nav-panel__hfi-icon">
                  <Sparkles size={18} />
                </span>
                <span className="mobile-nav-panel__copy">
                  <strong>HFI.one</strong>
                  <small>{neo("hfiDescription")}</small>
                </span>
                <ArrowUpRight size={15} />
              </a>
            </div>
          </nav>
        </>
      ) : null}
    </header>
  )
}

export function NeoFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer__poster">
        <span>A DREAM YOU DREAM IS JUST A DREAM,</span>
        <span>A DREAM WE DREAM TOGETHER IS REALITY.</span>
        <small>
          MADE WITH
          <Heart aria-label="love" fill="currentColor" strokeWidth={2.4} />
          BY MAKERs&apos;
        </small>
      </p>
    </footer>
  )
}

export function NeoPage({ children }: { children: ReactNode }) {
  return (
    <div className="app-page app-page--light">
      <NeoHeader />
      {children}
    </div>
  )
}
