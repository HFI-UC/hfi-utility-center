"use client"

import { CalendarPlus, Search } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"

export default function Page() {
  const nav = useTranslations("nav")
  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-12 sm:px-8">
      <section className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-semibold sm:text-6xl">
          HFI Utility Center
        </h1>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/reservation/create"
            className={buttonVariants({ size: "lg" })}
          >
            <CalendarPlus />
            {nav("book")}
          </Link>
          <Link
            href="/reservation/search"
            className={buttonVariants({ size: "lg", variant: "outline" })}
          >
            <Search />
            {nav("reservations")}
          </Link>
        </div>
      </section>
    </main>
  )
}
