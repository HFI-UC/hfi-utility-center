import { z } from "zod"

import type { AvailabilitySlot } from "@/lib/api/types"

type Translate = (key: string) => string

export function createReservationSchema(t: Translate) {
  return z.object({
    classId: z.number().int().positive(t("validation.classRequired")),
    bookingCampusId: z.number().int().positive(t("validation.campusRequired")),
    room: z.number().int().positive(t("validation.roomRequired")),
    date: z.string().min(1, t("validation.dateRequired")),
    startTime: z.number().positive(t("validation.startTimeRequired")),
    endTime: z.number().positive(t("validation.endTimeRequired")),
    studentName: z.string().trim().min(1, t("validation.nameRequired")),
    studentId: z
      .string()
      .trim()
      .regex(/^GJ\d{8}$/, t("validation.studentIdFormat")),
    email: z.string().trim().email(t("validation.emailInvalid")),
    reason: z.string().trim().min(1, t("validation.reasonRequired")),
    isAgreed: z.boolean().refine(Boolean, t("validation.agreementRequired")),
  })
}

export type ReservationFormValues = z.infer<
  ReturnType<typeof createReservationSchema>
>

export const reservationDefaults: ReservationFormValues = {
  classId: 0,
  bookingCampusId: 0,
  room: 0,
  date: "",
  startTime: 0,
  endTime: 0,
  studentName: "",
  studentId: "",
  email: "",
  reason: "",
  isAgreed: false,
}

export const stepFields: (keyof ReservationFormValues)[][] = [
  ["classId"],
  ["bookingCampusId", "room"],
  ["date", "startTime", "endTime"],
  ["studentName", "studentId", "email", "reason", "isAgreed"],
  [],
]

export function dateToFormValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function formValueToDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : undefined
}

export function rangeIsAvailable(
  slots: AvailabilitySlot[],
  startTime: number,
  endTime: number,
  maxMinutes = 120
) {
  if (!startTime || endTime <= startTime) return false
  if (endTime - startTime > maxMinutes * 60) return false
  const selected = slots.filter(
    (slot) => slot.startTime >= startTime && slot.endTime <= endTime
  )
  return (
    selected.length === (endTime - startTime) / (15 * 60) &&
    selected.every((slot) => slot.status === "available")
  )
}
