"use client"

import { CalendarPlus, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

export default function Page() {
  const nav = useTranslations("nav")
  const router = useRouter()
  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-12 sm:px-8">
      <section className="w-full max-w-4xl text-center">
        <h1 className="text-4xl font-semibold sm:text-6xl">
          HFI Utility Center
        </h1>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            size="lg"
            onClick={() => router.push("/reservation/create")}
          >
            <CalendarPlus />
            {nav("book")}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => router.push("/reservation/search")}
          >
            <Search />
            {nav("reservations")}
          </Button>
        </div>
      </section>
    </main>
  )
}
