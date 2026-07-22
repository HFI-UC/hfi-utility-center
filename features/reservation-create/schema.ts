import { z } from "zod"

type Translate = (key: string) => string

export function createReservationSchema(t: Translate) {
  return z.object({
    classId: z.number().int().positive(t("classTitle")),
    bookingCampusId: z.number().int().nonnegative(),
    room: z.number().int().nonnegative(),
    specialFacility: z.enum(["", "auditorium"]),
    date: z.string().min(1, t("dateTitle")),
    startTime: z.number().positive(t("timeTitle")),
    endTime: z.number().positive(t("duration")),
    studentName: z.string().trim().min(1, t("name")),
    studentId: z.string().trim().regex(/^GJ\d{8}$/, "GJ + 8 digits"),
    email: z.string().trim().email(t("email")).regex(/^[^@\s]+@gdhfi\.com$/i, "@gdhfi.com"),
    purposeType: z.enum(["personal", "class", "club"]),
    attendeeCount: z.number().int().min(1).max(1000),
    multimediaRequired: z.boolean(),
    multimediaDetails: z.string().trim(),
    reason: z.string().trim().min(3, t("reason")),
    isAgreed: z.boolean().refine(Boolean, t("agree")),
    rememberProfile: z.boolean(),
  }).superRefine((values, context) => {
    if (!values.room && values.specialFacility !== "auditorium") {
      context.addIssue({ code: "custom", path: ["room"], message: t("locationTitle") })
    }
    if (values.room && !values.bookingCampusId) {
      context.addIssue({ code: "custom", path: ["bookingCampusId"], message: t("campus") })
    }
    if (values.multimediaRequired && !values.multimediaDetails) {
      context.addIssue({ code: "custom", path: ["multimediaDetails"], message: t("multimediaDetails") })
    }
  })
}

export type ReservationFormValues = z.infer<ReturnType<typeof createReservationSchema>>

export const stepFields: (keyof ReservationFormValues)[][] = [
  ["classId"],
  ["bookingCampusId", "room", "specialFacility"],
  ["date", "startTime", "endTime"],
  ["studentName", "studentId", "email", "purposeType", "multimediaRequired", "multimediaDetails", "reason", "isAgreed"],
  [],
]
