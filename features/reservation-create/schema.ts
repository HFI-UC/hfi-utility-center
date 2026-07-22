import { z } from "zod"

type Translate = (key: string) => string

const schoolEmailPattern = /^[^@\s]+\.([A-Za-z]+)(20\d{2})@gdhfi\.com$/i

export function schoolEmailEnglishName(email: string) {
  return schoolEmailPattern.exec(email.trim())?.[1]
}

export function createReservationSchema(t: Translate) {
  return z.object({
    classId: z.number().int().positive(t("classTitle")),
    bookingCampusId: z.number().int().nonnegative(),
    room: z.number().int().nonnegative(),
    specialFacility: z.enum(["", "auditorium"]),
    date: z.string().min(1, t("dateTitle")),
    startTime: z.number().positive(t("timeTitle")),
    endTime: z.number().positive(t("duration")),
    studentName: z.string().trim().regex(/^[A-Za-z]+$/, t("englishNameError")),
    studentId: z.string().trim().regex(/^GJ\d{8}$/, "GJ + 8 digits"),
    email: z.string().trim().regex(schoolEmailPattern, t("schoolEmailError")),
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
    const emailName = schoolEmailEnglishName(values.email)
    if (emailName && emailName.toLowerCase() !== values.studentName.toLowerCase()) {
      context.addIssue({ code: "custom", path: ["email"], message: t("emailNameMismatch") })
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
