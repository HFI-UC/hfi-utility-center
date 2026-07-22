import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"

export default async function Page() {
  const nav = await getTranslations("nav")
  return (
    <main className="swiss-grid overflow-hidden px-4 sm:px-8">
      <div className="mx-auto grid min-h-[calc(100svh-9.5rem)] max-w-[96rem] grid-cols-12 gap-x-4 py-7 sm:gap-x-6 sm:py-10">
        <div className="col-span-12 self-center lg:col-span-8">
          <h1 className="swiss-display text-[5rem] sm:text-[7.75rem] lg:text-[9rem] xl:text-[10.5rem]">
            <span className="block">HFI</span>
            <span className="block">UTILITY</span>
            <span className="block">CENTER</span>
          </h1>
        </div>

        <div className="col-span-12 mt-8 flex flex-col justify-center gap-5 lg:col-span-4 lg:mt-0 lg:pl-10">
          <Button asChild className="group h-20 justify-start gap-4 border-0 bg-transparent p-0 text-left text-foreground hover:bg-transparent hover:text-red-600">
            <Link href="/reservation/create"><span className="grid size-12 shrink-0 place-items-center bg-red-600 text-white group-hover:bg-black"><ArrowRight /></span><span className="text-xl font-black leading-tight">{nav("book")}<span className="block text-base">Book</span></span></Link>
          </Button>
          <Button asChild className="group h-20 justify-start gap-4 border-0 bg-transparent p-0 text-left text-foreground hover:bg-transparent hover:text-red-600">
            <Link href="/reservation/search"><span className="grid size-12 shrink-0 place-items-center border border-red-600 text-red-600 group-hover:bg-red-600 group-hover:text-white"><ArrowRight /></span><span className="text-xl font-black leading-tight">{nav("reservations")}<span className="block text-base">Reservations</span></span></Link>
          </Button>
        </div>

        <div className="col-span-12 self-end border-t border-foreground pt-3">
          <p className="text-xs font-bold">高效 · 公平 · 透明</p>
          <p className="mt-1 text-[0.6875rem] text-muted-foreground">Efficient · Fair · Transparent</p>
        </div>
      </div>
    </main>
  )
}
