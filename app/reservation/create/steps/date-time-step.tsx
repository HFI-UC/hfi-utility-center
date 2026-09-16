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

import { Button } from "@/components/astryx"
import { Calendar } from "@/components/astryx"
import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/astryx"
import { Spinner } from "@/components/astryx"
import { dateToInputValue, inputValueToDate } from "@/lib/date-time"
import type { Room } from "@/lib/api/types"
import { rangeIsAvailable } from "@/lib/reservations/availability"

import type { ReservationFormValues } from "../form"
import { StepLayout } from "../step-layout"
import {
  buildTimeOptions,
  timeCanBeSelected,
  timeIsSelected,
  timeShouldBeVisible,
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
  const visibleTimeOptions = useMemo(() => {
    if (!availability) return []

    return timeOptions.filter((option) =>
      timeShouldBeVisible({
        option,
        slots: availability.slots,
        startTime,
        endTime,
      })
    )
  }, [availability, endTime, startTime, timeOptions])

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
      <div className="datetime-card">
        <div className="datetime-card__calendar">
          <Controller
            control={control}
            name="date"
            render={({ field, fieldState }) => (
              <FieldSet className="gap-4" data-invalid={fieldState.invalid}>
                <div className="panel-heading">
                  <span className="panel-heading__accent" />
                  <div>
                    <FieldLegend variant="label">{t("dateTitle")}</FieldLegend>
                    <FieldDescription>{t("dateDescription")}</FieldDescription>
                  </div>
                </div>
                <FieldGroup>
                  <Calendar
                    className="booking-calendar"
                    classNames={{
                      month: "booking-calendar__month",
                      month_caption: "booking-calendar__caption",
                      caption_label: "booking-calendar__caption-label",
                      nav: "booking-calendar__nav",
                      button_previous: "booking-calendar__previous",
                      button_next: "booking-calendar__next",
                      month_grid: "booking-calendar__grid",
                      weekdays: "booking-calendar__weekdays",
                      weekday: "booking-calendar__weekday",
                      week: "booking-calendar__week",
                      day: "booking-calendar__day",
                      day_button: "booking-calendar__day-button",
                      selected: "booking-calendar__selected",
                      outside: "booking-calendar__outside",
                      disabled: "booking-calendar__disabled",
                      today: "booking-calendar__today",
                    }}
                    mode="single"
                    showOutsideDays
                    locale={locale === "zh-CN" ? zhCN : enUS}
                    selected={inputValueToDate(field.value)}
                    defaultMonth={inputValueToDate(field.value) ?? today}
                    startMonth={today}
                    endMonth={maximumDate}
                    disabled={{ before: today, after: maximumDate }}
                    aria-invalid={fieldState.invalid}
                    onSelect={(selected) =>
                      selectDate(selected, field.onChange)
                    }
                  />
                </FieldGroup>
                <FieldError errors={[fieldState.error]} />
              </FieldSet>
            )}
          />
        </div>

        <div className="datetime-card__divider" />

        {date ? (
          <FieldSet
            className="datetime-card__time min-w-0 gap-4"
            data-invalid={startTimeState.invalid || endTimeState.invalid}
          >
            <div className="panel-heading datetime-panel-heading">
              <span className="panel-heading__accent" />
              <div>
                <FieldLegend variant="label">{t("timeRange")}</FieldLegend>
                <FieldDescription>{selectedRangeLabel()}</FieldDescription>
              </div>
              <Button
                className="availability-refresh-button"
                type="button"
                variant="ghost"
                size="sm"
                onClick={refresh}
                title={t("refresh")}
                aria-label={t("refresh")}
                disabled={loading}
              >
                {loading ? <Spinner /> : <RefreshCw size={15} />}
              </Button>
            </div>
            <FieldGroup>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Spinner />
                  {t("checking")}
                </div>
              ) : null}

              {availability && !loading ? (
                <>
                  <div className="neo-time-legend" aria-hidden="true">
                    <span>
                      <i className="neo-time-legend__available" />
                      {t("available")}
                    </span>
                    <span>
                      <i className="neo-time-legend__occupied" />
                      {t("occupied")}
                    </span>
                  </div>
                  <div className="neo-time-grid">
                    {visibleTimeOptions.map((option) => {
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
                          aria-label={`${formatTime(option.timestamp)}${option.status === "occupied" && !selectable ? `, ${t("occupied")}` : ""}`}
                          variant={selected ? "default" : "outline"}
                          className={`neo-time-cell ${option.status === "occupied" && !selectable ? "neo-time-cell--occupied" : ""} ${selected ? "neo-time-cell--selected" : ""}`}
                          onClick={() => selectTime(option)}
                        >
                          {formatTime(option.timestamp)}
                        </Button>
                      )
                    })}
                  </div>
                </>
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
