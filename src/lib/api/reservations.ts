import { api } from "@/lib/api/client"
import type {
  ApiResponse,
  Reservation,
  ReservationCreateResult,
  ReservationPage,
  ReservationStatus,
  Room,
  PurposeType,
} from "@/lib/api/types"
import { inputValueToTimestamp } from "@/lib/date-time"
import { buildLegacyAvailability } from "@/lib/reservations/availability"

export interface CreateReservationInput {
  room: number
  email: string
  reason: string
  startTime: number
  endTime: number
  purposeType?: PurposeType
  needsMultimedia?: boolean
}

export interface ReservationPreflight {
  email: string
  date: string
  mode: "normal" | "priority"
  student: {
    name: string
    classId: number | null
    className: string | null
  }
  reservations: Array<{
    id: number
    roomId: number | null
    roomName: string | null
    startTime: string
    endTime: string
    status: ReservationStatus
    purposeType: PurposeType | null
  }>
}

export async function getReservationPreflight(email: string, date: string) {
  const response = await api.get<ApiResponse<ReservationPreflight>>("/reservation/preflight", {
    params: { email, date },
    suppressErrorToast: true,
  })
  if (!response.data.success || !response.data.data) {
    if (response.status === 422 && response.data.validation?.code === "student_not_registered") {
      throw new Error("student_not_registered")
    }
    throw new Error(response.data.message || "Unable to verify this email address.")
  }
  return response.data.data
}

export async function getAvailability(
  roomId: number,
  date: string,
  knownRoom?: Room,
  excludedReservationId?: number,
  options?: { priority?: boolean },
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
        }),
      ),
    )
    return buildLegacyAvailability(
      knownRoom,
      date,
      [...firstPage.reservations, ...additionalPages.flatMap((page) => page.reservations)].filter(
        (item) => item.id !== excludedReservationId,
      ),
    )
  }

  const occupied = availability.occupied.map((item, index) => ({
    id: index,
    roomId,
    studentName: "",
    email: "",
    reason: "",
    startTime: item.startTime,
    endTime: item.endTime,
    status: item.status,
  }))
  // Priority accounts book over pending and approved reservations; those conflicts
  // are resolved on submit. Rejected and cancelled intervals never block anyone.
  if (options?.priority) {
    return buildLegacyAvailability(
      knownRoom,
      date,
      occupied.filter((item) => item.status !== "pending" && item.status !== "approved"),
    )
  }
  return buildLegacyAvailability(knownRoom, date, occupied)
}

export async function createReservation(input: CreateReservationInput) {
  const { data } = await api.post<ApiResponse<ReservationCreateResult>>(
    "/reservation/create",
    input,
  )
  return data.data!
}

export interface PriorityConflict {
  id: number
  studentName: string
  startTime: string
  endTime: string
  status: ReservationStatus
  roomName: string
}

export interface CreateReservationPreview {
  mode: "normal" | "priority"
  conflicts: PriorityConflict[]
  cancelledCount: number
}

export async function previewReservation(input: CreateReservationInput) {
  const { data } = await api.post<ApiResponse<CreateReservationPreview>>("/reservation/create", {
    ...input,
    preview: true,
  })
  return data.data!
}

export async function confirmPriorityReservation(
  input: CreateReservationInput,
  expectedConflictIds: number[] = [],
) {
  const { data } = await api.post<ApiResponse<ReservationCreateResult>>("/reservation/create", {
    ...input,
    confirmPriority: true,
    expectedConflictIds,
  })
  return data.data!
}

export type ReservationQuery = {
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
}

export async function getReservations(params: ReservationQuery) {
  const { data } = await api.get<ApiResponse<ReservationPage>>("/reservation/get", {
    params: { ...params, page: params.page ?? 0 },
  })
  return data.data!
}

export interface CancellationPreview {
  reservationId: number
  roomId: number | null
  status: ReservationStatus
  roomName: string | null
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
  const { data } = await api.get<ApiResponse<CancellationPreview>>("/reservation/cancel/preview", {
    params: { token },
    suppressErrorToast: true,
  })
  if (!data.success || !data.data) {
    throw new Error(data.message || "This reservation link is invalid or expired.")
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
  purposeType?: PurposeType | null
  needsMultimedia?: boolean
}

export async function modifyReservation(token: string, input: ReservationEditInput) {
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

export const unlockAiReview = (id: number, reason: string) =>
  api.post("/reservation/ai-unlock", { id, reason })

export async function getFutureReservations() {
  const response = await api.get<ApiResponse<Reservation[]>>("/reservation/future")
  return response.data.data!
}

export const updateReservationApproval = (id: number, approved: boolean, reason?: string) =>
  api.post("/reservation/approval", {
    id,
    approved,
    reason: reason || null,
  })
