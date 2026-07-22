import { describe, expect, it } from "vitest"
import { reservationDefaults } from "@/features/reservation-create/form-state"
import {
  dateToFormValue,
  formValueToDate,
  timestampForDate,
} from "@/features/reservation-create/date-utils"
import { createReservationSchema } from "@/features/reservation-create/schema"
import { availableDurations } from "@/features/reservation-create/time-options"
import { buildLegacyAvailability } from "@/lib/api/reservations"
import type { Reservation, Room } from "@/lib/api/types"

const reservationSchema = createReservationSchema((key) => key)
const valid = {
  ...reservationDefaults,
  classId: 2,
  bookingCampusId: 3,
  room: 4,
  date: "2026-07-23",
  startTime: 1000,
  endTime: 1900,
  studentName: "Andy",
  studentId: "GJ12345678",
  email: "student.andy2024@gdhfi.com",
  reason: "小组讨论",
  isAgreed: true,
}

describe("预约分步规则", () => {
  it("接受姓名和普通邮箱并拒绝错误学号", () => {
    expect(reservationSchema.safeParse(valid).success).toBe(true)
    expect(
      reservationSchema.safeParse({
        ...valid,
        studentName: "张三",
        email: "student@gdhfi.com",
      }).success
    ).toBe(true)
    expect(
      reservationSchema.safeParse({
        ...valid,
        studentName: "Andy Chen",
        email: "andy@example.com",
      }).success
    ).toBe(true)
    expect(
      reservationSchema.safeParse({ ...valid, studentId: "123" }).success
    ).toBe(false)
    expect(
      reservationSchema.safeParse({ ...valid, email: "not-an-email" }).success
    ).toBe(false)
  })
  it("日历值使用本地日期并能组合 15 分钟时间", () => {
    const date = new Date(2026, 6, 23)
    expect(dateToFormValue(date)).toBe("2026-07-23")
    expect(formValueToDate("2026-07-23")?.getDate()).toBe(23)
    expect(
      new Date(timestampForDate("2026-07-23", "09:15") * 1000).getMinutes()
    ).toBe(15)
  })
})

describe("连续可用时长", () => {
  it("在占用时段处停止并限制两小时", () => {
    const slots = Array.from({ length: 10 }, (_, index) => ({
      startTime: 1000 + index * 900,
      endTime: 1900 + index * 900,
      status: index === 3 ? ("occupied" as const) : ("available" as const),
    }))
    expect(availableDurations(slots, 1000)).toEqual([15, 30, 45])
    expect(
      availableDurations(
        slots.map((slot) => ({ ...slot, status: "available" as const })),
        1000
      )
    ).toHaveLength(8)
  })
})

describe("旧版 API 兼容", () => {
  it("使用旧预约和房间政策生成 15 分钟空闲时段", () => {
    const room = {
      id: 14,
      name: "Meeting Room",
      campus: 1,
      enabled: true,
      policies: [
        {
          id: 1,
          roomId: 14,
          days: [4],
          startTime: [12, 0],
          endTime: [13, 0],
          enabled: true,
        },
      ],
    } satisfies Room
    const reservations = [
      {
        id: 3,
        studentName: "Andy",
        email: "student.andy2024@gdhfi.com",
        startTime: "2026-07-23T09:00:00",
        endTime: "2026-07-23T10:00:00",
        reason: "Meeting",
        status: "approved",
      },
    ] satisfies Reservation[]
    const result = buildLegacyAvailability(
      room,
      "2026-07-23",
      reservations,
      new Date("2026-07-22T00:00:00")
    )
    expect(result.slots).toHaveLength(54)
    expect(
      result.slots.find(
        (slot) => new Date(slot.startTime * 1000).getHours() === 9
      )?.status
    ).toBe("occupied")
    expect(
      result.slots.find(
        (slot) => new Date(slot.startTime * 1000).getHours() === 12
      )?.status
    ).toBe("policy")
  })
})
