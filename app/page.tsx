import { CalendarPlus, Search } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function Page() {
  const nav = await getTranslations("nav")
  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-12 sm:px-8">
      <section className="w-full max-w-4xl text-center">
        <Badge>MAKERs</Badge>
        <h1 className="mt-6 text-4xl font-semibold sm:text-6xl">
          HFI Utility Center
        </h1>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/reservation/create">
              <CalendarPlus />
              {nav("book")}
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
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
