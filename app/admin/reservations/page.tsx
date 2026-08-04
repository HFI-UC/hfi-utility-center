"use client"

import { useMemo, useState } from "react"
import { Check, Download, RefreshCw, Search, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { AdminPageHeader } from "@/app/admin/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAdminResource } from "@/lib/api/admin-hooks"
import {
  getFutureReservations,
  updateReservationApproval,
} from "@/lib/api/reservations"
import type { Reservation } from "@/lib/api/types"
import { backendHref, getErrorMessage } from "@/lib/api/client"
import {
  backendDateTimeToDate,
  createAppDateTimeFormatter,
} from "@/lib/date-time"

export default function AdminReservationsPage() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const statusT = useTranslations("status")
  const locale = useLocale()
  const [query, setQuery] = useState("")
  const [workingId, setWorkingId] = useState<number>()
  const [rejectingId, setRejectingId] = useState<number>()
  const [reason, setReason] = useState("")
  const reservationResource = useAdminResource<Reservation[]>({
    loadResource: getFutureReservations,
    initialData: [],
    fallbackError: common("unknown"),
  })
  const dateTimeFormatter = useMemo(
    () =>
      createAppDateTimeFormatter(locale, {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        weekday: "short",
      }),
    [locale]
  )

  function formatDateTime(value: string) {
    return dateTimeFormatter.format(backendDateTimeToDate(value))
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

  async function decide(id: number, approved: boolean) {
    if (!approved && !reason.trim()) {
      reservationResource.reportError(t("rejectionRequired"))
      return
    }
    setWorkingId(id)
    try {
      await updateReservationApproval(
        id,
        approved,
        approved ? undefined : reason.trim()
      )
      reservationResource.setData((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: approved ? "approved" : "rejected" }
            : item
        )
      )
      setRejectingId(undefined)
      setReason("")
      reservationResource.reportError(undefined)
    } catch (actionError) {
      reservationResource.reportError(
        getErrorMessage(actionError, common("unknown"))
      )
    } finally {
      setWorkingId(undefined)
    }
  }

  function startRejection(id: number) {
    setRejectingId(id)
    setReason("")
    reservationResource.reportError(undefined)
  }

  function cancelRejection() {
    setRejectingId(undefined)
    setReason("")
    reservationResource.reportError(undefined)
  }

  return (
    <main>
      <AdminPageHeader
        title={t("reservationsTitle")}
        description={t("reservationsDescription")}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                void reservationResource.reload()
              }}
              disabled={reservationResource.loading}
            >
              <RefreshCw />
              {common("refresh")}
            </Button>
            <Link
              href={backendHref("/reservation/export")}
              className={buttonVariants({ variant: "outline" })}
            >
              <Download />
              {t("exportReservations")}
            </Link>
          </>
        }
      />
      <div className="relative my-5 max-w-lg">
        <Search className="absolute top-3 left-3 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("reservationSearch")}
        />
      </div>
      {reservationResource.error ? (
        <p className="border-y py-3 text-sm text-destructive">
          {reservationResource.error}
        </p>
      ) : null}
      {reservationResource.loading ? (
        <p className="py-12 text-sm text-muted-foreground">
          {t("reservationsLoading")}
        </p>
      ) : null}
      {!reservationResource.loading && !filtered.length ? (
        <div className="border-t py-16">
          <p className="font-medium">{t("reservationsEmpty")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("reservationsEmptyDescription")}
          </p>
        </div>
      ) : null}
      <div className="divide-y border-t">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-3 py-4 sm:grid-cols-2 xl:grid-cols-[7rem_1.2fr_1fr_1.2fr_auto] xl:items-start"
          >
            <div className="col-span-2 flex items-center justify-between sm:col-span-2 xl:col-span-1 xl:block">
              <p className="text-sm font-medium">#{item.id}</p>
              <Badge className="xl:mt-2">{statusT(item.status)}</Badge>
            </div>
            <div className="col-span-2 min-w-0 sm:col-span-1 xl:col-span-1">
              <p className="font-semibold">{item.roomName}</p>
              <p className="mt-1 text-sm">
                {t("timeRange", {
                  start: formatDateTime(item.startTime),
                  end: formatDateTime(item.endTime),
                })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.campusName} · {item.className}
              </p>
            </div>
            <div className="col-span-2 min-w-0 sm:col-span-1 xl:col-span-1">
              <p className="text-sm font-medium">{item.studentName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.studentId}
              </p>
              <p className="mt-1 text-xs break-all text-muted-foreground">
                {item.email}
              </p>
            </div>
            <p className="col-span-2 text-sm leading-5 text-muted-foreground xl:col-span-1">
              {item.reason}
            </p>
            <div className="col-span-2 flex gap-2 xl:col-span-1 xl:justify-end">
              {item.status === "pending" ? (
                <>
                  <Button
                    size="sm"
                    disabled={workingId === item.id}
                    onClick={() => void decide(item.id, true)}
                  >
                    <Check />
                    {t("approve")}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => startRejection(item.id)}
                  >
                    <X />
                    {t("reject")}
                  </Button>
                </>
              ) : null}
            </div>
            {rejectingId === item.id ? (
              <div className="col-span-2 grid gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 xl:col-span-5">
                <Textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={t("rejectionPlaceholder")}
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    disabled={workingId === item.id}
                    onClick={() => void decide(item.id, false)}
                  >
                    {t("confirmReject")}
                  </Button>
                  <Button variant="outline" onClick={cancelRejection}>
                    {common("cancel")}
                  </Button>
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </main>
  )
}
