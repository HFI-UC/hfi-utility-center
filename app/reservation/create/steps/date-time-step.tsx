import { useEffect, useMemo } from "react"
import { enUS, zhCN } from "date-fns/locale"
import { RefreshCw } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Controller, useFormContext, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Spinner } from "@/components/ui/spinner"
import {
  createAppDateTimeFormatter,
  dateToInputValue,
  inputValueToDate,
} from "@/lib/date-time"
import type { Room } from "@/lib/api/types"
import { rangeIsAvailable } from "@/lib/reservations/availability"

import type { ReservationFormValues } from "../form"
import { StepLayout } from "../step-layout"
import {
  buildTimeOptions,
  timeCanBeSelected,
  timeIsSelected,
  type TimeOption,
} from "./time-options"
import { useRoomAvailability } from "./use-room-availability"

export function DateTimeStep({ rooms }: { rooms: Room[] }) {
  const t = useTranslations("booking")
  const locale = useLocale()
  const { clearErrors, control, getValues, setValue, formState } =
    useFormContext<ReservationFormValues>()
  const [roomId, date, startTime, endTime] = useWatch({
    control,
    name: ["room", "date", "startTime", "endTime"],
  })
  const room = useMemo(
    () => rooms.find((candidate) => candidate.id === roomId),
    [roomId, rooms]
  )
  const { availability, error, loading, refresh, clearError, reportError } =
    useRoomAvailability({
      room,
      date,
      fallbackError: t("availabilityError"),
    })
  const today = useMemo(() => startOfToday(), [])
  const maximumDate = useMemo(() => addDays(today, 30), [today])
  const timeFormatter = useMemo(
    () =>
      createAppDateTimeFormatter(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [locale]
  )
  const timeOptions = useMemo(
    () => buildTimeOptions(availability?.slots ?? []),
    [availability]
  )

  useEffect(() => {
    if (!availability) return
    const selectedRange = getValues()
    if (!selectedRange.startTime || !selectedRange.endTime) return
    if (
      rangeIsAvailable(
        availability.slots,
        selectedRange.startTime,
        selectedRange.endTime
      )
    ) {
      return
    }

    setValue("startTime", 0)
    setValue("endTime", 0)
    reportError(t("timeConflict"))
  }, [availability, getValues, reportError, setValue, t])

  function clearSelectedRange() {
    setValue("startTime", 0)
    setValue("endTime", 0)
    clearErrors(["startTime", "endTime"])
  }

  function selectRangeStart(timestamp: number) {
    setValue("startTime", timestamp, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    })
    setValue("endTime", 0, { shouldDirty: true, shouldValidate: false })
    clearErrors("endTime")
  }

  function selectRangeEnd(timestamp: number) {
    if (
      availability &&
      rangeIsAvailable(availability.slots, startTime, timestamp)
    ) {
      setValue("endTime", timestamp, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
      clearErrors("endTime")
      clearError()
      return
    }

    reportError(t("rangeUnavailable"))
  }

  function selectTime(option: TimeOption) {
    if (timeIsSelected(option.timestamp, startTime, endTime)) {
      clearSelectedRange()
      clearError()
      return
    }

    const startsNewRange =
      !startTime || Boolean(endTime) || option.timestamp < startTime
    if (startsNewRange) selectRangeStart(option.timestamp)
    else selectRangeEnd(option.timestamp)
  }

  function selectDate(
    selected: Date | undefined,
    onChange: (date: string) => void
  ) {
    if (!selected) return
    clearError()
    clearSelectedRange()
    onChange(dateToInputValue(selected))
  }

  function formatTime(value: number) {
    return timeFormatter.format(new Date(value * 1000))
  }

  const fieldError =
    formState.errors.date?.message ??
    formState.errors.startTime?.message ??
    formState.errors.endTime?.message

  return (
    <StepLayout
      step={3}
      title={`${t("dateTitle")} · ${t("timeTitle")}`}
      error={error ?? fieldError}
    >
      <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
        <Controller
          control={control}
          name="date"
          render={({ field, fieldState }) => (
            <Calendar
              mode="single"
              locale={locale === "zh-CN" ? zhCN : enUS}
              selected={inputValueToDate(field.value)}
              defaultMonth={inputValueToDate(field.value) ?? today}
              startMonth={today}
              endMonth={maximumDate}
              disabled={{ before: today, after: maximumDate }}
              aria-invalid={fieldState.invalid}
              onSelect={(selected) => selectDate(selected, field.onChange)}
            />
          )}
        />

        {date ? (
          <section
            className="border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
            aria-labelledby="time-heading"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 id="time-heading" className="text-sm font-semibold">
                  {t("timeRange")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedRangeLabel({
                    startTime,
                    endTime,
                    formatTime,
                    selectedRange: (start, end) =>
                      t("selectedRange", { start, end }),
                    selectEnd: t("selectEndHint"),
                    selectStart: t("selectStartHint"),
                  })}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void refresh()}
                title={t("refresh")}
                disabled={loading}
              >
                {loading ? <Spinner /> : <RefreshCw />}
              </Button>
            </div>

            {loading && !availability ? (
              <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
                <Spinner />
                {t("checking")}
              </div>
            ) : null}

            {availability ? (
              <div
                className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8"
                aria-label={t("timeTitle")}
              >
                {timeOptions.map((option) => {
                  const selected = timeIsSelected(
                    option.timestamp,
                    startTime,
                    endTime
                  )
                  const selectable = timeCanBeSelected({
                    option,
                    slots: availability.slots,
                    startTime,
                    endTime,
                  })
                  return (
                    <Button
                      type="button"
                      key={option.timestamp}
                      disabled={!selectable && !selected}
                      aria-pressed={selected}
                      variant={selected ? "default" : "outline"}
                      onClick={() => selectTime(option)}
                    >
                      {formatTime(option.timestamp)}
                    </Button>
                  )
                })}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </StepLayout>
  )
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function selectedRangeLabel({
  startTime,
  endTime,
  formatTime,
  selectedRange,
  selectEnd,
  selectStart,
}: {
  startTime: number
  endTime: number
  formatTime: (value: number) => string
  selectedRange: (start: string, end: string) => string
  selectEnd: string
  selectStart: string
}) {
  if (startTime && endTime) {
    return selectedRange(formatTime(startTime), formatTime(endTime))
  }
  return startTime ? selectEnd : selectStart
}
