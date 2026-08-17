import type { ComponentProps } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"

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
    <Pagination className="pt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationRouteLink
            href={reservationSearchHref(filters, Math.max(0, filters.page - 1))}
            size="default"
            aria-disabled={atFirstPage}
            className={
              atFirstPage ? "pointer-events-none opacity-50" : undefined
            }
          >
            <ChevronLeftIcon />
            <span className="hidden sm:block">{previousLabel}</span>
          </PaginationRouteLink>
        </PaginationItem>
        {pages.map((page, index) => (
          <span key={page} className="contents">
            {index > 0 && page - pages[index - 1] > 1 ? (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            ) : null}
            <PaginationItem>
              <PaginationRouteLink
                href={reservationSearchHref(filters, page)}
                active={page === filters.page}
              >
                {page + 1}
              </PaginationRouteLink>
            </PaginationItem>
          </span>
        ))}
        <PaginationItem>
          <PaginationRouteLink
            href={reservationSearchHref(
              filters,
              Math.min(totalPages - 1, filters.page + 1)
            )}
            size="default"
            aria-disabled={atLastPage}
            className={
              atLastPage ? "pointer-events-none opacity-50" : undefined
            }
          >
            <span className="hidden sm:block">{nextLabel}</span>
            <ChevronRightIcon />
          </PaginationRouteLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function PaginationRouteLink({
  active,
  size = "icon",
  className,
  ...props
}: ComponentProps<typeof Link> & {
  active?: boolean
  size?: "default" | "icon"
}) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        buttonVariants({ variant: active ? "outline" : "ghost", size }),
        className
      )}
      {...props}
    />
  )
}
