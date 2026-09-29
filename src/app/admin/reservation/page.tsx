"use client"

import { Download, Inbox } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useCallback, useMemo, useState } from "react"

import { EmptyState, ErrorState, LoadingState } from "@/components/layout/data-state"
import { PageHeader } from "@/components/layout/page-header"
import { RefreshButton } from "@/components/layout/refresh-button"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAdminMutation, useAdminResource } from "@/lib/api/admin-hooks"
import { backendHref } from "@/lib/api/client"
import { getFutureReservations, updateReservationApproval } from "@/lib/api/reservations"
import type { Reservation } from "@/lib/api/types"
import { formatApiTimestamp } from "@/lib/date-time"

import { RejectReservationDialog } from "./reject-reservation-dialog"
import { ReservationFilters, ReservationList, ReservationTable } from "./reservation-queue"
import { useReservationFilter, type StatusFilter } from "./use-reservation-filter"

export default function AdminReservationsPage() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const locale = useLocale()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [rejectingId, setRejectingId] = useState<number>()
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string>()
  const reservationResource = useAdminResource<Reservation[]>({
    loadResource: getFutureReservations,
    initialData: [],
  })
  const { mutate, working } = useAdminMutation({
    reload: reservationResource.reload,
  })
  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "short",
        timeStyle: "short",
      }),
    [locale],
  )

  const formatDateTime = useCallback(
    (value: string) => formatApiTimestamp(dateTimeFormatter, value),
    [dateTimeFormatter],
  )

  const filtered = useReservationFilter(reservationResource.data, query, statusFilter)

  async function submitDecision(id: number, nextStatus: "approved" | "rejected") {
    const approved = nextStatus === "approved"
    const rejectionReason = reason.trim()
    if (!approved && !rejectionReason) {
      setError(t("rejectionRequired"))
      return
    }

    setError(undefined)
    const saved = await mutate(
      () => updateReservationApproval(id, approved, approved ? undefined : rejectionReason),
      t(approved ? "reservationApproved" : "reservationRejected"),
    )
    if (saved) {
      setRejectingId(undefined)
      setReason("")
    }
  }

  function startRejection(id: number) {
    setRejectingId(id)
    setReason("")
    setError(undefined)
  }

  function cancelRejection() {
    setRejectingId(undefined)
    setReason("")
    setError(undefined)
  }

  const refresh = () => void reservationResource.reload().catch(() => undefined)

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title={t("reservationsTitle")}
        description={t("reservationsDescription")}
        actions={
          <>
            <RefreshButton
              label={common("refresh")}
              loading={reservationResource.loading}
              onRefresh={refresh}
            />
            <Button asChild variant="outline">
              <a href={backendHref("/reservation/export")}>
                <Download />
                {t("exportReservations")}
              </a>
            </Button>
          </>
        }
      />

      <ReservationFilters
        query={query}
        status={statusFilter}
        onQueryChange={setQuery}
        onStatusChange={setStatusFilter}
      />

      <Separator />

      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium">{t("reservationQueue")}</h2>
          <span className="text-sm text-muted-foreground tabular-nums">{filtered.length}</span>
        </div>

        {reservationResource.error && !reservationResource.loading ? (
          <ErrorState onRetry={refresh} retryLabel={common("retry")} />
        ) : null}

        {reservationResource.loading ? <LoadingState label={t("reservationsLoading")} /> : null}

        {!reservationResource.loading && !filtered.length ? (
          <EmptyState
            icon={Inbox}
            title={t("reservationsEmpty")}
            description={t("reservationsEmptyDescription")}
          />
        ) : null}

        {!reservationResource.loading && filtered.length ? (
          <>
            <ReservationTable
              reservations={filtered}
              working={working}
              formatDateTime={formatDateTime}
              onApprove={(id) => void submitDecision(id, "approved")}
              onReject={startRejection}
            />
            <ReservationList
              reservations={filtered}
              working={working}
              formatDateTime={formatDateTime}
              onApprove={(id) => void submitDecision(id, "approved")}
              onReject={startRejection}
            />
          </>
        ) : null}
      </section>

      <RejectReservationDialog
        open={rejectingId !== undefined}
        reason={reason}
        error={error}
        working={working}
        onReasonChange={setReason}
        onConfirm={() => {
          if (rejectingId !== undefined) void submitDecision(rejectingId, "rejected")
        }}
        onOpenChange={(open) => {
          if (!open) cancelRejection()
        }}
      />
    </div>
  )
}
