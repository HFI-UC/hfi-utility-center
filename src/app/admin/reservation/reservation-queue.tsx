"use client"

import { Check, MapPin, Search, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { StatusBadge } from "@/components/layout/status-badge"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Reservation, ReservationStatus } from "@/lib/api/types"

import { isReapproval } from "./approval-access"
import { STATUS_FILTERS, type StatusFilter } from "./use-reservation-filter"

const STATUS_DOT: Record<ReservationStatus, string> = {
  pending: "bg-warning",
  ai_reviewing: "bg-info",
  approved: "bg-success",
  rejected: "bg-danger",
  cancelled: "bg-muted-foreground",
}

const STATUS_TEXT: Record<ReservationStatus, string> = {
  pending: "text-warning",
  ai_reviewing: "text-info",
  approved: "text-success",
  rejected: "text-danger",
  cancelled: "text-muted-foreground",
}

const MOBILE_GRID = "grid min-w-0 grid-cols-2 gap-x-4 gap-y-2.5"

interface ReservationFieldData {
  label: string
  value: string
  href?: string
}

export function ReservationFilters({
  query,
  status,
  onQueryChange,
  onStatusChange,
}: {
  query: string
  status: StatusFilter
  onQueryChange: (value: string) => void
  onStatusChange: (value: StatusFilter) => void
}) {
  const t = useTranslations("admin")
  const statusT = useTranslations("status")

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <InputGroup className="w-full">
        <InputGroupInput
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("reservationSearch")}
          aria-label={t("reservationSearch")}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
      <ToggleGroup
        type="single"
        variant="outline"
        value={status}
        onValueChange={(value) => {
          if (value) onStatusChange(value as StatusFilter)
        }}
        aria-label={t("reservationStatusFilter")}
        className="w-full flex-wrap justify-start"
      >
        {STATUS_FILTERS.map((value) => (
          <ToggleGroupItem key={value} value={value} className="h-11 sm:h-8">
            {value === "all" ? t("allStatuses") : statusT(value)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

export function ReservationTable({
  reservations,
  working,
  formatDateTime,
  canDecide,
  onApprove,
  onReject,
}: {
  reservations: Reservation[]
  working: boolean
  formatDateTime: (value: string) => string
  canDecide: (reservation: Reservation) => boolean
  onApprove: (id: number) => void
  onReject: (id: number) => void
}) {
  const t = useTranslations("admin")
  const statusT = useTranslations("status")

  return (
    <div className="hidden min-w-0 sm:block">
      <Table className="min-w-[62rem]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">{t("columnReservation")}</TableHead>
            <TableHead>{t("columnStudent")}</TableHead>
            <TableHead>{t("room")}</TableHead>
            <TableHead>{t("time")}</TableHead>
            <TableHead>{t("reason")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead className="w-32 text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((item) => (
            <TableRow key={item.id}>
              <TableCell>#{item.id}</TableCell>
              <TableCell>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{item.studentName}</span>
                  <ReservationMeta item={item} />
                  {item.email ? (
                    <a
                      href={`mailto:${item.email}`}
                      className="truncate text-xs text-muted-foreground underline underline-offset-4"
                    >
                      {item.email}
                    </a>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="max-w-40">
                {item.roomName ? (
                  <span className="flex min-w-0 items-center gap-1.5">
                    <MapPin aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{item.roomName}</span>
                  </span>
                ) : null}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{formatDateTime(item.startTime)}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(item.endTime)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="max-w-48">
                <span className="line-clamp-2 break-words">{item.reason}</span>
              </TableCell>
              <TableCell>
                {item.status === "pending" || item.status === "ai_reviewing" ? (
                  <StatusBadge tone={item.status === "ai_reviewing" ? "info" : "pending"}>
                    {statusT(item.status)}
                  </StatusBadge>
                ) : (
                  <StatusDot status={item.status} label={statusT(item.status)} />
                )}
              </TableCell>
              <TableCell>
                <ReservationActions
                  reservation={item}
                  working={working}
                  canDecide={canDecide(item)}
                  approveLabel={t("approve")}
                  rejectLabel={t("reject")}
                  onApprove={() => onApprove(item.id)}
                  onReject={() => onReject(item.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ReservationMeta({ item }: { item: Reservation }) {
  const meta = [item.className, item.campusName].filter(Boolean).join(" · ")

  if (!meta) return null

  return <span className="truncate text-xs text-muted-foreground">{meta}</span>
}

export function ReservationList({
  reservations,
  working,
  formatDateTime,
  canDecide,
  onApprove,
  onReject,
}: {
  reservations: Reservation[]
  working: boolean
  formatDateTime: (value: string) => string
  canDecide: (reservation: Reservation) => boolean
  onApprove: (id: number) => void
  onReject: (id: number) => void
}) {
  const t = useTranslations("admin")
  const statusT = useTranslations("status")

  return (
    <ul className="flex min-w-0 flex-col divide-y divide-border sm:hidden">
      {reservations.map((item) => (
        <li key={item.id} className="py-4">
          <ReservationCard
            reservation={item}
            statusLabel={statusT(item.status)}
            formatDateTime={formatDateTime}
            working={working}
            canDecide={canDecide(item)}
            approveLabel={t("approve")}
            rejectLabel={t("reject")}
            studentInformationLabel={t("studentInformation")}
            reservationDetailsLabel={t("reservationDetails")}
            onApprove={() => onApprove(item.id)}
            onReject={() => onReject(item.id)}
            fields={[
              { label: t("name"), value: item.studentName },
              {
                label: t("email"),
                value: item.email ?? "",
                href: item.email ? `mailto:${item.email}` : undefined,
              },
              { label: t("class"), value: item.className ?? "" },
              { label: t("campus"), value: item.campusName ?? "" },
            ].filter((field) => field.value)}
            details={[
              { label: t("room"), value: item.roomName ?? "" },
              { label: t("startTime"), value: formatDateTime(item.startTime) },
              { label: t("endTime"), value: formatDateTime(item.endTime) },
              { label: t("reason"), value: item.reason },
            ].filter((field) => field.value)}
          />
        </li>
      ))}
    </ul>
  )
}

function StatusDot({ status, label }: { status: ReservationStatus; label: string }) {
  return (
    <span className="flex items-center gap-2 text-sm whitespace-nowrap">
      <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${STATUS_DOT[status]}`} />
      <span className={STATUS_TEXT[status]}>{label}</span>
    </span>
  )
}

function ReservationCard({
  reservation,
  statusLabel,
  formatDateTime,
  working,
  canDecide,
  approveLabel,
  rejectLabel,
  studentInformationLabel,
  reservationDetailsLabel,
  fields,
  details,
  onApprove,
  onReject,
}: {
  reservation: Reservation
  statusLabel: string
  formatDateTime: (value: string) => string
  working: boolean
  canDecide: boolean
  approveLabel: string
  rejectLabel: string
  studentInformationLabel: string
  reservationDetailsLabel: string
  fields: ReservationFieldData[]
  details: ReservationFieldData[]
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-medium break-words">
            {formatDateTime(reservation.startTime)}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <span className="shrink-0 tabular-nums">#{reservation.id}</span>
            {reservation.roomName ? (
              <>
                <MapPin aria-hidden className="size-3 shrink-0" />
                <span className="truncate">{reservation.roomName}</span>
              </>
            ) : null}
          </span>
        </div>
        {reservation.status === "pending" || reservation.status === "ai_reviewing" ? (
          <StatusBadge tone={reservation.status === "ai_reviewing" ? "info" : "pending"}>
            {statusLabel}
          </StatusBadge>
        ) : (
          <StatusDot status={reservation.status} label={statusLabel} />
        )}
      </div>
      <div className="min-w-0">
        <h3 className="mb-2 text-xs font-medium text-muted-foreground">
          {studentInformationLabel}
        </h3>
        <dl className={MOBILE_GRID}>
          {fields.map((field) => (
            <ReservationField key={field.label} {...field} />
          ))}
        </dl>
      </div>
      <div className="min-w-0">
        <h3 className="mb-2 text-xs font-medium text-muted-foreground">
          {reservationDetailsLabel}
        </h3>
        <dl className={MOBILE_GRID}>
          {details.map((field) => (
            <ReservationField key={field.label} {...field} />
          ))}
        </dl>
      </div>
      <ReservationActions
        reservation={reservation}
        working={working}
        canDecide={canDecide}
        approveLabel={approveLabel}
        rejectLabel={rejectLabel}
        onApprove={onApprove}
        onReject={onReject}
        stretch
      />
    </div>
  )
}

function ReservationField({ label, value, href }: ReservationFieldData) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium break-words">
        {href ? (
          <a href={href} className="underline underline-offset-4">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function ReservationActions({
  reservation,
  working,
  canDecide,
  approveLabel,
  rejectLabel,
  onApprove,
  onReject,
  stretch = false,
}: {
  reservation: Reservation
  working: boolean
  canDecide: boolean
  approveLabel: string
  rejectLabel: string
  onApprove: () => void
  onReject: () => void
  stretch?: boolean
}) {
  if (!canDecide) return null

  const changing = isReapproval(reservation)
  const showApprove = reservation.status !== "approved"
  const showReject = reservation.status !== "rejected"
  const buttonClass = stretch ? "h-11 flex-1 sm:h-8" : "h-9 sm:h-7"

  return (
    <div className={stretch ? "flex flex-wrap gap-2" : "flex justify-end gap-1"}>
      {showApprove ? (
        <Button
          size={stretch ? "default" : "sm"}
          variant={stretch && !changing ? "outline" : "ghost"}
          className={buttonClass}
          disabled={working}
          onClick={onApprove}
        >
          <Check />
          {approveLabel}
        </Button>
      ) : null}
      {showReject ? (
        <Button
          size={stretch ? "default" : "sm"}
          variant="ghost"
          className={stretch ? "min-h-11 flex-1 sm:h-8" : buttonClass}
          disabled={working}
          onClick={onReject}
        >
          <X />
          {rejectLabel}
        </Button>
      ) : null}
    </div>
  )
}
