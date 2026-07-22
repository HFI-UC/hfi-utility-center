import type { ReservationFormValues } from "@/features/reservation-create/schema"

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
