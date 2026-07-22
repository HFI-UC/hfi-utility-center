import { ArrowDownRight, CalendarPlus, Search } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"

export default async function Page() {
  const nav = await getTranslations("nav")
  return (
    <main className="swiss-grid min-h-[calc(100svh-4rem)] overflow-hidden px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto grid min-h-[calc(100svh-10rem)] max-w-[96rem] grid-cols-12 gap-x-4 sm:gap-x-6">
        <div className="col-span-12 flex items-start justify-between border-t-4 border-foreground pt-3">
          <p className="swiss-label">ROOM RESERVATION SYSTEM / 2026</p>
          <p className="font-mono text-xs">23.1291° N<br />113.2644° E</p>
        </div>

        <div className="col-span-12 mt-8 self-center sm:mt-12 lg:col-span-10">
          <h1 className="swiss-display text-[5rem] sm:text-[8rem] lg:text-[10rem] xl:text-[12rem]">
            <span className="block">HFI</span>
            <span className="block text-red-600">UTILITY</span>
            <span className="block">CENTER</span>
          </h1>
        </div>

        <div className="col-span-12 mt-10 grid self-end border-t border-foreground sm:grid-cols-2 lg:col-span-8 lg:col-start-5">
          <Button asChild className="h-24 justify-between rounded-none border-0 border-b border-foreground bg-red-600 px-5 text-base text-white hover:bg-black sm:border-r sm:border-b-0">
            <Link href="/reservation/create"><span className="flex items-center gap-3"><CalendarPlus />{nav("book")}</span><ArrowDownRight className="size-6" /></Link>
          </Button>
          <Button asChild variant="outline" className="h-24 justify-between rounded-none border-0 border-b border-foreground px-5 text-base sm:border-b-0">
            <Link href="/reservation/search"><span className="flex items-center gap-3"><Search />{nav("reservations")}</span><ArrowDownRight className="size-6" /></Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
