import { Suspense } from "react"

import { Spinner } from "@/components/astryx"

import { ReservationSearch } from "./reservation-search"

export default function ReservationSearchPage() {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center">
          <Spinner className="size-8" />
        </main>
      }
    >
      <ReservationSearch />
    </Suspense>
  )
}
