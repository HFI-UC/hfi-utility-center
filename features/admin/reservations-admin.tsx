"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Check, Download, RefreshCw, Search, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { AdminPageHeader } from "@/components/admin-page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  getFutureReservations,
  updateReservationApproval,
} from "@/lib/api/reservations"
import type { Reservation } from "@/lib/api/types"

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  }).format(new Date(value))
}

export function ReservationsAdmin() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const statusT = useTranslations("status")
  const locale = useLocale()
  const [items, setItems] = useState<Reservation[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState<number>()
  const [rejectingId, setRejectingId] = useState<number>()
  const [reason, setReason] = useState("")
  const [error, setError] = useState<string>()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await getFutureReservations())
      setError(undefined)
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : common("unknown")
      )
    } finally {
      setLoading(false)
    }
  }, [common])

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [load])

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return items
    return items.filter((item) =>
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
  }, [items, query])

  async function decide(id: number, approved: boolean) {
    if (!approved && !reason.trim()) {
      setError(t("rejectionRequired"))
      return
    }
    setWorkingId(id)
    try {
      await updateReservationApproval(
        id,
        approved,
        approved ? undefined : reason.trim()
      )
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: approved ? "approved" : "rejected" }
            : item
        )
      )
      setRejectingId(undefined)
      setReason("")
      setError(undefined)
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : common("unknown")
      )
    } finally {
      setWorkingId(undefined)
    }
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
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw />
              {common("refresh")}
            </Button>
            <Button asChild variant="outline">
              <Link href="/api/backend/reservation/export">
                <Download />
                {t("exportReservations")}
              </Link>
            </Button>
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
      {error ? (
        <p className="border-y py-3 text-sm text-destructive">{error}</p>
      ) : null}
      {loading ? (
        <p className="py-12 text-sm text-muted-foreground">
          {t("reservationsLoading")}
        </p>
      ) : null}
      {!loading && !filtered.length ? (
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
            className="grid gap-4 py-5 xl:grid-cols-[8rem_1.2fr_1fr_1.2fr_auto] xl:items-start"
          >
            <div>
              <p className="font-mono text-sm">#{item.id}</p>
              <Badge className="mt-2">{statusT(item.status)}</Badge>
            </div>
            <div>
              <p className="font-semibold">{item.roomName}</p>
              <p className="mt-1 text-sm">
                {t("timeRange", {
                  start: formatDateTime(item.startTime, locale),
                  end: formatDateTime(item.endTime, locale),
                })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.campusName} · {item.className}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">{item.studentName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.studentId}
              </p>
              <p className="mt-1 text-xs break-all text-muted-foreground">
                {item.email}
              </p>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {item.reason}
            </p>
            <div className="flex gap-2 xl:justify-end">
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
                    onClick={() => setRejectingId(item.id)}
                  >
                    <X />
                    {t("reject")}
                  </Button>
                </>
              ) : null}
            </div>
            {rejectingId === item.id ? (
              <div className="grid gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 xl:col-span-5">
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
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectingId(undefined)
                      setReason("")
                    }}
                  >
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
