"use client"

import { useMemo, useState } from "react"
import { Check, Download, RefreshCw, Search, X } from "lucide-react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { AdminPageHeader, AdminSection } from "@/app/admin/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
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
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        weekday: "short",
      }),
    [locale]
  )

  function formatDateTime(value: string) {
    return dateTimeFormatter.format(new Date(value))
  }

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return reservationResource.data
    return reservationResource.data.filter((item) =>
      [
        item.studentName,
        item.email,
        item.studentId,
        item.roomName,
        item.className,
        item.reason,
        String(item.id),
      ].some((value) => value?.toLowerCase().includes(keyword))
    )
  }, [query, reservationResource.data])

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

  function statusClassName(status: Reservation["status"]) {
    if (status === "rejected") return "bg-destructive/10 text-destructive"
    if (status === "approved") return "bg-secondary text-secondary-foreground"
    return "bg-primary text-primary-foreground"
  }

  return (
    <main className="space-y-6">
      <AdminPageHeader
        title={t("reservationsTitle")}
        description={t("reservationsDescription")}
        actions={
          <>
            <Button
              variant="outline"
              onClick={reservationResource.reload}
              disabled={reservationResource.loading}
            >
              <RefreshCw />
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
        <InputGroup className="max-w-lg">
          <InputGroupInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("reservationSearch")}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
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
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} size="sm">
              <CardHeader className="border-b">
                <CardTitle>{t("reservationNumber", { id: item.id })}</CardTitle>
                <CardAction>
                  <Badge className={statusClassName(item.status)}>
                    {statusT(item.status)}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex-1 gap-5">
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
                <ReservationGroup title={t("reservationDetails")}>
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
              </CardContent>
              {item.status === "pending" ? (
                <CardFooter className="gap-2 border-t">
                  <Button
                    className="flex-1"
                    size="sm"
                    disabled={working}
                    onClick={() => submitDecision(item.id, "approved")}
                  >
                    <Check />
                    {t("approve")}
                  </Button>
                  <Button
                    className="flex-1"
                    size="sm"
                    variant="destructive"
                    disabled={working}
                    onClick={() => startRejection(item.id)}
                  >
                    <X />
                    {t("reject")}
                  </Button>
                </CardFooter>
              ) : null}
            </Card>
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
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="mb-3 font-medium">{title}</h3>
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
