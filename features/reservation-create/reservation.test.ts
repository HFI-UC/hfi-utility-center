import { describe, expect, it } from "vitest"
import { clearAfterDate, clearAfterLocation, reservationDefaults, storedProfile } from "@/features/reservation-create/form-state"
import { dateToFormValue, formValueToDate, timestampForDate } from "@/features/reservation-create/date-utils"
import { createReservationSchema } from "@/features/reservation-create/schema"
import { availableDurations } from "@/features/reservation-create/time-options"
import { buildLegacyAvailability, buildLegacyReason, normalizeLegacyReservation } from "@/lib/api/reservations"
import type { Reservation, Room } from "@/lib/api/types"

const reservationSchema = createReservationSchema((key) => key)
const valid = { ...reservationDefaults, classId: 2, bookingCampusId: 3, room: 4, date: "2026-07-23", startTime: 1000, endTime: 1900, studentName: "Andy", studentId: "GJ12345678", email: "student.andy2024@gdhfi.com", reason: "小组讨论", isAgreed: true }

describe("预约分步规则", () => {
  it("接受匹配的英文名和学校邮箱并拒绝错误学号", () => {
    expect(reservationSchema.safeParse(valid).success).toBe(true)
    expect(reservationSchema.safeParse({ ...valid, studentId: "123" }).success).toBe(false)
  })
  it("拒绝非英文姓名、错误邮箱格式和姓名不匹配", () => {
    expect(reservationSchema.safeParse({ ...valid, studentName: "张三" }).success).toBe(false)
    expect(reservationSchema.safeParse({ ...valid, studentName: "Andy Chen" }).success).toBe(false)
    expect(reservationSchema.safeParse({ ...valid, email: "student.andy@gdhfi.com" }).success).toBe(false)
    expect(reservationSchema.safeParse({ ...valid, email: "student.alex2024@gdhfi.com" }).success).toBe(false)
    expect(reservationSchema.safeParse({ ...valid, studentName: "ANDY" }).success).toBe(true)
  })
  it("仅清除选择变化影响的后续字段", () => {
    expect(clearAfterLocation(valid)).toMatchObject({ room: 0, startTime: 0, endTime: 0, classId: 2 })
    expect(clearAfterDate(valid)).toMatchObject({ startTime: 0, endTime: 0, room: 4 })
  })
  it("本机资料不包含原因、条款和预约地点", () => {
    expect(storedProfile(valid)).toEqual({ classId: 2, studentName: "Andy", studentId: "GJ12345678", email: "student.andy2024@gdhfi.com" })
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

describe("旧版 API 兼容", () => {
  it("把新增需求编码进旧 reason 并可恢复", () => {
    const reason = buildLegacyReason({ reason: "社团排练", purposeType: "club", multimediaRequired: true, multimediaDetails: "Projector" })
    expect(reason).toContain("[Purpose: club]")
    expect(normalizeLegacyReservation({
      id: 1, studentName: "Andy", email: "student.andy2024@gdhfi.com", startTime: "2026-07-23T09:00:00", endTime: "2026-07-23T10:00:00", className: "Aspect", roomName: "511", reason, status: "pending",
    } as Reservation)).toMatchObject({ purposeType: "club", multimediaRequired: true, multimediaDetails: "Projector", reason: "社团排练" })
  })

  it("旧预约缺少新增字段时使用兼容默认值", () => {
    expect(normalizeLegacyReservation({
      id: 2, studentName: "Andy", email: "student.andy2024@gdhfi.com", startTime: "2026-07-23T09:00:00", endTime: "2026-07-23T10:00:00", reason: "小组讨论", status: "approved",
    } as Reservation)).toMatchObject({ purposeType: "personal", multimediaRequired: false, locale: "zh-CN", reason: "小组讨论" })
  })

  it("使用旧预约和房间政策生成 15 分钟空闲时段", () => {
    const room = { id: 14, name: "Meeting Room", campus: 1, enabled: true, policies: [{ id: 1, roomId: 14, days: [4], startTime: [12, 0], endTime: [13, 0], enabled: true }] } satisfies Room
    const reservations = [{ id: 3, studentName: "Andy", email: "student.andy2024@gdhfi.com", startTime: "2026-07-23T09:00:00", endTime: "2026-07-23T10:00:00", reason: "Meeting", status: "approved", purposeType: "personal", multimediaRequired: false, locale: "zh-CN" }] satisfies Reservation[]
    const result = buildLegacyAvailability(room, "2026-07-23", reservations, new Date("2026-07-22T00:00:00"))
    expect(result.slots).toHaveLength(54)
    expect(result.slots.find((slot) => new Date(slot.startTime * 1000).getHours() === 9)?.status).toBe("occupied")
    expect(result.slots.find((slot) => new Date(slot.startTime * 1000).getHours() === 12)?.status).toBe("policy")
  })
})
