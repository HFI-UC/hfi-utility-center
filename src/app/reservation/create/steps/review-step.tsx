import { Clock3, Mail, MapPin, Monitor, ShieldCheck, UserRound } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useMemo, type ReactNode } from "react"
import { useFormContext } from "react-hook-form"

import { Button } from "@/components/ui/button"
import type { CatalogData } from "@/lib/api/types"

import type { BookingStepId, ReservationFormValues } from "../form"
import { StepLayout } from "../step-layout"

const DETAIL =
  "grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-3 py-2.5 sm:grid-cols-[8.5rem_minmax(0,1fr)]"

function ConfirmRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={DETAIL}>
      <dt className="text-sm break-words text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm break-words">{children}</dd>
    </div>
  )
}

export function ReviewStep({
  catalog,
  onEdit,
}: {
  catalog: CatalogData
  onEdit: (step: BookingStepId) => void
}) {
  const t = useTranslations("booking")
  const locale = useLocale()
  const { getValues } = useFormContext<ReservationFormValues>()
  const values = getValues()
  const campusName = catalog.campuses.find((item) => item.id === values.bookingCampusId)?.name
  const roomName = catalog.rooms.find((item) => item.id === values.room)?.name
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
  const duration = Math.max(0, Math.round((values.endTime - values.startTime) / 60))

  return (
    <StepLayout title={t("reviewTitle")} description={t("reviewDescription")}>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => onEdit("location")}
        >
          {t("editSchedule")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => onEdit("details")}
        >
          {t("editProfile")}
        </Button>
      </div>
      <dl className="flex min-w-0 flex-col divide-y divide-border">
        {roomName ? (
          <ConfirmRow label={t("location")}>
            <span className="flex min-w-0 flex-wrap items-center gap-2">
              <MapPin aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="font-medium break-words">{roomName}</span>
              {campusName ? (
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {campusName}
                </span>
              ) : null}
            </span>
          </ConfirmRow>
        ) : null}
        <ConfirmRow label={t("dateTimeTitle")}>
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <Clock3 aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="break-words">
              {dateFormatter.format(new Date(values.startTime * 1000))}
            </span>
            <span className="font-mono text-xs tabular-nums">
              {timeFormatter.format(new Date(values.startTime * 1000))} –{" "}
              {timeFormatter.format(new Date(values.endTime * 1000))}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("minutes", { count: duration })}
            </span>
          </span>
        </ConfirmRow>
        <ConfirmRow label={t("profileTitle")}>
          <span className="flex min-w-0 items-center gap-1.5">
            <UserRound aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="break-words">{values.email}</span>
          </span>
        </ConfirmRow>
        <ConfirmRow label={t("reason")}>
          <span className="break-words">{values.reason}</span>
        </ConfirmRow>
        <ConfirmRow label={t("purpose")}>
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <Monitor aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="font-medium">{t(`purposeOptions.${values.purposeType}`)}</span>
            <span className="text-xs text-muted-foreground">
              {values.needsMultimedia ? t("multimedia") : t("noMultimedia")}
            </span>
          </span>
        </ConfirmRow>
      </dl>
      <p className="mt-4 flex items-start gap-2 text-xs break-words text-muted-foreground">
        <Mail aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        {t("reviewEmailNote")}
      </p>
      <p className="mt-2 flex items-start gap-2 text-xs break-words text-muted-foreground">
        <ShieldCheck aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        {t("reviewValidationNote")}
      </p>
    </StepLayout>
  )
}
