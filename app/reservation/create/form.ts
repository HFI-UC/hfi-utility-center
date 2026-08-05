"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { z } from "zod"

export function useReservationSchema() {
  const t = useTranslations("booking")

  return useMemo(
    () =>
      z.object({
        classId: z.number().int().positive(t("validation.classRequired")),
        bookingCampusId: z
          .number()
          .int()
          .positive(t("validation.campusRequired")),
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
        isAgreed: z
          .boolean()
          .refine(Boolean, t("validation.agreementRequired")),
      }),
    [t]
  )
}

export type ReservationFormValues = z.infer<
  ReturnType<typeof useReservationSchema>
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

export const bookingSteps = [
  { id: "class", fields: ["classId"] },
  { id: "location", fields: ["bookingCampusId", "room"] },
  { id: "dateTime", fields: ["date", "startTime", "endTime"] },
  {
    id: "profile",
    fields: ["studentName", "studentId", "email", "reason", "isAgreed"],
  },
  { id: "review", fields: [] },
] as const satisfies ReadonlyArray<{
  id: string
  fields: ReadonlyArray<keyof ReservationFormValues>
}>

export type BookingStepId = (typeof bookingSteps)[number]["id"]
