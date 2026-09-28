import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import type { Room } from "@/lib/api/types"
import { dateToInputValue, inputValueToDate } from "@/lib/date-time"
import { rangeIsAvailable } from "@/lib/reservations/availability"

import type { ReservationFormValues } from "../form"
import { StepLayout } from "../step-layout"
import { DateRail } from "./date-rail"
import { TimeRangePicker, type ReservationRange } from "./time-range-picker"
import { useRoomAvailability } from "./use-room-availability"

export function DateTimeStep({
  rooms,
  privileged = false,
}: {
  rooms: Room[]
  privileged?: boolean
}) {
  const t = useTranslations("booking")
  const locale = useLocale()
  const { control, setValue, getValues, clearErrors, formState } =
    useFormContext<ReservationFormValues>()
  const [roomId, date, startTime, endTime] = useWatch({
    control,
    name: ["room", "date", "startTime", "endTime"],
  })
  const [calendarOpen, setCalendarOpen] = useState(false)
  const room = rooms.find((item) => item.id === roomId)
  const { availability, error, loading, refresh, reportError } = useRoomAvailability({
    room,
    date,
    privileged,
  })
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maximumDate = addDays(today, privileged ? 3650 : 30)
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    weekday: "short",
  })
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const formatTime = (timestamp: number) => timeFormatter.format(new Date(timestamp * 1000))
  const hasOpenSlot = availability?.slots.some((slot) => slot.status === "available") ?? false

  // A refreshed server response can invalidate an existing selection.
  useEffect(() => {
    const values = getValues()
    if (!availability || !values.startTime) return
    const valid = values.endTime
      ? rangeIsAvailable(
          availability.slots,
          values.startTime,
          values.endTime,
          availability.maxDurationMinutes,
        )
      : availability.slots.some(
          (slot) => slot.startTime === values.startTime && slot.status === "available",
        )
    if (!valid) {
      setValue("startTime", 0)
      setValue("endTime", 0)
      reportError(t("timeConflict"))
    }
  }, [availability, getValues, reportError, setValue, t])

  function changeDate(nextDate: Date) {
    reportError(undefined)
    setValue("date", dateToInputValue(nextDate), { shouldValidate: true })
    setValue("startTime", 0)
    setValue("endTime", 0)
    clearErrors(["startTime", "endTime"])
    setCalendarOpen(false)
  }

  /** The picker decides which edges can move; the form only stores the pair. */
  function applyRange(range: ReservationRange) {
    if (!availability) return
    reportError(undefined)
    clearErrors(["startTime", "endTime"])
    setValue("startTime", range.startTime, { shouldDirty: true })
    setValue("endTime", range.endTime, { shouldDirty: true })
  }

  return (
    <StepLayout title={t("dateTimeTitle")}>
      <Controller
        control={control}
        name="date"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="min-w-0 gap-2">
            <FieldLabel>{t("dateTitle")}</FieldLabel>
            <DateRail
              date={date}
              today={today}
              maximumDate={maximumDate}
              open={calendarOpen}
              onOpenChange={setCalendarOpen}
              onSelect={changeDate}
              triggerRef={field.ref}
            />
            <FieldDescription>
              {date ? dateFormatter.format(inputValueToDate(date)!) : t("dateDescription")}
            </FieldDescription>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {loading ? (
        <output className="block space-y-3">
          <span className="sr-only">{t("checking")}</span>
          <Skeleton className="h-11" />
          <Skeleton className="h-24" />
        </output>
      ) : null}
      {availability && !loading && !hasOpenSlot ? (
        <div className="rounded-lg bg-muted/60 p-4 text-sm">
          <p className="font-medium">{t("noTimes")}</p>
          <p className="mt-1 text-muted-foreground">{t("noTimesHint")}</p>
          {date && date < dateToInputValue(maximumDate) ? (
            <Button
              type="button"
              variant="outline"
              className="mt-3 min-h-11"
              onClick={() => changeDate(addDays(inputValueToDate(date)!, 1))}
            >
              {t("nextDay")}
            </Button>
          ) : null}
        </div>
      ) : null}
      {availability && !loading && hasOpenSlot ? (
        <Controller
          control={control}
          name="startTime"
          render={({ field }) => (
            <TimeRangePicker
              availability={availability}
              startTime={startTime}
              endTime={endTime}
              formatTime={formatTime}
              loading={loading}
              invalid={Boolean(formState.errors.startTime || formState.errors.endTime)}
              errors={[formState.errors.startTime, formState.errors.endTime]}
              startHandleRef={field.ref}
              onStartBlur={field.onBlur}
              onRefresh={refresh}
              onRangeChange={applyRange}
            />
          )}
        />
      ) : null}
    </StepLayout>
  )
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
