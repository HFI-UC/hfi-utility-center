"use client"

import { SearchX } from "lucide-react"
import { useTranslations } from "next-intl"

import { AppShell } from "@/components/layout/app-shell"
import { EmptyState, ErrorState, LoadingState } from "@/components/layout/data-state"
import { PageHeader } from "@/components/layout/page-header"
import { SectionCard } from "@/components/layout/section-card"
import type { Reservation } from "@/lib/api/types"

import { ReservationResults } from "./reservation-results"
import { ReservationSearchFilterForm } from "./reservation-search-filters"
import { ReservationSearchPagination } from "./reservation-search-pagination"
import { type ReservationSearchFilters } from "./search-query"
import { useReservationSearch } from "./use-reservation-search"

export function ReservationSearch({ filters }: { filters: ReservationSearchFilters }) {
  const t = useTranslations("searchPage")
  const { catalog, result, loading, error, catalogError, retry } = useReservationSearch(filters)

  return (
    <AppShell>
      <PageHeader
        title={t("title")}
        actions={
          loading ? null : (
            <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
              {t("total", { count: result.total })}
            </span>
          )
        }
      />

      <div className="grid min-w-0 gap-6 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 lg:sticky lg:top-20">
          <SectionCard title={t("filtersTitle")} contentClassName="min-w-0">
            {catalogError ? (
              <div className="mb-4">
                <ErrorState
                  title={t("catalogErrorTitle")}
                  description={t("catalogErrorDescription")}
                  retryLabel={t("reloadCatalog")}
                  onRetry={retry}
                />
              </div>
            ) : null}
            <ReservationSearchFilterForm catalog={catalog} filters={filters} />
          </SectionCard>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {error ? (
            <ErrorState
              title={t("errorTitle")}
              description={error}
              retryLabel={t("retry")}
              onRetry={retry}
            />
          ) : (
            <SearchContent
              loading={loading}
              reservations={result.reservations}
              sort={filters.sort}
            />
          )}

          {!loading && !error ? (
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="tabular-nums">{t("total", { count: result.total })}</span>
                <span className="tabular-nums">{t("page", { page: filters.page + 1 })}</span>
              </div>
              <ReservationSearchPagination
                filters={filters}
                totalReservations={result.total}
                previousLabel={t("previous")}
                nextLabel={t("next")}
              />
            </div>
          ) : null}
        </div>
      </div>
    </AppShell>
  )
}

function SearchContent({
  loading,
  reservations,
  sort,
}: {
  loading: boolean
  reservations: Reservation[]
  sort: ReservationSearchFilters["sort"]
}) {
  const t = useTranslations("searchPage")

  if (loading) return <LoadingState rows={6} />

  return (
    <div className="motion-safe:animate-content-reveal">
      {reservations.length ? (
        <ReservationResults reservations={reservations} sort={sort} />
      ) : (
        <EmptyState icon={SearchX} title={t("emptyTitle")} description={t("emptyDescription")} />
      )}
    </div>
  )
}
