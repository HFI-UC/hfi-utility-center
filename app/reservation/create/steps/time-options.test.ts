import { describe, expect, it } from "vitest"

import type { AvailabilitySlot } from "@/lib/api/types"

import {
  buildTimeOptions,
  timeCanBeSelected,
  timeIsSelected,
} from "./time-options"

const slots: AvailabilitySlot[] = [
  {
    startTime: 18 * 3600 + 30 * 60,
    endTime: 18 * 3600 + 45 * 60,
    status: "available",
  },
  { startTime: 18 * 3600 + 45 * 60, endTime: 19 * 3600, status: "available" },
  { startTime: 19 * 3600, endTime: 19 * 3600 + 15 * 60, status: "occupied" },
]

describe("reservation time options", () => {
  it("uses the clicked time as the end boundary", () => {
    const options = buildTimeOptions(slots)
    const startTime = slots[0].startTime
    const endOption = options.find((option) => option.timestamp === 19 * 3600)!

    expect(
      timeCanBeSelected({
        option: endOption,
        slots,
        startTime,
        endTime: 0,
      })
    ).toBe(true)
    expect(timeIsSelected(endOption.timestamp, startTime, 19 * 3600)).toBe(true)
  })

  it("adds a closing boundary that cannot start a reservation", () => {
    const options = buildTimeOptions(slots)
    expect(options.at(-1)).toEqual({
      timestamp: slots.at(-1)!.endTime,
      canStartRange: false,
    })
  })
})
