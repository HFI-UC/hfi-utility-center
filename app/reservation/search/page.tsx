import { Suspense } from "react"
import { ReservationSearch } from "@/features/reservation-search/reservation-search"

export default function ReservationSearchPage() {
  return <Suspense fallback={<main className="mx-auto max-w-7xl px-4 py-12 text-sm text-muted-foreground sm:px-6">正在加载查询工具…</main>}><ReservationSearch /></Suspense>
}
