"use client"

import { ArrowUpRight } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppFooter() {
  const t = useTranslations("layout")
  const nav = useTranslations("nav")
  const pathname = usePathname()
  const adminActive = pathname === "/admin" || pathname.startsWith("/admin/")
  return (
    <footer className="mt-8 border-t">
      <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col items-start gap-2 px-[max(1rem,env(safe-area-inset-left))] pt-6 pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          <span className="font-semibold tracking-tight text-foreground">hfi {t("brand")}</span>
          <Link
            href="/admin/reservation"
            prefetch={false}
            aria-current={adminActive ? "page" : undefined}
            className="rounded-md transition-colors hover:text-foreground aria-[current=page]:text-foreground"
          >
            {nav("admin")}
          </Link>
        </div>
        <a
          href="https://hfi.one"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-md transition-colors hover:text-foreground"
        >
          {t("moreCampusTools")}
          <ArrowUpRight className="size-3.5 shrink-0" aria-hidden />
        </a>
      </div>
    </footer>
  )
}
