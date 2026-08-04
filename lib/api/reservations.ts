import { api } from "@/lib/api/client"
import { getRooms } from "@/lib/api/catalog"
import { inputValueToTimestamp } from "@/lib/date-time"
import { buildLegacyAvailability } from "@/lib/reservations/availability"
import type {
  Reservation,
  ApiResponse,
  ReservationPage,
  ReservationStatus,
  Room,
} from "@/lib/api/types"

export interface CreateReservationInput {
  classId: number
  room: number
  studentName: string
  studentId: string
  email: string
  reason: string
  startTime: number
  endTime: number
}

export async function getAvailability(
  roomId: number,
  date: string,
  knownRoom?: Room
) {
  const startTime = inputValueToTimestamp(date)
  const endTime = inputValueToTimestamp(date, true)
  if (startTime === undefined || endTime === undefined) {
    throw new Error("Invalid availability date")
  }
  const [rooms, firstPage] = await Promise.all([
    knownRoom ? Promise.resolve([knownRoom]) : getRooms(),
    getReservations({ roomId, startTime, endTime, page: 0 }),
  ])
  const room = rooms.find((item) => item.id === roomId && item.enabled)
  if (!room) throw new Error("Room is unavailable")
  const reservations = [...firstPage.reservations]
  const pageCount = Math.ceil(firstPage.total / 20)
  const additionalPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      getReservations({ roomId, startTime, endTime, page: index + 1 })
    )
  )
  reservations.push(...additionalPages.flatMap((page) => page.reservations))
  return buildLegacyAvailability(room, date, reservations)
}

export async function createReservation(input: CreateReservationInput) {
  const response = await api.post<ApiResponse<{ reservationId: number }>>(
    "/reservation/create",
    input
  )
  return response.data.data
}

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
  const response = await api.get<ApiResponse<ReservationPage>>(
    `/reservation/get?${query}`
  )
  return response.data.data ?? { reservations: [], total: 0 }
}

export const getFutureReservations = async () => {
  const response = await api.get<ApiResponse<Reservation[]>>(
    "/reservation/future"
  )
  return response.data.data ?? []
}

export const updateReservationApproval = (
  id: number,
  approved: boolean,
  reason?: string
) => api.post("/reservation/approval", { id, approved, reason: reason || null })
