import { useEffect, useMemo, useState } from "react"
import { RefreshCw } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { StepLayout } from "@/features/reservation-create/step-layout"
import type { ReservationFormValues } from "@/features/reservation-create/schema"
import { ApiError } from "@/lib/api/client"
import { getAvailability } from "@/lib/api/reservations"
import type { AvailabilityData } from "@/lib/api/types"
import { cn } from "@/lib/utils"
import { availableDurations } from "@/features/reservation-create/time-options"

function timeLabel(timestamp: number) {
  return new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(timestamp * 1000))
}

export function TimeStep() {
  const { setValue, watch, formState } = useFormContext<ReservationFormValues>()
  const room = watch("room")
  const date = watch("date")
  const startTime = watch("startTime")
  const endTime = watch("endTime")
  const [availability, setAvailability] = useState<AvailabilityData>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    setError(undefined)
    try {
      setAvailability(await getAvailability(room, date))
    } catch (loadError) {
      setError(loadError instanceof ApiError ? loadError.message : "无法加载可用时间")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    getAvailability(room, date)
      .then((data) => {
        if (!active) return
        setAvailability(data)
        setError(undefined)
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof ApiError ? loadError.message : "无法加载可用时间")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [room, date])

  const durations = useMemo(() => {
    if (!availability || !startTime) return []
    return availableDurations(availability.slots, startTime, availability.maxDurationMinutes, availability.slotMinutes)
  }, [availability, startTime])

  return (
    <StepLayout eyebrow="05 / 07" title="选择时间" description="绿色时段可预约。选择开始时间后，再选择连续时长，最长 2 小时。" error={error ?? formState.errors.startTime?.message ?? formState.errors.endTime?.message}>
      <div className="mb-5 flex items-center justify-between border-b pb-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-4"><span>● 可预约</span><span className="text-amber-600">● 使用规则限制</span><span className="text-muted-foreground">● 已占用或已过期</span></div>
        <Button type="button" variant="ghost" size="icon-sm" onClick={() => void load()} title="刷新时间"><RefreshCw className={cn(loading && "animate-spin")} /></Button>
      </div>
      {loading ? <p className="py-10 text-sm text-muted-foreground">正在检查可用时间…</p> : null}
      {!loading && availability ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
          {availability.slots.map((slot) => (
            <button
              type="button"
              key={slot.startTime}
              disabled={slot.status !== "available"}
              aria-pressed={slot.startTime === startTime}
              onClick={() => {
                setValue("startTime", slot.startTime, { shouldValidate: true })
                setValue("endTime", 0)
              }}
              className={cn(
                "h-11 border text-sm outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
                slot.status === "available" && "border-emerald-600 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30",
                slot.status === "policy" && "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/20",
                slot.startTime === startTime && "bg-foreground text-background hover:bg-foreground dark:text-background",
              )}
            >{timeLabel(slot.startTime)}</button>
          ))}
        </div>
      ) : null}
      {startTime ? (
        <div className="mt-8 border-t pt-6">
          <h2 className="mb-3 text-sm font-semibold">预约时长</h2>
          <div className="flex flex-wrap gap-2">
            {durations.map((minutes) => (
              <Button
                key={minutes}
                type="button"
                variant={endTime === startTime + minutes * 60 ? "default" : "outline"}
                onClick={() => setValue("endTime", startTime + minutes * 60, { shouldValidate: true })}
              >{minutes < 60 ? `${minutes} 分钟` : `${minutes / 60} 小时`}</Button>
            ))}
          </div>
        </div>
      ) : null}
    </StepLayout>
  )
}
