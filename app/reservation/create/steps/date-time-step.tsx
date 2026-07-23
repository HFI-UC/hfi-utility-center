import { useCallback, useEffect, useMemo, useState } from "react"
import { enUS, zhCN } from "date-fns/locale"
import { RefreshCw } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Controller, useFormContext, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Spinner } from "@/components/ui/spinner"
import {
  dateToFormValue,
  formValueToDate,
  rangeIsAvailable,
  type ReservationFormValues,
} from "../form"
import { StepLayout } from "../step-layout"
import { ApiError } from "@/lib/api/client"
import { getAvailability } from "@/lib/api/reservations"
import type { AvailabilityData, AvailabilitySlot, Room } from "@/lib/api/types"

const calendarLocales = { "zh-CN": zhCN, "en-US": enUS } as const

export function DateTimeStep({ rooms }: { rooms: Room[] }) {
  const t = useTranslations("booking")
  const locale = useLocale()
  const { control, getValues, setValue, formState } =
    useFormContext<ReservationFormValues>()
  const [room, date, startTime, endTime] = useWatch({
    control,
    name: ["room", "date", "startTime", "endTime"],
  })
  const roomData = useMemo(
    () => rooms.find((item) => item.id === room),
    [room, rooms]
  )
  const [availability, setAvailability] = useState<AvailabilityData>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const today = useMemo(() => {
    const value = new Date()
    value.setHours(0, 0, 0, 0)
    return value
  }, [])
  const maximum = useMemo(() => {
    const value = new Date(today)
    value.setDate(value.getDate() + 30)
    return value
  }, [today])

  const loadAvailability = useCallback(async () => {
    if (!date || !roomData) return
    setLoading(true)
    setError(undefined)
    try {
      const next = await getAvailability(room, date, roomData)
      setAvailability(next)
      const current = getValues()
      if (!rangeIsAvailable(next.slots, current.startTime, current.endTime)) {
        if (!current.startTime || !current.endTime) return
        setValue("startTime", 0)
        setValue("endTime", 0)
        setError(t("timeConflict"))
      }
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : t("availabilityError")
      )
    } finally {
      setLoading(false)
    }
  }, [date, getValues, room, roomData, setValue, t])

  useEffect(() => {
    if (!date || !roomData) return
    let ignore = false

    async function loadInitialAvailability() {
      try {
        const next = await getAvailability(room, date, roomData)
        if (!ignore) {
          setAvailability(next)
          setError(undefined)
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof ApiError
              ? loadError.message
              : t("availabilityError")
          )
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    void loadInitialAvailability()
    return () => {
      ignore = true
    }
  }, [date, room, roomData, t])

  function selectSlot(slot: AvailabilitySlot) {
    const choosingStart =
      !startTime || Boolean(endTime) || slot.startTime <= startTime
    if (choosingStart) {
      setValue("startTime", slot.startTime, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
      setValue("endTime", 0, { shouldDirty: true, shouldValidate: true })
      return
    }

    if (
      availability &&
      rangeIsAvailable(availability.slots, startTime, slot.endTime)
    ) {
      setValue("endTime", slot.endTime, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
      setError(undefined)
      return
    }

    setError(t("rangeUnavailable"))
  }

  const timeLabel = (value: number) =>
    new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(value * 1000))

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
      <Controller
        control={control}
        name="date"
        render={({ field, fieldState }) => (
          <Calendar
            mode="single"
            locale={
              calendarLocales[locale as keyof typeof calendarLocales] ?? enUS
            }
            selected={formValueToDate(field.value)}
            defaultMonth={formValueToDate(field.value) ?? today}
            startMonth={today}
            endMonth={maximum}
            disabled={{ before: today, after: maximum }}
            aria-invalid={fieldState.invalid}
            onSelect={(selected) => {
              if (!selected) return
              setLoading(true)
              setAvailability(undefined)
              setError(undefined)
              field.onChange(dateToFormValue(selected))
              setValue("startTime", 0)
              setValue("endTime", 0)
            }}
          />
        )}
      />

      {date ? (
        <section className="mt-8 border-t pt-6" aria-labelledby="time-heading">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 id="time-heading" className="text-sm font-semibold">
                {t("timeRange")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {startTime && endTime
                  ? t("selectedRange", {
                      start: timeLabel(startTime),
                      end: timeLabel(endTime),
                    })
                  : startTime
                    ? t("selectEndHint")
                    : t("selectStartHint")}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => void loadAvailability()}
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
              {availability.slots.map((slot) => {
                const selected =
                  slot.startTime === startTime ||
                  (Boolean(endTime) &&
                    slot.startTime >= startTime &&
                    slot.endTime <= endTime)
                return (
                  <Button
                    type="button"
                    key={slot.startTime}
                    disabled={slot.status !== "available"}
                    aria-pressed={selected}
                    variant={selected ? "default" : "outline"}
                    onClick={() => selectSlot(slot)}
                  >
                    {timeLabel(slot.startTime)}
                  </Button>
                )
              })}
            </div>
          ) : null}
        </section>
      ) : null}
    </StepLayout>
  )
}
