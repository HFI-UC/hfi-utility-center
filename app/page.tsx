import { ArrowRight, CalendarDays, Clock3 } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"

export default async function Page() {
  const nav = await getTranslations("nav")
  const home = await getTranslations("home")
  return (
    <main className="px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto grid min-h-[calc(100svh-13rem)] max-w-7xl grid-cols-4 content-center gap-x-4 gap-y-12 lg:grid-cols-12 lg:gap-x-6">
        <section className="col-span-4 lg:col-span-7">
          <p className="swiss-label">{home("eyebrow")}</p>
          <h1 className="mt-6 max-w-4xl text-6xl font-semibold leading-[0.92] tracking-normal sm:text-8xl lg:text-9xl">
            HFI Utility<br />Center
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">{home("description")}</p>

          <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 border-t pt-5 text-sm sm:grid-cols-3">
            <p className="flex items-center gap-2"><Clock3 className="size-4 text-muted-foreground" />{home("slot")}</p>
            <p className="flex items-center gap-2"><CalendarDays className="size-4 text-muted-foreground" />{home("days")}</p>
            <p className="flex items-center gap-2"><Clock3 className="size-4 text-muted-foreground" />{home("duration")}</p>
          </div>
        </section>

        <section className="col-span-4 self-center rounded-xl border bg-card p-5 text-card-foreground shadow-sm sm:p-7 lg:col-span-5">
          <p className="text-sm font-medium text-muted-foreground">HFI Utility Center</p>
          <div className="mt-6 grid gap-3">
            <Button asChild size="lg" className="h-14 justify-between px-5 text-base">
              <Link href="/reservation/create"><span>{nav("book")}</span><ArrowRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 justify-between px-5 text-base">
              <Link href="/reservation/search"><span>{nav("reservations")}</span><ArrowRight /></Link>
            </Button>
          </div>
          <p className="mt-6 border-t pt-5 text-sm leading-6 text-muted-foreground">{home("validation")}</p>
        </section>
      </div>
    </main>
  )
}
