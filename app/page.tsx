import { CalendarPlus, Search } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"

export default async function Page() {
  const nav = await getTranslations("nav")
  return (
    <main className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-4 py-12 sm:px-6">
      <div className="flex w-full max-w-5xl flex-col items-center text-center">
        <div className="mb-7 h-1 w-12 bg-red-600" aria-hidden="true" />
        <h1 className="text-5xl font-semibold leading-none sm:text-7xl lg:text-8xl">
          HFI Utility Center
        </h1>
        <div className="mt-10 flex w-full max-w-md flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 flex-1 bg-red-600 px-6 text-base text-white hover:bg-red-700">
            <Link href="/reservation/create"><CalendarPlus />{nav("book")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 flex-1 px-6 text-base">
            <Link href="/reservation/search"><Search />{nav("reservations")}</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
