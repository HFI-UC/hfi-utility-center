"use client"

import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { z } from "zod"

export interface ReservationFormValues {
  bookingCampusId: number
  room: number
  date: string
  startTime: number
  endTime: number
  isPrivileged: boolean
  email: string
  reason: string
  purposeType: "personal" | "class" | "club"
  needsMultimedia: boolean
  isAgreed: boolean
}

export function useReservationSchema() {
  const t = useTranslations("booking")

  return useMemo(
    () =>
      z.object({
        bookingCampusId: z.number().int().positive(t("validation.campusRequired")),
        room: z.number().int().positive(t("validation.roomRequired")),
        date: z.string().min(1, t("validation.dateRequired")),
        startTime: z.number().positive(t("validation.startTimeRequired")),
        endTime: z.number().positive(t("validation.endTimeRequired")),
        email: z.string().trim().email(t("validation.emailInvalid")),
        reason: z.string().trim().min(1, t("validation.reasonRequired")),
        isPrivileged: z.boolean(),
        purposeType: z.enum(["personal", "class", "club"]),
        needsMultimedia: z.boolean(),
        isAgreed: z.boolean().refine(Boolean, t("validation.agreementRequired")),
      }),
    [t],
  )
}

export const reservationDefaults: ReservationFormValues = {
  bookingCampusId: 0,
  room: 0,
  date: "",
  startTime: 0,
  endTime: 0,
  email: "",
  reason: "",
  isPrivileged: false,
  purposeType: "personal",
  needsMultimedia: false,
  isAgreed: false,
}

export const bookingSteps = [
  {
    id: "details",
    fields: ["email", "reason", "purposeType", "needsMultimedia", "isAgreed"],
  },
  { id: "location", fields: ["bookingCampusId", "room", "date", "startTime", "endTime"] },
  { id: "review", fields: [] },
] as const satisfies ReadonlyArray<{
  id: string
  fields: ReadonlyArray<keyof ReservationFormValues>
}>

export type BookingStepId = (typeof bookingSteps)[number]["id"]
