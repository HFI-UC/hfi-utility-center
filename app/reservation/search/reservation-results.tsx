"use client"

import { useMemo } from "react"
import { useLocale, useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Reservation, ReservationStatus } from "@/lib/api/types"
import {
  backendDateTimeToDate,
  createAppDateTimeFormatter,
} from "@/lib/date-time"

const statusClass: Record<ReservationStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-primary text-primary-foreground",
  rejected: "bg-destructive text-white",
}

export function ReservationResults({
  reservations,
}: {
  reservations: Reservation[]
}) {
  return (
    <>
      <DesktopReservationTable reservations={reservations} />
      <MobileReservationList reservations={reservations} />
    </>
  )
}

function DesktopReservationTable({
  reservations,
}: {
  reservations: Reservation[]
}) {
  const t = useTranslations("searchPage")
  const statusT = useTranslations("status")
  const formatDateTime = useReservationDateFormatter()

  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("id")}</TableHead>
            <TableHead>{t("person")}</TableHead>
            <TableHead>{t("class")}</TableHead>
            <TableHead>{t("room")}</TableHead>
            <TableHead>{t("start")}</TableHead>
            <TableHead>{t("end")}</TableHead>
            <TableHead>{t("reason")}</TableHead>
            <TableHead>{t("status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id} className="align-top">
              <TableCell>#{reservation.id}</TableCell>
              <TableCell>
                <p className="font-medium">{reservation.studentName}</p>
                <p className="mt-1 max-w-48 text-sm break-all text-muted-foreground">
                  {reservation.email}
                </p>
              </TableCell>
              <TableCell>{reservation.className}</TableCell>
              <TableCell>{reservation.roomName}</TableCell>
              <TableCell>{formatDateTime(reservation.startTime)}</TableCell>
              <TableCell>{formatDateTime(reservation.endTime)}</TableCell>
              <TableCell className="max-w-xs whitespace-normal">
                {reservation.reason}
              </TableCell>
              <TableCell>
                <Badge className={statusClass[reservation.status]}>
                  {statusT(reservation.status)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function MobileReservationList({
  reservations,
}: {
  reservations: Reservation[]
}) {
  const t = useTranslations("searchPage")
  const statusT = useTranslations("status")
  const formatDateTime = useReservationDateFormatter()

  return (
    <div className="divide-y md:hidden">
      {reservations.map((reservation) => (
        <article key={reservation.id} className="py-4">
          <header className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">#{reservation.id}</h2>
            <Badge className={statusClass[reservation.status]}>
              {statusT(reservation.status)}
            </Badge>
          </header>
          <dl className="mt-3 grid grid-cols-[5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
            <dt className="text-muted-foreground">{t("class")}</dt>
            <dd className="break-words">{reservation.className}</dd>
            <dt className="text-muted-foreground">{t("room")}</dt>
            <dd className="break-words">{reservation.roomName}</dd>
            <dt className="text-muted-foreground">{t("start")}</dt>
            <dd>{formatDateTime(reservation.startTime)}</dd>
            <dt className="text-muted-foreground">{t("end")}</dt>
            <dd>{formatDateTime(reservation.endTime)}</dd>
            <dt className="text-muted-foreground">{t("person")}</dt>
            <dd className="min-w-0 break-all">
              {reservation.studentName}
              <br />
              <span className="text-muted-foreground">{reservation.email}</span>
            </dd>
            <dt className="text-muted-foreground">{t("reason")}</dt>
            <dd className="break-words">{reservation.reason}</dd>
          </dl>
        </article>
      ))}
    </div>
  )
}

function useReservationDateFormatter() {
  const locale = useLocale()
  const formatter = useMemo(
    () =>
      createAppDateTimeFormatter(locale, {
        dateStyle: "short",
        timeStyle: "short",
      }),
    [locale]
  )
  return (value: string) => formatter.format(backendDateTimeToDate(value))
}
