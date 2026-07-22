import { describe, expect, it } from "vitest"
import { clearAfterDate, clearAfterLocation, reservationDefaults, storedProfile } from "@/features/reservation-create/form-state"
import { dateToFormValue, formValueToDate, timestampForDate } from "@/features/reservation-create/date-utils"
import { createReservationSchema } from "@/features/reservation-create/schema"
import { availableDurations } from "@/features/reservation-create/time-options"

const reservationSchema = createReservationSchema((key) => key)
const valid = { ...reservationDefaults, classId: 2, bookingCampusId: 3, room: 4, date: "2026-07-23", startTime: 1000, endTime: 1900, studentName: "张三", studentId: "GJ12345678", email: "student@gdhfi.com", reason: "小组讨论", isAgreed: true }

describe("预约分步规则", () => {
  it("接受完整中文预约资料并拒绝错误学号", () => {
    expect(reservationSchema.safeParse(valid).success).toBe(true)
    expect(reservationSchema.safeParse({ ...valid, studentId: "123" }).success).toBe(false)
  })
  it("仅清除选择变化影响的后续字段", () => {
    expect(clearAfterLocation(valid)).toMatchObject({ room: 0, startTime: 0, endTime: 0, classId: 2 })
    expect(clearAfterDate(valid)).toMatchObject({ startTime: 0, endTime: 0, room: 4 })
  })
  it("本机资料不包含原因、条款和预约地点", () => {
    expect(storedProfile(valid)).toEqual({ classId: 2, studentName: "张三", studentId: "GJ12345678", email: "student@gdhfi.com" })
  })
  it("Auditorium 模板人数具有安全默认值", () => {
    expect(reservationDefaults.attendeeCount).toBe(1)
    expect(reservationSchema.safeParse({ ...valid, specialFacility: "auditorium", room: 0, bookingCampusId: 0, attendeeCount: 80 }).success).toBe(true)
  })
  it("日历值使用本地日期并能组合 15 分钟时间", () => {
    const date = new Date(2026, 6, 23)
    expect(dateToFormValue(date)).toBe("2026-07-23")
    expect(formValueToDate("2026-07-23")?.getDate()).toBe(23)
    expect(new Date(timestampForDate("2026-07-23", "09:15") * 1000).getMinutes()).toBe(15)
  })
})

describe("连续可用时长", () => {
  it("在占用时段处停止并限制两小时", () => {
    const slots = Array.from({ length: 10 }, (_, index) => ({ startTime: 1000 + index * 900, endTime: 1900 + index * 900, status: index === 3 ? "occupied" as const : "available" as const }))
    expect(availableDurations(slots, 1000)).toEqual([15, 30, 45])
    expect(availableDurations(slots.map((slot) => ({ ...slot, status: "available" as const })), 1000)).toHaveLength(8)
  })
})
