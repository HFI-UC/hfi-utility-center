import { z } from "zod"

type Translate = (key: string) => string

export function createReservationSchema(t: Translate) {
  return z
    .object({
      classId: z.number().int().positive(t("classTitle")),
      bookingCampusId: z.number().int().nonnegative(),
      room: z.number().int().nonnegative(),
      date: z.string().min(1, t("dateTitle")),
      startTime: z.number().positive(t("timeTitle")),
      endTime: z.number().positive(t("duration")),
      studentName: z.string().trim().min(1, t("name")),
      studentId: z
        .string()
        .trim()
        .regex(/^GJ\d{8}$/, "GJ + 8 digits"),
      email: z.string().trim().email(t("email")),
      reason: z.string().trim().min(1, t("reason")),
      isAgreed: z.boolean().refine(Boolean, t("agree")),
    })
    .superRefine((values, context) => {
      if (!values.room) {
        context.addIssue({
          code: "custom",
          path: ["room"],
          message: t("locationTitle"),
        })
      }
      if (values.room && !values.bookingCampusId) {
        context.addIssue({
          code: "custom",
          path: ["bookingCampusId"],
          message: t("campus"),
        })
      }
    })
}

export type ReservationFormValues = z.infer<
  ReturnType<typeof createReservationSchema>
>

export const stepFields: (keyof ReservationFormValues)[][] = [
  ["classId"],
  ["bookingCampusId", "room"],
  ["date", "startTime", "endTime"],
  ["studentName", "studentId", "email", "reason", "isAgreed"],
  [],
]
