import { Pencil } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useMemo, type ReactNode } from "react"
import { useFormContext } from "react-hook-form"

import type { ReservationPreflight } from "@/lib/api/reservations"
import type { CatalogData } from "@/lib/api/types"
import { countsTowardDailyLimit, DAILY_RESERVATION_LIMIT } from "@/lib/reservations/availability"

import type { BookingStepId, ReservationFormValues } from "../form"
import { StepLayout } from "../step-layout"

const DETAIL =
  "group grid w-full cursor-pointer grid-cols-[6.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-md py-2.5 text-left transition-colors hover:bg-muted/60 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto]"

function ConfirmRow({
  label,
  editLabel,
  onEdit,
  children,
}: {
  label: string
  editLabel: string
  onEdit: () => void
  children: ReactNode
}) {
  return (
    <button type="button" className={DETAIL} aria-label={editLabel} onClick={onEdit}>
      <span className="text-sm break-words text-muted-foreground">{label}</span>
      <span className="min-w-0 text-sm break-words">{children}</span>
      <Pencil
        aria-hidden
        className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
      />
    </button>
  )
}

export function ReviewStep({
  catalog,
  preflight,
  onEdit,
}: {
  catalog: CatalogData
  preflight?: ReservationPreflight
  onEdit: (step: BookingStepId) => void
}) {
  const t = useTranslations("booking")
  const locale = useLocale()
  const { getValues } = useFormContext<ReservationFormValues>()
  const values = getValues()
  const className = preflight?.student.className
  const roomName = catalog.rooms.find((item) => item.id === values.room)?.name
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        timeZone: "Asia/Shanghai",
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
        timeZone: "Asia/Shanghai",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [locale],
  )
  // Priority accounts bypass the per-email daily reservation limit.
  const dailyCount =
    preflight?.mode === "priority"
      ? 0
      : (preflight?.reservations.filter((reservation) => countsTowardDailyLimit(reservation.status))
          .length ?? 0)

  return (
    <StepLayout title={t("reviewTitle")} description={t("reviewDescription")}>
      <div className="flex min-w-0 flex-col divide-y divide-border">
        {roomName ? (
          <ConfirmRow
            label={t("location")}
            editLabel={t("editSchedule")}
            onEdit={() => onEdit("location")}
          >
            <span className="font-medium break-words">{roomName}</span>
          </ConfirmRow>
        ) : null}
        <ConfirmRow
          label={t("dateTimeTitle")}
          editLabel={t("editSchedule")}
          onEdit={() => onEdit("location")}
        >
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="break-words">
              {dateFormatter.format(new Date(values.startTime * 1000))}
            </span>
            <span className="font-mono text-xs tabular-nums">
              {timeFormatter.format(new Date(values.startTime * 1000))} –{" "}
              {timeFormatter.format(new Date(values.endTime * 1000))}
            </span>
          </span>
        </ConfirmRow>
        <ConfirmRow
          label={t("profileTitle")}
          editLabel={t("editProfile")}
          onEdit={() => onEdit("details")}
        >
          <span className="break-words">
            {[preflight?.student.name, className, values.email].filter(Boolean).join("/")}
          </span>
        </ConfirmRow>
        <ConfirmRow
          label={t("reason")}
          editLabel={t("editProfile")}
          onEdit={() => onEdit("details")}
        >
          <span className="break-words">{values.reason}</span>
        </ConfirmRow>
        <ConfirmRow
          label={t("purpose")}
          editLabel={t("editProfile")}
          onEdit={() => onEdit("details")}
        >
          <span className="break-words">
            {t(`purposeOptions.${values.purposeType}`)}/
            {values.needsMultimedia ? t("multimedia") : t("noMultimedia")}
          </span>
        </ConfirmRow>
      </div>
      {dailyCount > 0 ? (
        <p className="mt-5 text-sm">
          {t("dailyReservationCount", { count: dailyCount, limit: DAILY_RESERVATION_LIMIT })}
        </p>
      ) : null}
      {dailyCount >= DAILY_RESERVATION_LIMIT ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {t("dailyReservationLimit", { limit: DAILY_RESERVATION_LIMIT })}
        </p>
      ) : null}
      <p className="mt-4 text-xs break-words text-muted-foreground">{t("reviewEmailNote")}</p>
      <p className="mt-2 text-xs break-words text-muted-foreground">{t("reviewValidationNote")}</p>
    </StepLayout>
  )
}
