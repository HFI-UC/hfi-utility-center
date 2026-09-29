import type { AvailabilityData, AvailabilitySlot, Reservation, Room } from "@/lib/api/types"
import {
  inputValueToTimestamp,
  parseApiTimestamp,
  timeOnInputDateTimestamp,
  weekdayFromInputValue,
} from "@/lib/date-time"

const SLOT_MINUTES = 15
export const MAX_DURATION_MINUTES = 120
export const DAY_START_HOUR = 8
export const DAY_END_HOUR = 21.5

/** Active reservations one email may hold on a single day, including the one being booked. */
export const DAILY_RESERVATION_LIMIT = 2

const INACTIVE_STATUS: Record<string, true> = { rejected: true, cancelled: true }

export function countsTowardDailyLimit(status: string) {
  return !INACTIVE_STATUS[status]
}

function isWithinRoomAvailability(room: Room, date: string, slotStart: number, slotEnd: number) {
  const weekday = weekdayFromInputValue(date)
  if (weekday === undefined) return false

  return room.policies.some((policy) => {
    if (!policy.enabled || !policy.days.includes(weekday)) {
      return false
    }

    const availableStart = timeOnInputDateTimestamp(date, policy.startTime)
    const availableEnd = timeOnInputDateTimestamp(date, policy.endTime)
    if (availableStart === undefined || availableEnd === undefined) return false

    return slotStart >= availableStart && slotEnd <= availableEnd
  })
}

function overlapsReservation(reservations: Reservation[], slotStart: number, slotEnd: number) {
  return reservations.some(
    (reservation) =>
      reservation.status !== "rejected" &&
      reservation.status !== "cancelled" &&
      parseApiTimestamp(reservation.startTime).getTime() / 1000 < slotEnd &&
      parseApiTimestamp(reservation.endTime).getTime() / 1000 > slotStart,
  )
}

function getSlotStatus(
  room: Room,
  date: string,
  reservations: Reservation[],
  slotStart: number,
  slotEnd: number,
  now: Date,
  ignorePolicy: boolean,
): AvailabilitySlot["status"] {
  if (slotEnd <= now.getTime() / 1000) return "past"
  if (!ignorePolicy && !isWithinRoomAvailability(room, date, slotStart, slotEnd)) return "policy"
  if (overlapsReservation(reservations, slotStart, slotEnd)) return "occupied"
  return "available"
}

export function buildLegacyAvailability(
  room: Room,
  date: string,
  reservations: Reservation[],
  now = new Date(),
  options: { ignorePolicy?: boolean; unlimitedDuration?: boolean } = {},
): AvailabilityData {
  const slots: AvailabilitySlot[] = []
  const dayStart = inputValueToTimestamp(date)
  if (dayStart === undefined) throw new Error("Invalid availability date")
  const slotCount = ((DAY_END_HOUR - DAY_START_HOUR) * 60) / SLOT_MINUTES

  for (let index = 0; index < slotCount; index += 1) {
    const slotStart = dayStart + DAY_START_HOUR * 60 * 60 + index * SLOT_MINUTES * 60
    const slotEnd = slotStart + SLOT_MINUTES * 60

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      status: getSlotStatus(
        room,
        date,
        reservations,
        slotStart,
        slotEnd,
        now,
        options.ignorePolicy ?? false,
      ),
    })
  }

  const slotCountMinutes = (DAY_END_HOUR - DAY_START_HOUR) * 60
  return {
    roomId: room.id,
    date,
    slotMinutes: SLOT_MINUTES,
    maxDurationMinutes: options.unlimitedDuration ? slotCountMinutes : MAX_DURATION_MINUTES,
    slots,
  }
}

export function rangeIsAvailable(
  slots: AvailabilitySlot[],
  startTime: number,
  endTime: number,
  maxMinutes = 120,
) {
  if (!startTime || endTime <= startTime) return false
  if (endTime - startTime > maxMinutes * 60) return false

  const selectedSlots = slots.filter(
    (slot) => slot.startTime >= startTime && slot.endTime <= endTime,
  )
  const slotSeconds = SLOT_MINUTES * 60
  const expectedSlotCount = (endTime - startTime) / slotSeconds

  return (
    selectedSlots.length === expectedSlotCount &&
    selectedSlots.every((slot) => slot.status === "available")
  )
}
