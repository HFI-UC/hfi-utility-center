"use client"

import { CalendarPlus, Search } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Page() {
  const nav = useTranslations("nav")
  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-12 sm:px-8">
      <section className="w-full max-w-4xl text-center">
        <Badge>MAKERs‘</Badge>
        <h1 className="mt-6 text-4xl font-semibold sm:text-6xl">
          HFI Utility Center
        </h1>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/reservation/create">
              <CalendarPlus />
              {nav("book")}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/reservation/search">
              <Search />
              {nav("reservations")}
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
