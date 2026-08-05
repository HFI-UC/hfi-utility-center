import { api } from "@/lib/api/client"
import { getRooms } from "@/lib/api/catalog"
import { inputValueToTimestamp } from "@/lib/date-time"
import { buildLegacyAvailability } from "@/lib/reservations/availability"
import type {
  ApiResponse,
  Reservation,
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
  const { data } = await api.post<ApiResponse<{ reservationId: number }>>(
    "/reservation/create",
    input
  )
  return data.data!
}

export async function getReservations(params: {
  keyword?: string
  roomId?: number
  status?: ReservationStatus
  page?: number
  startTime?: number
  endTime?: number
}) {
  const { data } = await api.get<ApiResponse<ReservationPage>>(
    "/reservation/get",
    { params: { ...params, page: params.page ?? 0 } }
  )
  return data.data!
}

export async function getFutureReservations() {
  const response = await api.get<ApiResponse<Reservation[]>>(
    "/reservation/future"
  )
  return response.data.data!
}

export const updateReservationApproval = (
  id: number,
  approved: boolean,
  reason?: string
) =>
  api.post("/reservation/approval", {
    id,
    approved,
    reason: reason || null,
  })
