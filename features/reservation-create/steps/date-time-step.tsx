import { useEffect, useMemo, useState } from "react"
import { enUS, zhCN } from "date-fns/locale"
import { useLocale, useTranslations } from "next-intl"
import { RefreshCw } from "lucide-react"
import { useController, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  dateToFormValue,
  formValueToDate,
} from "@/features/reservation-create/date-utils"
import { StepLayout } from "@/features/reservation-create/step-layout"
import { availableDurations } from "@/features/reservation-create/time-options"
import type { ReservationFormValues } from "@/features/reservation-create/schema"
import { ApiError } from "@/lib/api/client"
import { getAvailability } from "@/lib/api/reservations"
import type { AvailabilityData, Room } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const calendarLocales = { "zh-CN": zhCN, "en-US": enUS } as const

export function DateTimeStep({ rooms }: { rooms: Room[] }) {
  const t = useTranslations("booking")
  const locale = useLocale()
  const { control } = useFormContext<ReservationFormValues>()
  const { field: roomField } = useController({ control, name: "room" })
  const { field: dateField, fieldState: dateFieldState } = useController({
    control,
    name: "date",
  })
  const { field: startField, fieldState: startFieldState } = useController({
    control,
    name: "startTime",
  })
  const { field: endField, fieldState: endFieldState } = useController({
    control,
    name: "endTime",
  })
  const room = roomField.value,
    date = dateField.value,
    startTime = startField.value,
    endTime = endField.value
  const roomData = rooms.find((item) => item.id === room)
  const [availability, setAvailability] = useState<AvailabilityData>(),
    [error, setError] = useState<string>(),
    [loading, setLoading] = useState(false)
  const today = new Date(),
    maximum = new Date()
  maximum.setDate(maximum.getDate() + 30)
  async function load() {
    if (!date) return
    setLoading(true)
    setError(undefined)
    try {
      setAvailability(await getAvailability(room, date, roomData))
    } catch (loadError) {
      setError(
        loadError instanceof ApiError
          ? loadError.message
          : t("availabilityError")
      )
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (!date) return
    let active = true
    Promise.resolve()
      .then(() => {
        if (active) setLoading(true)
        return getAvailability(room, date, roomData)
      })
      .then((data) => {
        if (active) {
          setAvailability(data)
          setError(undefined)
        }
      })
      .catch((loadError) => {
        if (active)
          setError(
            loadError instanceof ApiError
              ? loadError.message
              : t("availabilityError")
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [date, room, roomData, t])
  const durations = useMemo(
    () =>
      availability && startTime
        ? availableDurations(availability.slots, startTime, 120, 15)
        : [],
    [availability, startTime]
  )
  const timeLabel = (value: number) =>
    new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(value * 1000))
  return (
    <StepLayout
      step={3}
      title={`${t("dateTitle")} · ${t("timeTitle")}`}
      error={
        error ??
        dateFieldState.error?.message ??
        startFieldState.error?.message ??
        endFieldState.error?.message
      }
    >
      <div className="w-fit border-y py-5">
        <Calendar
          mode="single"
          locale={
            calendarLocales[locale as keyof typeof calendarLocales] ?? enUS
          }
          selected={formValueToDate(date)}
          defaultMonth={formValueToDate(date) ?? today}
          startMonth={today}
          endMonth={maximum}
          disabled={{ before: today, after: maximum }}
          onSelect={(selected) => {
            if (!selected) return
            dateField.onChange(dateToFormValue(selected))
            startField.onChange(0)
            endField.onChange(0)
          }}
        />
      </div>
      {date ? (
        <>
          <div className="mt-8 mb-5 flex items-center justify-between border-b pb-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap gap-4">
              <span>● {t("available")}</span>
              <span>○ {t("policy")}</span>
              <span>× {t("occupied")}</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => void load()}
              title={t("refresh")}
            >
              <RefreshCw className={cn(loading && "animate-spin")} />
            </Button>
          </div>
          {loading ? (
            <p className="py-10 text-sm text-muted-foreground">
              {t("checking")}
            </p>
          ) : null}
          {!loading && availability ? (
            <div
              className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8"
              role="radiogroup"
              aria-label={t("timeTitle")}
              aria-invalid={startFieldState.invalid || undefined}
              onBlur={startField.onBlur}
            >
              {availability.slots.map((slot) => (
                <Button
                  type="button"
                  role="radio"
                  name={startField.name}
                  key={slot.startTime}
                  disabled={slot.status !== "available"}
                  aria-checked={slot.startTime === startTime}
                  variant={slot.startTime === startTime ? "default" : "outline"}
                  onClick={() => {
                    startField.onChange(slot.startTime)
                    endField.onChange(0)
                  }}
                  className={cn(
                    "h-11",
                    slot.status !== "available" &&
                      "bg-muted text-muted-foreground"
                  )}
                >
                  {timeLabel(slot.startTime)}
                </Button>
              ))}
            </div>
          ) : null}
          {startTime ? (
            <div className="mt-8 border-t pt-6">
              <h2 className="mb-3 text-sm font-semibold">{t("duration")}</h2>
              <div
                className="flex flex-wrap gap-2"
                role="radiogroup"
                aria-label={t("duration")}
                aria-invalid={endFieldState.invalid || undefined}
                onBlur={endField.onBlur}
              >
                {durations.map((minutes) => (
                  <Button
                    role="radio"
                    aria-checked={endTime === startTime + minutes * 60}
                    name={endField.name}
                    key={minutes}
                    type="button"
                    variant={
                      endTime === startTime + minutes * 60
                        ? "default"
                        : "outline"
                    }
                    onClick={() => endField.onChange(startTime + minutes * 60)}
                  >
                    {minutes < 60
                      ? t("minutes", { count: minutes })
                      : t("hours", { count: minutes / 60 })}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </StepLayout>
  )
}
