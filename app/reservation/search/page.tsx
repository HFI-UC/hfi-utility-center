import { ReservationSearch } from "./reservation-search"
import { parseReservationSearchFilters } from "./search-query"

type SearchParams = Record<string, string | string[] | undefined>

export default async function ReservationSearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = parseReservationSearchFilters(await searchParams)
  return <ReservationSearch filters={filters} />
}
