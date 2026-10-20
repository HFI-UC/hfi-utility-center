"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useMemo } from "react"

import { ReservationSearch } from "./reservation-search"
import { parseReservationSearchFilters } from "./search-query"

function ReservationSearchContent() {
  const searchParams = useSearchParams()
  const search = searchParams.toString()
  const filters = useMemo(() => {
    const params = new URLSearchParams(search)
    return parseReservationSearchFilters({
      ...Object.fromEntries(params),
      campus: params.getAll("campus"),
    })
  }, [search])
  return <ReservationSearch filters={filters} />
}

export default function ReservationSearchPage() {
  return (
    <Suspense fallback={null}>
      <ReservationSearchContent />
    </Suspense>
  )
}
