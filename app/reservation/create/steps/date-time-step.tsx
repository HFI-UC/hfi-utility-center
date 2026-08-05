import { addDays, startOfToday } from "date-fns"
import { useMemo, useState } from "react"
import { enUS, zhCN } from "date-fns/locale"
import { RefreshCw } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Controller, useFormContext, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Spinner } from "@/components/ui/spinner"
import { dateToInputValue, inputValueToDate } from "@/lib/date-time"
import type { Room } from "@/lib/api/types"
import { isRangeAvailable } from "@/lib/reservations/availability"

import type { ReservationFormValues } from "../form"
import { StepLayout } from "../step-layout"
import { useRoomAvailability } from "./use-room-availability"

export function DateTimeStep({ rooms }: { rooms: Room[] }) {
  const t = useTranslations("booking")
  const locale = useLocale()
  const { clearErrors, control, setValue, formState } =
    useFormContext<ReservationFormValues>()
  const [roomId, date, startTime, endTime] = useWatch({
    control,
    name: ["room", "date", "startTime", "endTime"],
  })
  const room = rooms.find((candidate) => candidate.id === roomId)
  const {
    availability,
    error: availabilityError,
    loading,
    refresh,
  } = useRoomAvailability({ room, date })
  const [selectionError, setSelectionError] = useState<string>()
  const today = startOfToday()
  const maximumDate = addDays(today, 30)
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [locale]
  )
  const timeOptions = availability
    ? [
        ...availability.slots.map((slot) => ({
          timestamp: slot.startTime,
          canStartRange: slot.status === "available",
        })),
        {
          timestamp: availability.slots.at(-1)?.endTime ?? 0,
          canStartRange: false,
        },
      ].filter((option) => option.timestamp)
    : []

  const selectedRangeUnavailable =
    availability &&
    startTime &&
    endTime &&
    !isRangeAvailable(availability, startTime, endTime)

  function clearSelectedRange() {
    setValue("startTime", 0)
    setValue("endTime", 0)
    clearErrors(["startTime", "endTime"])
    setSelectionError(undefined)
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
    if (availability && isRangeAvailable(availability, startTime, timestamp)) {
      setValue("endTime", timestamp, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
      clearErrors("endTime")
      setSelectionError(undefined)
      return
    }

    setSelectionError(t("rangeUnavailable"))
  }

  function selectTime(timestamp: number) {
    if (isTimeSelected(timestamp, startTime, endTime)) {
      clearSelectedRange()
      return
    }

    if (!startTime || endTime || timestamp < startTime)
      selectRangeStart(timestamp)
    else selectRangeEnd(timestamp)
  }

  function selectDate(
    selected: Date | undefined,
    onChange: (date: string) => void
  ) {
    if (!selected) return
    setSelectionError(undefined)
    clearSelectedRange()
    onChange(dateToInputValue(selected))
  }

  function formatTime(value: number) {
    return timeFormatter.format(new Date(value * 1000))
  }

  function selectedRangeLabel() {
    if (startTime && endTime) {
      return t("selectedRange", {
        start: formatTime(startTime),
        end: formatTime(endTime),
      })
    }
    return startTime ? t("selectEndHint") : t("selectStartHint")
  }

  const fieldError =
    formState.errors.date?.message ??
    formState.errors.startTime?.message ??
    formState.errors.endTime?.message

  return (
    <StepLayout
      step={3}
      title={`${t("dateTitle")} · ${t("timeTitle")}`}
      error={
        selectionError ??
        (selectedRangeUnavailable ? t("timeConflict") : undefined) ??
        availabilityError ??
        fieldError
      }
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
                  {selectedRangeLabel()}
                </p>
              </div>
              <Button
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
                  const selected = isTimeSelected(
                    option.timestamp,
                    startTime,
                    endTime
                  )
                  const selectable =
                    !startTime || endTime || option.timestamp <= startTime
                      ? option.canStartRange
                      : isRangeAvailable(
                          availability,
                          startTime,
                          option.timestamp
                        )
                  return (
                    <Button
                      key={option.timestamp}
                      disabled={!selectable && !selected}
                      aria-pressed={selected}
                      variant={selected ? "default" : "outline"}
                      onClick={() => selectTime(option.timestamp)}
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

function isTimeSelected(timestamp: number, startTime: number, endTime: number) {
  return (
    timestamp === startTime ||
    (Boolean(endTime) && timestamp > startTime && timestamp <= endTime)
  )
}
