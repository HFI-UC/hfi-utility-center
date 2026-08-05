import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import {
  reservationSearchHref,
  type ReservationSearchFilters,
  visiblePageNumbers,
} from "./search-query"

export function ReservationSearchPagination({
  filters,
  totalReservations,
  previousLabel,
  nextLabel,
}: {
  filters: ReservationSearchFilters
  totalReservations: number
  previousLabel: string
  nextLabel: string
}) {
  if (totalReservations <= 20) return null

  const totalPages = Math.max(1, Math.ceil(totalReservations / 20))
  const pages = visiblePageNumbers(filters.page, totalPages)
  const atFirstPage = filters.page === 0
  const atLastPage = filters.page >= totalPages - 1

  return (
    <Pagination className="border-t pt-5">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={reservationSearchHref(filters, Math.max(0, filters.page - 1))}
            text={previousLabel}
            aria-disabled={atFirstPage}
            className={
              atFirstPage ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
        {pages.map((page, index) => (
          <span key={page} className="contents">
            {index > 0 && page - pages[index - 1] > 1 ? (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            ) : null}
            <PaginationItem>
              <PaginationLink
                href={reservationSearchHref(filters, page)}
                isActive={page === filters.page}
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          </span>
        ))}
        <PaginationItem>
          <PaginationNext
            href={reservationSearchHref(
              filters,
              Math.min(totalPages - 1, filters.page + 1)
            )}
            text={nextLabel}
            aria-disabled={atLastPage}
            className={
              atLastPage ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
