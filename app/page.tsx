import { PenSquare, Search } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex w-full flex-col items-center px-8 py-16 sm:px-10 md:px-16">
      <div className="w-full max-w-2xl">
        <h1 className="mb-12 text-4xl font-semibold tracking-tight sm:font-medium sm:text-6xl transition-all duration-300">HFI Utility Center</h1>
        <div className="flex flex-col items-end">
          <Link
            href="/reservation/create"
            className="group flex w-full items-baseline justify-between gap-10 border-b border-border py-3 text-2xl font-medium tracking-tight transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <span>Book a room</span>
            <PenSquare className="size-5 shrink-0 translate-y-0.5" />
          </Link>
          <Link
            href="#"
            className="group flex w-full items-baseline justify-between gap-10 border-b border-border py-3 text-2xl font-medium tracking-tight transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          >
            <span>Search reservation</span>
            <Search className="size-5 shrink-0 translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
