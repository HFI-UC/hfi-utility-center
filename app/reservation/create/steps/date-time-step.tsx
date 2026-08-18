import { useEffect, useMemo } from "react"
import { enUS, zhCN } from "date-fns/locale"
import { RefreshCw } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import {
  Controller,
  useController,
  useFormContext,
  useWatch,
} from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { dateToInputValue, inputValueToDate } from "@/lib/date-time"
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
  const { clearErrors, control, getValues, setValue } =
    useFormContext<ReservationFormValues>()
  const [roomId, date] = useWatch({
    control,
    name: ["room", "date"],
  })
  const { field: startTimeField, fieldState: startTimeState } = useController({
    control,
    name: "startTime",
  })
  const { field: endTimeField, fieldState: endTimeState } = useController({
    control,
    name: "endTime",
  })
  const startTime = startTimeField.value
  const endTime = endTimeField.value
  const room = useMemo(
    () => rooms.find((candidate) => candidate.id === roomId),
    [roomId, rooms]
  )
  const { availability, error, loading, refresh, clearError, reportError } =
    useRoomAvailability({
      room,
      date,
    })
  const today = useMemo(() => startOfToday(), [])
  const maximumDate = useMemo(() => addDays(today, 30), [today])
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
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
    startTimeField.onChange(0)
    endTimeField.onChange(0)
    clearErrors(["startTime", "endTime"])
  }

  function selectRangeStart(timestamp: number) {
    startTimeField.onChange(timestamp)
    endTimeField.onChange(0)
    clearErrors("endTime")
  }

  function selectRangeEnd(timestamp: number) {
    if (
      availability &&
      rangeIsAvailable(availability.slots, startTime, timestamp)
    ) {
      endTimeField.onChange(timestamp)
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

  function selectedRangeLabel() {
    if (startTime && endTime) {
      return t("selectedRange", {
        start: formatTime(startTime),
        end: formatTime(endTime),
      })
    }
    return startTime ? t("selectEndHint") : t("selectStartHint")
  }

  return (
    <StepLayout title={t("dateTimeTitle")} error={error}>
      <div className="grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
        <Controller
          control={control}
          name="date"
          render={({ field, fieldState }) => (
            <FieldSet className="gap-4" data-invalid={fieldState.invalid}>
              <FieldLegend variant="label">{t("dateTitle")}</FieldLegend>
              <FieldDescription>{t("dateDescription")}</FieldDescription>
              <FieldGroup>
                <Calendar
                  className="mx-auto max-w-80 p-0 lg:mx-0 lg:w-fit! lg:max-w-none lg:p-3"
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
              </FieldGroup>
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
        />

        {date ? (
          <FieldSet
            className="relative gap-4"
            data-invalid={startTimeState.invalid || endTimeState.invalid}
          >
            <FieldLegend variant="label">{t("timeRange")}</FieldLegend>
            <Button
              className="absolute -top-2 right-0"
              type="button"
              variant="ghost"
              size="icon"
              onClick={refresh}
              title={t("refresh")}
              disabled={loading}
            >
              {loading ? <Spinner /> : <RefreshCw />}
            </Button>
            <FieldDescription>{selectedRangeLabel()}</FieldDescription>

            <FieldGroup>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner />
                  {t("checking")}
                </div>
              ) : null}

              {availability && !loading ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
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
            </FieldGroup>
            <FieldError errors={[startTimeState.error, endTimeState.error]} />
          </FieldSet>
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
