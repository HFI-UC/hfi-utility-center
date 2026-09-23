"use client"

import { useMemo, useState } from "react"
import { Check, Download, RefreshCw, Search, X } from "lucide-react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { AdminPageHeader, AdminSection } from "@/app/admin/admin-shell"
import { Button } from "@/components/astryx"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/astryx"
import { Field, FieldError, FieldLabel } from "@/components/astryx"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/astryx"
import { Spinner } from "@/components/astryx"
import { Textarea } from "@/components/astryx"
import { useAdminMutation, useAdminResource } from "@/lib/api/admin-hooks"
import {
  getFutureReservations,
  updateReservationApproval,
} from "@/lib/api/reservations"
import type { Reservation } from "@/lib/api/types"
import { backendHref } from "@/lib/api/client"

export default function AdminReservationsPage() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const statusT = useTranslations("status")
  const locale = useLocale()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    "all" | Reservation["status"]
  >("all")
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
    [locale]
  )

  function formatDateTime(value: string) {
    return dateTimeFormatter.format(new Date(value))
  }

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return reservationResource.data.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false
      if (!keyword) return true
      return [
        item.studentName,
        item.email,
        item.studentId,
        item.roomName,
        item.className,
        item.reason,
        String(item.id),
      ].some((value) => value?.toLowerCase().includes(keyword))
    })
  }, [query, reservationResource.data, statusFilter])

  async function submitDecision(
    id: number,
    nextStatus: "approved" | "rejected"
  ) {
    const approved = nextStatus === "approved"
    const rejectionReason = reason.trim()
    if (!approved && !rejectionReason) {
      setError(t("rejectionRequired"))
      return
    }

    setError(undefined)
    const saved = await mutate(
      () =>
        updateReservationApproval(
          id,
          approved,
          approved ? undefined : rejectionReason
        ),
      t(approved ? "reservationApproved" : "reservationRejected")
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

  return (
    <main className="admin-page space-y-6">
      <AdminPageHeader
        title={t("reservationsTitle")}
        description={t("reservationsDescription")}
        actions={
          <>
            <Button
              variant="outline"
              icon={<RefreshCw />}
              className="admin-action-button"
              onClick={() =>
                void reservationResource.reload().catch(() => undefined)
              }
              disabled={reservationResource.loading}
            >
              {common("refresh")}
            </Button>
            <Button asChild variant="outline">
              <Link href={backendHref("/reservation/export")}>
                <Download />
                {t("exportReservations")}
              </Link>
            </Button>
          </>
        }
      />
      <AdminSection title={t("reservationQueue")}>
        <InputGroup className="admin-reservation-search max-w-lg">
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("reservationSearch")}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        <div
          className="mt-3 flex flex-wrap gap-2"
          role="group"
          aria-label={t("reservationStatusFilter")}
        >
          {(
            ["all", "pending", "approved", "rejected", "cancelled"] as const
          ).map((status) => (
            <Button
              key={status}
              type="button"
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
            >
              {status === "all" ? t("allStatuses") : statusT(status)}
            </Button>
          ))}
        </div>
        {reservationResource.error && !reservationResource.loading ? (
          <div className="admin-error-state mt-5" role="alert">
            <p>{common("unknown")}</p>
            <Button
              variant="outline"
              onClick={() =>
                void reservationResource.reload().catch(() => undefined)
              }
            >
              <RefreshCw />
              {common("retry")}
            </Button>
          </div>
        ) : null}
        {reservationResource.loading ? (
          <p className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
            <Spinner />
            {t("reservationsLoading")}
          </p>
        ) : null}
        {!reservationResource.loading && !filtered.length ? (
          <div className="flex min-h-48 flex-col justify-center">
            <p className="font-medium">{t("reservationsEmpty")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("reservationsEmptyDescription")}
            </p>
          </div>
        ) : null}
        <div className="admin-reservation-grid mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <article key={item.id} className="admin-reservation-card">
              <header className="admin-reservation-card__header">
                <h3 className="admin-reservation-card__title">
                  {t("reservationNumber", { id: item.id })}
                </h3>
                <span
                  className={`admin-reservation-status admin-reservation-status--${item.status}`}
                >
                  {statusT(item.status)}
                </span>
              </header>
              <div className="admin-reservation-card__content">
                <ReservationGroup title={t("studentInformation")}>
                  <ReservationField label={t("name")}>
                    {item.studentName}
                  </ReservationField>
                  <ReservationField label={t("studentId")}>
                    {item.studentId || "—"}
                  </ReservationField>
                  <ReservationField label={t("email")} wide>
                    <a
                      className="break-all underline underline-offset-4"
                      href={`mailto:${item.email}`}
                    >
                      {item.email}
                    </a>
                  </ReservationField>
                  <ReservationField label={t("class")}>
                    {item.className || "—"}
                  </ReservationField>
                  <ReservationField label={t("campus")}>
                    {item.campusName || "—"}
                  </ReservationField>
                </ReservationGroup>
                <ReservationGroup
                  title={t("reservationDetails")}
                  className="border-t pt-5"
                >
                  <ReservationField label={t("room")}>
                    {item.roomName || "—"}
                  </ReservationField>
                  <ReservationField label={t("startTime")}>
                    {formatDateTime(item.startTime)}
                  </ReservationField>
                  <ReservationField label={t("endTime")}>
                    {formatDateTime(item.endTime)}
                  </ReservationField>
                  <ReservationField label={t("reason")} wide>
                    {item.reason}
                  </ReservationField>
                </ReservationGroup>
              </div>
              <footer className="admin-reservation-card__footer">
                {item.status !== "approved" ? (
                  <button
                    type="button"
                    className="admin-decision-button admin-decision-button--approve"
                    disabled={working}
                    onClick={() => submitDecision(item.id, "approved")}
                  >
                    <Check /> <span>{t("approve")}</span>
                  </button>
                ) : null}
                {item.status !== "rejected" ? (
                  <button
                    type="button"
                    className="admin-decision-button admin-decision-button--reject"
                    disabled={working}
                    onClick={() => startRejection(item.id)}
                  >
                    <X /> <span>{t("reject")}</span>
                  </button>
                ) : null}
              </footer>
            </article>
          ))}
        </div>
      </AdminSection>
      <Dialog
        open={rejectingId !== undefined}
        onOpenChange={(open) => {
          if (!open) cancelRejection()
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("reject")}</DialogTitle>
            <DialogDescription>
              {t("rejectionDialogDescription")}
            </DialogDescription>
          </DialogHeader>
          <Field data-invalid={Boolean(error)}>
            <FieldLabel htmlFor="rejection-reason">{t("reason")}</FieldLabel>
            <Textarea
              id="rejection-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t("rejectionPlaceholder")}
              aria-invalid={Boolean(error)}
            />
            <FieldError>{error}</FieldError>
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={working}>
                {common("cancel")}
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={working}
              onClick={() => {
                if (rejectingId !== undefined) {
                  submitDecision(rejectingId, "rejected")
                }
              }}
            >
              {t("confirmReject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function ReservationGroup({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={className}>
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</dl>
    </section>
  )
}

function ReservationField({
  label,
  wide,
  children,
}: {
  label: string
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  )
}
