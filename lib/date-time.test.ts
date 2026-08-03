import { describe, expect, it } from "vitest"

import {
  backendDateTimeToDate,
  dateToInputValue,
  inputValueToDate,
  inputValueToTimestamp,
} from "@/lib/date-time"

describe("date input helpers", () => {
  it("round-trips valid local dates", () => {
    const date = new Date(2026, 1, 3)
    expect(dateToInputValue(date)).toBe("2026-02-03")
    expect(inputValueToDate("2026-02-03")).toEqual(date)
  })

  it("rejects malformed and impossible dates", () => {
    expect(inputValueToDate("2026-2-3")).toBeUndefined()
    expect(inputValueToDate("2026-02-30")).toBeUndefined()
    expect(inputValueToTimestamp("invalid")).toBeUndefined()
  })

  it("returns Hong Kong start and end-of-day timestamps", () => {
    expect(inputValueToTimestamp("2026-08-03")).toBe(
      Math.floor(new Date("2026-08-03T00:00:00+08:00").getTime() / 1000)
    )
    expect(inputValueToTimestamp("2026-08-03", true)).toBe(
      Math.floor(new Date("2026-08-03T23:59:59+08:00").getTime() / 1000)
    )
  })
})

describe("backend date-time parsing", () => {
  it("treats timestamps without an offset as Hong Kong time", () => {
    expect(backendDateTimeToDate("2026-07-25T08:45:00")).toEqual(
      new Date("2026-07-25T08:45:00+08:00")
    )
  })

  it("preserves timestamps that already include a time-zone offset", () => {
    expect(backendDateTimeToDate("2026-07-25T08:45:00Z")).toEqual(
      new Date("2026-07-25T08:45:00Z")
    )
    expect(backendDateTimeToDate("2026-07-25T08:45:00+02:00")).toEqual(
      new Date("2026-07-25T08:45:00+02:00")
    )
  })

  it("rejects impossible timestamps instead of rolling them forward", () => {
    expect(backendDateTimeToDate("2026-02-30T08:45:00").getTime()).toBeNaN()
  })
})
