import { ArrowRight, CalendarPlus, Search } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"

export default async function Page() {
  const nav = await getTranslations("nav")
  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-12 sm:px-8">
      <section className="w-full max-w-4xl text-center">
        <p className="text-sm font-medium text-muted-foreground">MAKERs</p>
        <h1 className="mt-5 text-5xl font-semibold leading-none sm:text-7xl lg:text-8xl">HFI Utility Center</h1>
        <div className="mx-auto mt-10 flex max-w-md flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 flex-1 px-5 text-base">
            <Link href="/reservation/create"><CalendarPlus />{nav("book")}<ArrowRight className="ml-auto" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 flex-1 px-5 text-base">
            <Link href="/reservation/search"><Search />{nav("reservations")}<ArrowRight className="ml-auto" /></Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
