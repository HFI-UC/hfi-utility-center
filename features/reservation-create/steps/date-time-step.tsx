import { useEffect, useMemo, useState } from "react"
import { enUS, zhCN } from "date-fns/locale"
import { useLocale, useTranslations } from "next-intl"
import { RefreshCw } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { dateToFormValue, formValueToDate } from "@/features/reservation-create/date-utils"
import { StepLayout } from "@/features/reservation-create/step-layout"
import { availableDurations } from "@/features/reservation-create/time-options"
import type { ReservationFormValues } from "@/features/reservation-create/schema"
import { ApiError } from "@/lib/api/client"
import { getAvailability } from "@/lib/api/reservations"
import type { AvailabilityData, AvailabilitySlot, Room } from "@/lib/api/types"
import { cn } from "@/lib/utils"

function auditoriumAvailability(date: string): AvailabilityData {
  const slots: AvailabilitySlot[] = []
  const start = new Date(`${date}T08:00:00`)
  for (let index = 0; index < 54; index += 1) {
    const from = new Date(start.getTime() + index * 15 * 60 * 1000)
    const to = new Date(from.getTime() + 15 * 60 * 1000)
    slots.push({ startTime: Math.floor(from.getTime() / 1000), endTime: Math.floor(to.getTime() / 1000), status: to <= new Date() ? "past" : "available" })
  }
  return { roomId: 0, date, slotMinutes: 15, maxDurationMinutes: 120, slots }
}

export function DateTimeStep({ rooms }: { rooms: Room[] }) {
  const t = useTranslations("booking")
  const locale = useLocale()
  const { setValue, watch, formState } = useFormContext<ReservationFormValues>()
  const room = watch("room"), date = watch("date"), special = watch("specialFacility"), startTime = watch("startTime"), endTime = watch("endTime")
  const roomData = rooms.find((item) => item.id === room)
  const [availability, setAvailability] = useState<AvailabilityData>(), [error, setError] = useState<string>(), [loading, setLoading] = useState(false)
  const today = new Date(), maximum = new Date(); maximum.setDate(maximum.getDate() + 30)
  async function load() {
    if (!date) return
    setLoading(true); setError(undefined)
    try { setAvailability(special === "auditorium" ? auditoriumAvailability(date) : await getAvailability(room, date, roomData)) }
    catch (loadError) { setError(loadError instanceof ApiError ? loadError.message : t("availabilityError")) }
    finally { setLoading(false) }
  }
  useEffect(() => {
    if (!date) return
    let active = true
    Promise.resolve().then(() => {
      if (active) setLoading(true)
      return special === "auditorium" ? auditoriumAvailability(date) : getAvailability(room, date, roomData)
    }).then((data) => { if (active) { setAvailability(data); setError(undefined) } })
      .catch((loadError) => { if (active) setError(loadError instanceof ApiError ? loadError.message : t("availabilityError")) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [date, room, roomData, special, t])
  const durations = useMemo(() => availability && startTime ? availableDurations(availability.slots, startTime, 120, 15) : [], [availability, startTime])
  const timeLabel = (value: number) => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value * 1000))
  return <StepLayout eyebrow="03 / 05" title={`${t("dateTitle")} · ${t("timeTitle")}`} description={t("timeDescription")} error={error ?? formState.errors.date?.message ?? formState.errors.startTime?.message ?? formState.errors.endTime?.message}>
    <div className="w-fit border-y py-5">
      <Calendar
        mode="single"
        locale={locale === "zh-CN" ? zhCN : enUS}
        selected={formValueToDate(date)}
        defaultMonth={formValueToDate(date) ?? today}
        startMonth={today}
        endMonth={maximum}
        disabled={{ before: today, after: maximum }}
        onSelect={(selected) => {
          if (!selected) return
          setValue("date", dateToFormValue(selected), { shouldValidate: true })
          setValue("startTime", 0)
          setValue("endTime", 0)
        }}
      />
    </div>
    {date ? <><div className="mb-5 mt-8 flex items-center justify-between border-b pb-3 text-xs text-muted-foreground"><div className="flex flex-wrap gap-4"><span>● {t("available")}</span><span>○ {t("policy")}</span><span>× {t("occupied")}</span></div><Button type="button" variant="ghost" size="icon-sm" onClick={() => void load()} title={t("refresh")}><RefreshCw className={cn(loading && "animate-spin")} /></Button></div>
      {loading ? <p className="py-10 text-sm text-muted-foreground">{t("checking")}</p> : null}
      {!loading && availability ? <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">{availability.slots.map((slot) => <button type="button" key={slot.startTime} disabled={slot.status !== "available"} aria-pressed={slot.startTime === startTime} onClick={() => { setValue("startTime", slot.startTime, { shouldValidate: true }); setValue("endTime", 0) }} className={cn("h-11 rounded-md border text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:bg-muted disabled:text-muted-foreground", slot.status === "available" && "hover:bg-accent", slot.status === "policy" && "bg-muted text-muted-foreground", slot.startTime === startTime && "border-primary bg-primary text-primary-foreground hover:bg-primary/90")}>{timeLabel(slot.startTime)}</button>)}</div> : null}
      {startTime ? <div className="mt-8 border-t pt-6"><h2 className="mb-3 text-sm font-semibold">{t("duration")}</h2><div className="flex flex-wrap gap-2">{durations.map((minutes) => <Button key={minutes} type="button" variant={endTime === startTime + minutes * 60 ? "default" : "outline"} onClick={() => setValue("endTime", startTime + minutes * 60, { shouldValidate: true })}>{minutes < 60 ? t("minutes", { count: minutes }) : t("hours", { count: minutes / 60 })}</Button>)}</div></div> : null}</> : null}
  </StepLayout>
}
