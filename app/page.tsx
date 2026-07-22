import { ArrowRight, CalendarPlus, Search } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function Page() {
  const nav = await getTranslations("nav")
  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-12 sm:px-8">
      <section className="w-full max-w-4xl text-center">
        <Badge className="bg-secondary text-secondary-foreground">MAKERs</Badge>
        <h1 className="mt-6 text-4xl font-semibold sm:text-6xl">
          HFI Utility Center
        </h1>
        <div className="mx-auto mt-10 flex max-w-md flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 flex-1 px-5 text-base">
            <Link href="/reservation/create">
              <CalendarPlus />
              {nav("book")}
              <ArrowRight className="ml-auto" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 flex-1 px-5 text-base"
          >
            <Link href="/reservation/search">
              <Search />
              {nav("reservations")}
              <ArrowRight className="ml-auto" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
