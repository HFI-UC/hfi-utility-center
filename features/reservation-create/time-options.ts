import type { AvailabilitySlot } from "@/lib/api/types"

export function availableDurations(slots: AvailabilitySlot[], startTime: number, maxMinutes = 120, slotMinutes = 15) {
  const startIndex = slots.findIndex((slot) => slot.startTime === startTime)
  if (startIndex < 0) return []
  const values: number[] = []
  for (let count = 1; count <= maxMinutes / slotMinutes; count += 1) {
    const slice = slots.slice(startIndex, startIndex + count)
    if (slice.length !== count || slice.some((slot) => slot.status !== "available")) break
    values.push(count * slotMinutes)
  }
  return values
}
