"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Moon, Sun, Pause, Play, ArrowUpRight } from "lucide-react"
import { useState } from "react"

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [paused, setPaused] = useState(false)
  return (
    <div className={paused ? "site-shell motion-paused" : "site-shell"}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="HFI Utility Center home">
          <span className="brand-icon" aria-hidden="true">
            h<span>f</span>i<span className="brand-period">.</span>
          </span>
          <span className="brand-description">
            UTILITY
            <br />
            CENTER
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <Link
            className={pathname === "/" ? "active" : ""}
            aria-current={pathname === "/" ? "page" : undefined}
            href="/"
          >
            Overview
          </Link>
          <Link
            className={pathname === "/reservation/create" ? "active" : ""}
            aria-current={
              pathname === "/reservation/create" ? "page" : undefined
            }
            href="/reservation/create"
          >
            Book a room <ArrowUpRight size={13} />
          </Link>
        </nav>
        <button
          className="theme-toggle"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          aria-label="Toggle color theme"
        >
          <Sun className="sun-icon" size={18} />
          <Moon className="moon-icon" size={18} />
        </button>
      </header>
      {children}
      <footer className="site-footer">
        <Link href="/" className="footer-brand">
          HFI UTILITY CENTER <span>© {new Date().getFullYear()}</span>
        </Link>
        <span className="footer-note">A place for your next possibility.</span>
        <button
          className="motion-button"
          onClick={() => setPaused(!paused)}
          aria-pressed={paused}
        >
          {paused ? <Play size={12} /> : <Pause size={12} />} MOTION{" "}
          {paused ? "PAUSED" : "ON"}
        </button>
      </footer>
    </div>
  )
}
