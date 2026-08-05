import type {
  AvailabilityData,
  AvailabilitySlot,
  Reservation,
  Room,
} from "@/lib/api/types"
import {
  inputValueToTimestamp,
  timeOnInputDateTimestamp,
  weekdayFromInputValue,
} from "@/lib/date-time"

const SLOT_MINUTES = 15
const DAY_START_HOUR = 8
const DAY_END_HOUR = 21.5

function overlapsRoomPolicy(
  room: Room,
  date: string,
  slotStart: number,
  slotEnd: number
) {
  const weekday = weekdayFromInputValue(date)
  if (weekday === undefined) return false

  return room.policies.some((policy) => {
    if (!policy.enabled || !policy.days.includes(weekday)) {
      return false
    }

    const blockedStart = timeOnInputDateTimestamp(date, policy.startTime)
    const blockedEnd = timeOnInputDateTimestamp(date, policy.endTime)
    if (blockedStart === undefined || blockedEnd === undefined) return false

    return blockedStart < slotEnd && blockedEnd > slotStart
  })
}

function overlapsReservation(
  reservations: Reservation[],
  slotStart: number,
  slotEnd: number
) {
  return reservations.some(
    (reservation) =>
      reservation.status !== "rejected" &&
      new Date(reservation.startTime).getTime() / 1000 < slotEnd &&
      new Date(reservation.endTime).getTime() / 1000 > slotStart
  )
}

function getSlotStatus(
  room: Room,
  date: string,
  reservations: Reservation[],
  slotStart: number,
  slotEnd: number,
  now: Date
): AvailabilitySlot["status"] {
  if (slotEnd <= now.getTime() / 1000) return "past"
  if (overlapsReservation(reservations, slotStart, slotEnd)) return "occupied"
  if (overlapsRoomPolicy(room, date, slotStart, slotEnd)) return "policy"
  return "available"
}

export function buildLegacyAvailability(
  room: Room,
  date: string,
  reservations: Reservation[],
  now = new Date()
): AvailabilityData {
  const slots: AvailabilitySlot[] = []
  const dayStart = inputValueToTimestamp(date)
  if (dayStart === undefined) throw new Error("Invalid availability date")
  const slotCount = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES

  for (let index = 0; index < slotCount; index += 1) {
    const slotStart =
      dayStart + DAY_START_HOUR * 60 * 60 + index * SLOT_MINUTES * 60
    const slotEnd = slotStart + SLOT_MINUTES * 60

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      status: getSlotStatus(room, date, reservations, slotStart, slotEnd, now),
    })
  }

  return {
    roomId: room.id,
    date,
    slotMinutes: SLOT_MINUTES,
    maxDurationMinutes: 120,
    slots,
  }
}

export function rangeIsAvailable(
  slots: AvailabilitySlot[],
  startTime: number,
  endTime: number,
  maxMinutes = 120
) {
  if (!startTime || endTime <= startTime) return false
  if (endTime - startTime > maxMinutes * 60) return false

  const selectedSlots = slots.filter(
    (slot) => slot.startTime >= startTime && slot.endTime <= endTime
  )
  const slotSeconds = SLOT_MINUTES * 60
  const expectedSlotCount = (endTime - startTime) / slotSeconds

  return (
    selectedSlots.length === expectedSlotCount &&
    selectedSlots.every((slot) => slot.status === "available")
  )
}
