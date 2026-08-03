import { describe, expect, it } from "vitest"

import type { AvailabilitySlot, Reservation, Room } from "@/lib/api/types"
import {
  timeOnInputDateTimestamp,
  weekdayFromInputValue,
} from "@/lib/date-time"
import {
  buildLegacyAvailability,
  rangeIsAvailable,
} from "@/lib/reservations/availability"

const date = "2026-08-04"
const reservation = (overrides: Partial<Reservation>): Reservation => ({
  id: 1,
  studentName: "Student",
  email: "student@example.com",
  startTime: `${date}T10:00:00+08:00`,
  endTime: `${date}T10:30:00+08:00`,
  reason: "Test",
  status: "approved",
  ...overrides,
})

const room: Room = {
  id: 7,
  name: "Maker Space",
  campus: 1,
  enabled: true,
  policies: [
    {
      id: 1,
      roomId: 7,
      days: [weekdayFromInputValue(date)!],
      startTime: [11, 0],
      endTime: [12, 0],
      enabled: true,
    },
  ],
}

describe("buildLegacyAvailability", () => {
  it("classifies past, occupied, policy, and available slots", () => {
    const availability = buildLegacyAvailability(
      room,
      date,
      [
        reservation({}),
        reservation({
          id: 2,
          startTime: `${date}T12:00:00+08:00`,
          endTime: `${date}T12:30:00+08:00`,
          status: "rejected",
        }),
      ],
      new Date(`${date}T09:00:00+08:00`)
    )

    expect(availability.slots).toHaveLength(54)
    expect(availability.slots[0].status).toBe("past")
    expect(slotAt(availability.slots, 10, 0).status).toBe("occupied")
    expect(slotAt(availability.slots, 11, 0).status).toBe("policy")
    expect(slotAt(availability.slots, 12, 0).status).toBe("available")
  })
})

describe("rangeIsAvailable", () => {
  const slots: AvailabilitySlot[] = Array.from({ length: 12 }, (_, index) => ({
    startTime: 1_000 + index * 15 * 60,
    endTime: 1_000 + (index + 1) * 15 * 60,
    status: index === 3 ? "occupied" : "available",
  }))

  it("accepts a contiguous available range", () => {
    expect(rangeIsAvailable(slots, slots[4].startTime, slots[7].endTime)).toBe(
      true
    )
  })

  it("rejects unavailable, incomplete, and overlong ranges", () => {
    expect(rangeIsAvailable(slots, slots[2].startTime, slots[4].endTime)).toBe(
      false
    )
    expect(
      rangeIsAvailable(slots.slice(1), slots[0].startTime, slots[1].endTime)
    ).toBe(false)
    expect(
      rangeIsAvailable(slots, slots[0].startTime, slots[9].endTime, 60)
    ).toBe(false)
  })
})

function slotAt(slots: AvailabilitySlot[], hour: number, minute: number) {
  const timestamp = timeOnInputDateTimestamp(date, [hour, minute])
  const slot = slots.find((candidate) => candidate.startTime === timestamp)
  if (!slot) throw new Error(`Missing slot at ${hour}:${minute}`)
  return slot
}
