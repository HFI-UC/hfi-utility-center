import type { ReservationFormValues } from "@/features/reservation-create/schema"

export const profileStorageKey = "hfiuc-reservation-profile-v1"

export const reservationDefaults: ReservationFormValues = {
  classId: 0, bookingCampusId: 0, room: 0, date: "", startTime: 0, endTime: 0,
  studentName: "", studentId: "", email: "", reason: "", isAgreed: false, rememberProfile: false,
}

export function storedProfile(values: ReservationFormValues) {
  return { classId: values.classId, studentName: values.studentName, studentId: values.studentId, email: values.email }
}

export function clearAfterLocation(values: ReservationFormValues): ReservationFormValues {
  return { ...values, room: 0, startTime: 0, endTime: 0 }
}

export function clearAfterDate(values: ReservationFormValues): ReservationFormValues {
  return { ...values, startTime: 0, endTime: 0 }
}
