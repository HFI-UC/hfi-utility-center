import { apiRequest, jsonBody } from "@/lib/api/client"
import type { AvailabilityData, Reservation, ReservationPage, ReservationStatus } from "@/lib/api/types"

export interface CreateReservationInput {
  classId: number
  room: number
  studentName: string
  studentId: string
  email: string
  reason: string
  startTime: number
  endTime: number
  purposeType: "personal" | "class" | "club"
  multimediaRequired: boolean
  multimediaDetails?: string
  locale: "zh-CN" | "en-US"
}

export async function getAvailability(roomId: number, date: string) {
  const response = await apiRequest<AvailabilityData>(
    `/api/v1/availability?roomId=${roomId}&date=${date}`,
  )
  if (!response.data) throw new Error("Availability data is missing")
  return response.data
}

export const createReservation = (input: CreateReservationInput) =>
  apiRequest<{ reservationId: number }>("/api/v1/reservations/create", {
    method: "POST",
    ...jsonBody(input),
  })

export async function getReservations(params: {
  keyword?: string
  roomId?: number
  status?: ReservationStatus
  page?: number
  startTime?: number
  endTime?: number
}) {
  const query = new URLSearchParams()
  if (params.keyword) query.set("keyword", params.keyword)
  if (params.roomId) query.set("roomId", String(params.roomId))
  if (params.status) query.set("status", params.status)
  query.set("page", String(params.page ?? 0))
  if (params.startTime) query.set("startTime", String(params.startTime))
  if (params.endTime) query.set("endTime", String(params.endTime))
  const response = await apiRequest<ReservationPage>(`/api/v1/reservations?${query}`)
  if (!response.data) throw new Error("Reservation data is missing")
  return response.data
}

export const getFutureReservations = async () => {
  const response = await apiRequest<Reservation[]>("/reservation/future")
  return response.data ?? []
}

export const updateReservationApproval = (id: number, approved: boolean, reason?: string) =>
  apiRequest("/reservation/approval", {
    method: "POST",
    ...jsonBody({ id, approved, reason: reason || null }),
  })
