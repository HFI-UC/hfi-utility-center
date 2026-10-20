import type { AvailabilitySlot } from "@/lib/api/types"
import { rangeIsAvailable } from "@/lib/reservations/availability"

export type TimeOption = {
  timestamp: number
  status: AvailabilitySlot["status"] | "boundary"
  canStartRange: boolean
}

export function buildTimeOptions(slots: AvailabilitySlot[]): TimeOption[] {
  const finalSlot = slots.at(-1)
  if (!finalSlot) return []

  return [
    ...slots.map((slot) => ({
      timestamp: slot.startTime,
      status: slot.status,
      canStartRange: slot.status === "available",
    })),
    {
      timestamp: finalSlot.endTime,
      status: "boundary" as const,
      canStartRange: false,
    },
  ]
}

export function timeShouldBeVisible({
  option,
  slots,
  startTime,
  endTime,
}: {
  option: TimeOption
  slots: AvailabilitySlot[]
  startTime: number
  endTime: number
}) {
  if (option.timestamp === startTime || option.timestamp === endTime) {
    return true
  }

  if (startTime && !endTime) {
    if (option.timestamp <= startTime) return false

    return rangeIsAvailable(slots, startTime, option.timestamp) || option.status === "occupied"
  }

  return option.status === "available" || option.status === "occupied"
}

export function timeCanBeSelected({
  option,
  slots,
  startTime,
  endTime,
}: {
  option: TimeOption
  slots: AvailabilitySlot[]
  startTime: number
  endTime: number
}) {
  if (option.timestamp === startTime || option.timestamp === endTime) {
    return true
  }

  if (startTime && !endTime && option.timestamp > startTime) {
    return rangeIsAvailable(slots, startTime, option.timestamp)
  }

  return option.status === "available" && option.canStartRange
}

export function timeIsSelected(timestamp: number, startTime: number, endTime: number) {
  if (timestamp === startTime) return true
  return Boolean(endTime) && timestamp > startTime && timestamp <= endTime
}
