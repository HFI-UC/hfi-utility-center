import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { getLocale, getTranslations } from "next-intl/server"

import { GlassSurface } from "@/components/glass-surface"

export default async function Page() {
  const nav = await getTranslations("nav")
  const locale = await getLocale()
  const home = await getTranslations("home")
  return (
    <main className="relative isolate overflow-hidden px-4 sm:px-8">
      <div className="absolute right-[7%] top-[18%] -z-10 hidden h-[52%] w-[24%] bg-[#43d9c0] lg:block dark:bg-[#007c83]" aria-hidden="true" />
      <div className="absolute right-[3%] top-[14%] -z-10 hidden size-16 bg-signal lg:block" aria-hidden="true" />
      <div className="mx-auto grid min-h-[calc(100svh-6.5rem)] max-w-[96rem] grid-cols-4 content-center gap-x-4 gap-y-12 py-12 sm:py-16 lg:grid-cols-12 lg:gap-x-6">
        <section className="col-span-4 lg:col-span-7">
          <p className="swiss-label mb-8">{home("eyebrow")}</p>
          <h1 className="max-w-4xl text-[4rem] font-bold leading-[0.9] sm:text-[6rem] lg:text-[7rem]">
            <span className="block">HFI</span>
            <span className="block">Utility Center</span>
          </h1>
          <p className="mt-8 max-w-md text-lg leading-7 text-muted-foreground sm:text-xl">{home("description")}</p>

          <dl className="mt-12 grid max-w-2xl grid-cols-3 border-y border-foreground/20 py-5 text-sm">
            {[home("slot"), home("days"), home("duration")].map((value, index) => (
              <div key={value} className="border-l border-foreground/15 px-3 first:border-l-0 first:pl-0 sm:px-5">
                <dt className="font-mono text-[0.625rem] text-brand">0{index + 1}</dt>
                <dd className="mt-2 font-semibold leading-5">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="relative col-span-4 self-center lg:col-span-4 lg:col-start-9">
          <div className="absolute -bottom-5 -left-5 -z-10 h-24 w-32 bg-signal lg:hidden" aria-hidden="true" />
          <GlassSurface className="w-full" contentClassName="p-3 sm:p-4" variant="action">
            <div className="mb-8 flex items-center justify-between px-2 pt-2">
              <p className="font-mono text-[0.625rem] font-bold uppercase">Start / 开始</p>
              <span className="size-2 bg-signal" aria-hidden="true" />
            </div>
            <div className="grid gap-2">
              <Link href="/reservation/create" className="group flex min-h-24 items-center justify-between rounded-md bg-brand px-5 text-brand-foreground outline-none transition-colors hover:bg-brand-strong focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
                <span><span className="block text-xl font-bold">{nav("book")}</span>{locale === "zh-CN" ? <span className="mt-1 block text-sm opacity-75">Book</span> : null}</span>
                <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/reservation/search" className="group flex min-h-20 items-center justify-between rounded-md border border-foreground/20 bg-background/75 px-5 outline-none transition-colors hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
                <span><span className="block text-lg font-bold">{nav("reservations")}</span>{locale === "zh-CN" ? <span className="mt-1 block text-sm text-muted-foreground">Reservations</span> : null}</span>
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </GlassSurface>
        </section>
      </div>
    </main>
  )
}
