import { api, apiData } from "@/lib/api/client"
import { getRooms } from "@/lib/api/catalog"
import { inputValueToTimestamp } from "@/lib/date-time"
import { buildRoomAvailability } from "@/lib/reservations/availability"
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
  const [room, firstPage] = await Promise.all([
    knownRoom
      ? Promise.resolve(knownRoom)
      : getRooms().then((rooms) => rooms.find((item) => item.id === roomId)),
    getReservations({ roomId, startTime, endTime, page: 0 }),
  ])
  if (!room?.enabled) throw new Error("Room is unavailable")

  const pageCount = Math.ceil(firstPage.total / 20)
  const additionalPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      getReservations({ roomId, startTime, endTime, page: index + 1 })
    )
  )
  return buildRoomAvailability(room, date, [
    ...firstPage.reservations,
    ...additionalPages.flatMap((page) => page.reservations),
  ])
}

export async function createReservation(input: CreateReservationInput) {
  const result = apiData(
    await api.post<ApiResponse<{ reservationId: number }>>(
      "/reservation/create",
      input
    )
  )
  if (!Number.isSafeInteger(result.reservationId)) {
    throw new Error("The backend returned an invalid reservation ID.")
  }

  return result.reservationId
}

export async function getReservations(params: {
  keyword?: string
  roomId?: number
  status?: ReservationStatus
  page?: number
  startTime?: number
  endTime?: number
}) {
  return apiData(
    await api.get<ApiResponse<ReservationPage>>("/reservation/get", {
      params: { ...params, page: params.page ?? 0 },
    })
  )
}

export async function getFutureReservations() {
  return apiData(
    await api.get<ApiResponse<Reservation[]>>("/reservation/future")
  )
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
