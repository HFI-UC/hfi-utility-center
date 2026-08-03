import type { AvailabilitySlot } from "@/lib/api/types"
import { rangeIsAvailable } from "@/lib/reservations/availability"

export type TimeOption = {
  timestamp: number
  canStartRange: boolean
}

export function buildTimeOptions(slots: AvailabilitySlot[]): TimeOption[] {
  if (!slots.length) return []

  return [
    ...slots.map((slot) => ({
      timestamp: slot.startTime,
      canStartRange: slot.status === "available",
    })),
    {
      timestamp: slots.at(-1)!.endTime,
      canStartRange: false,
    },
  ]
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
  if (!startTime || endTime || option.timestamp <= startTime) {
    return option.canStartRange
  }

  return rangeIsAvailable(slots, startTime, option.timestamp)
}

export function timeIsSelected(
  timestamp: number,
  startTime: number,
  endTime: number
) {
  if (timestamp === startTime) return true
  return Boolean(endTime) && timestamp > startTime && timestamp <= endTime
}
