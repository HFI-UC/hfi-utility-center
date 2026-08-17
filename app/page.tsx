"use client"

import { CalendarPlus, Search } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export default function Page() {
  const nav = useTranslations("nav")

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
      <section className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-medium tracking-tight sm:text-6xl">
          HFI Utility Center
        </h1>
        <div className="mt-5 sm:mt-10 flex items-center justify-center gap-10 text-lg font-medium tracking-tight">
          <Link
            href="/reservation/create"
            className="inline-flex items-center gap-2 border-b-2 border-transparent pb-1 leading-none hover:border-current"
          >
            <CalendarPlus className="size-4" />
            {nav("book")}
          </Link>
          <Link
            href="/reservation/search"
            className="inline-flex items-center gap-2 border-b-2 border-transparent pb-1 leading-none hover:border-current"
          >
            <Search className="size-4" />
            {nav("reservations")}
          </Link>
        </div>
      </section>
    </main>
  )
}
