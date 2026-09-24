import { api } from "@/lib/api/client"
import { inputValueToTimestamp } from "@/lib/date-time"
import { buildLegacyAvailability } from "@/lib/reservations/availability"
import type {
  ApiResponse,
  Reservation,
  ReservationPage,
  ReservationStatus,
  Room,
  PurposeType,
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
  purposeType: PurposeType
  needsMultimedia: boolean
}

export async function getAvailability(
  roomId: number,
  date: string,
  knownRoom?: Room,
  excludedReservationId?: number
) {
  const { data } = await api.get<
    ApiResponse<{
      roomId: number
      date: string
      occupied: Array<{
        startTime: string
        endTime: string
        status: ReservationStatus
      }>
    }>
  >("/reservation/availability", {
    params: {
      roomId,
      date,
      excludeReservationId: excludedReservationId,
    },
  })
  const availability = data.data!
  if (!knownRoom) throw new Error("Room availability is incomplete")

  // Rust returns occupied intervals. For self-service edits we additionally
  // fetch the day's reservations because that endpoint currently has no
  // exclude-reservation parameter.
  if (excludedReservationId) {
    const startTime = inputValueToTimestamp(date)
    const endTime = inputValueToTimestamp(date, true)
    if (startTime === undefined || endTime === undefined) {
      throw new Error("Invalid availability date")
    }
    const firstPage = await getReservations({
      roomId,
      startTime,
      endTime,
      page: 0,
    })
    const pageCount = Math.ceil(firstPage.total / 20)
    const additionalPages = await Promise.all(
      Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
        getReservations({
          roomId,
          startTime,
          endTime,
          page: index + 1,
        })
      )
    )
    return buildLegacyAvailability(
      knownRoom,
      date,
      [
        ...firstPage.reservations,
        ...additionalPages.flatMap((page) => page.reservations),
      ].filter((item) => item.id !== excludedReservationId)
    )
  }

  return buildLegacyAvailability(
    knownRoom,
    date,
    availability.occupied.map((item, index) => ({
      id: index,
      roomId,
      studentName: "",
      email: "",
      reason: "",
      startTime: item.startTime,
      endTime: item.endTime,
      status: item.status,
    }))
  )
}

export async function createReservation(input: CreateReservationInput) {
  const { data } = await api.post<ApiResponse<{ reservationId: number }>>(
    "/reservation/create",
    input
  )
  return data.data!
}

export type ForceReservationInput = CreateReservationInput

export async function forceReservation(input: ForceReservationInput) {
  // Rust activates its priority path through the regular create endpoint when
  // the payload uses an administrator identity and a privileged class.
  const { data } = await api.post<ApiResponse<{ reservationId: number }>>(
    "/reservation/create",
    input
  )
  return data.data!
}

export async function getReservations(params: {
  keyword?: string
  campusId?: number
  roomId?: number
  status?: ReservationStatus
  page?: number
  startTime?: number
  endTime?: number
  purposeType?: PurposeType
  needsMultimedia?: boolean
  sort?: "time" | "sequence"
}) {
  const { data } = await api.get<ApiResponse<ReservationPage>>(
    "/reservation/get",
    { params: { ...params, page: params.page ?? 0 } }
  )
  return data.data!
}

export interface CancellationPreview {
  reservationId: number
  roomId: number
  status: ReservationStatus
  roomName: string
  studentName: string
  reason: string
  startTime: string
  endTime: string
  purposeType?: PurposeType | null
  needsMultimedia: boolean
  editCount: number
  remainingEdits: number
}

export async function previewCancellation(token: string) {
  const { data } = await api.get<ApiResponse<CancellationPreview>>(
    "/reservation/cancel/preview",
    { params: { token }, suppressErrorToast: true }
  )
  if (!data.success || !data.data) {
    throw new Error(
      data.message || "This reservation link is invalid or expired."
    )
  }
  return data.data
}

export async function cancelReservation(token: string) {
  const { data } = await api.post<ApiResponse<unknown>>("/reservation/cancel", {
    token,
  })
  return data.message || "Reservation cancelled."
}

export interface ReservationEditInput {
  room: number
  startTime: number
  endTime: number
  reason: string
  purposeType: PurposeType
  needsMultimedia: boolean
}

export async function modifyReservation(
  token: string,
  input: ReservationEditInput
) {
  const { data } = await api.post<
    ApiResponse<{
      reservationId: number
      editCount: number
      remainingEdits: number
    }>
  >("/reservation/modify", { token, ...input })
  return data.data!
}

export const adminEditReservation = (id: number, input: ReservationEditInput) =>
  api.post("/reservation/admin-edit", { id, ...input })

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
