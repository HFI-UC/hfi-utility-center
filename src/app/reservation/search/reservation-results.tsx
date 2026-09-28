"use client"

import { Clock3, MapPin, Monitor, UserRound } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useMemo } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Reservation } from "@/lib/api/types"
import { formatApiTimestamp } from "@/lib/date-time"

const PURPOSE_LABEL = {
  personal: "purposePersonal",
  class: "purposeClass",
  club: "purposeClub",
} as const

const STATUS_DOT = {
  approved: "bg-success",
  pending: "bg-warning",
  ai_reviewing: "bg-info",
  rejected: "bg-danger",
  cancelled: "bg-muted-foreground/40",
} as const

export function ReservationResults({
  reservations,
  sort,
}: {
  reservations: Reservation[]
  sort: "time" | "sequence"
}) {
  const locale = useLocale()
  const statusT = useTranslations("status")
  const t = useTranslations("searchPage")
  const detailT = useTranslations("neo.reservations")

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
      }),
    [locale],
  )
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [locale],
  )

  const groups = useMemo(() => {
    const grouped = new Map<string, Reservation[]>()
    for (const reservation of reservations) {
      const label =
        sort === "sequence" ? "" : formatApiTimestamp(dateFormatter, reservation.startTime)
      const bucket = grouped.get(label)
      if (bucket) bucket.push(reservation)
      else grouped.set(label, [reservation])
    }
    return [...grouped.entries()]
  }, [dateFormatter, reservations, sort])

  return (
    <div className="flex min-w-0 flex-col gap-6">
      {groups.map(([label, items]) => (
        <section key={label || "all"} className="min-w-0 space-y-2">
          <h2 className="text-sm font-medium break-words text-muted-foreground">
            {label || t("allDates")}
          </h2>

          <div className="hidden min-w-0 sm:block">
            <Table className="min-w-[44rem]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[22%]">{t("location")}</TableHead>
                  <TableHead className="w-[18%]">{t("time")}</TableHead>
                  <TableHead className="w-[30%]">{t("purpose")}</TableHead>
                  <TableHead className="w-[18%]">{t("requester")}</TableHead>
                  <TableHead className="text-right">{t("status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="max-w-0 min-w-0">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <MapPin aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate font-medium">
                          {reservation.roomName || detailT("roomFallback")}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap tabular-nums">
                      {formatApiTimestamp(timeFormatter, reservation.startTime)} –{" "}
                      {formatApiTimestamp(timeFormatter, reservation.endTime)}
                    </TableCell>
                    <TableCell className="max-w-0 min-w-0">
                      <span
                        className="block truncate"
                        title={reservation.reason || detailT("reasonFallback")}
                      >
                        {reservation.reason || detailT("reasonFallback")}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-0 min-w-0">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <UserRound
                          aria-hidden
                          className="size-3.5 shrink-0 text-muted-foreground"
                        />
                        <span className="truncate">{reservation.studentName}</span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex min-w-0 items-center justify-end gap-1.5">
                        <span
                          aria-hidden
                          className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[reservation.status]}`}
                        />
                        <span className="truncate">{statusT(reservation.status)}</span>
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="flex min-w-0 flex-col divide-y divide-border sm:hidden">
            {items.map((reservation) => (
              <li key={reservation.id} className="min-w-0 py-3 first:pt-0">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                    <MapPin aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      {reservation.roomName || detailT("roomFallback")}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      aria-hidden
                      className={`size-1.5 rounded-full ${STATUS_DOT[reservation.status]}`}
                    />
                    {statusT(reservation.status)}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-muted-foreground tabular-nums">
                  <Clock3 aria-hidden className="size-3.5 shrink-0" />
                  <span className="min-w-0 truncate">
                    {sort === "sequence"
                      ? `${formatApiTimestamp(dateFormatter, reservation.startTime)} · `
                      : null}
                    {formatApiTimestamp(timeFormatter, reservation.startTime)} –{" "}
                    {formatApiTimestamp(timeFormatter, reservation.endTime)}
                  </span>
                </p>
                <p className="mt-1 text-sm break-words">
                  {reservation.reason || detailT("reasonFallback")}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <UserRound aria-hidden className="size-3 shrink-0" />
                    <span className="truncate">{reservation.studentName}</span>
                  </span>
                  {reservation.className ? (
                    <span className="truncate">{reservation.className}</span>
                  ) : null}
                  {reservation.purposeType ? (
                    <span>{detailT(PURPOSE_LABEL[reservation.purposeType])}</span>
                  ) : null}
                  {reservation.needsMultimedia ? (
                    <span className="flex items-center gap-1">
                      <Monitor aria-hidden className="size-3" />
                      {detailT("multimedia")}
                    </span>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
