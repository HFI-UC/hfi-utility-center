import { apiRequest, jsonBody } from "@/lib/api/client"
import { getRooms } from "@/lib/api/catalog"
import type { AvailabilityData, AvailabilitySlot, Reservation, ReservationPage, ReservationStatus, Room } from "@/lib/api/types"

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

const purposeLine = /^\[Purpose: (personal|class|club)]$/
const multimediaLine = /^\[Multimedia: (none|required)(?:: (.*))?]$/

export function buildLegacyReason(input: Pick<CreateReservationInput, "reason" | "purposeType" | "multimediaRequired" | "multimediaDetails">) {
  const multimedia = input.multimediaRequired
    ? `[Multimedia: required: ${input.multimediaDetails?.trim() || "unspecified"}]`
    : "[Multimedia: none]"
  return `[Purpose: ${input.purposeType}]\n${multimedia}\n\n${input.reason.trim()}`
}

export function normalizeLegacyReservation(item: Reservation): Reservation {
  const lines = item.reason.split("\n")
  const purpose = purposeLine.exec(lines[0] ?? "")?.[1] as Reservation["purposeType"] | undefined
  const multimedia = multimediaLine.exec(lines[1] ?? "")
  const hasMetadata = Boolean(purpose && multimedia)
  return {
    ...item,
    purposeType: purpose ?? item.purposeType ?? "personal",
    multimediaRequired: multimedia ? multimedia[1] === "required" : (item.multimediaRequired ?? false),
    multimediaDetails: multimedia?.[2] ?? item.multimediaDetails,
    locale: item.locale ?? "zh-CN",
    reason: hasMetadata ? lines.slice(3).join("\n").trim() : item.reason,
  }
}

function overlapsPolicy(room: Room, slotStart: Date, slotEnd: Date) {
  return room.policies.some((policy) => {
    if (!policy.enabled || !policy.days.includes(slotStart.getDay())) return false
    const blockedStart = new Date(slotStart)
    const blockedEnd = new Date(slotStart)
    blockedStart.setHours(policy.startTime[0], policy.startTime[1], 0, 0)
    blockedEnd.setHours(policy.endTime[0], policy.endTime[1], 0, 0)
    return blockedStart < slotEnd && blockedEnd > slotStart
  })
}

export function buildLegacyAvailability(room: Room, date: string, reservations: Reservation[], now = new Date()): AvailabilityData {
  const slots: AvailabilitySlot[] = []
  const dayStart = new Date(`${date}T08:00:00`)
  for (let index = 0; index < 54; index += 1) {
    const slotStart = new Date(dayStart.getTime() + index * 15 * 60 * 1000)
    const slotEnd = new Date(slotStart.getTime() + 15 * 60 * 1000)
    let status: AvailabilitySlot["status"] = "available"
    if (slotEnd <= now) status = "past"
    else if (reservations.some((item) => item.status !== "rejected" && new Date(item.startTime) < slotEnd && new Date(item.endTime) > slotStart)) status = "occupied"
    else if (overlapsPolicy(room, slotStart, slotEnd)) status = "policy"
    slots.push({
      startTime: Math.floor(slotStart.getTime() / 1000),
      endTime: Math.floor(slotEnd.getTime() / 1000),
      status,
    })
  }
  return { roomId: room.id, date, slotMinutes: 15, maxDurationMinutes: 120, slots }
}

export async function getAvailability(roomId: number, date: string, knownRoom?: Room) {
  const startTime = Math.floor(new Date(`${date}T00:00:00`).getTime() / 1000)
  const endTime = Math.floor(new Date(`${date}T23:59:59`).getTime() / 1000)
  const [rooms, firstPage] = await Promise.all([
    knownRoom ? Promise.resolve([knownRoom]) : getRooms(),
    getReservations({ roomId, startTime, endTime, page: 0 }),
  ])
  const room = rooms.find((item) => item.id === roomId && item.enabled)
  if (!room) throw new Error("Room is unavailable")
  const reservations = [...firstPage.reservations]
  const pageCount = Math.min(Math.ceil(firstPage.total / 20), 5)
  for (let page = 1; page < pageCount; page += 1) {
    const nextPage = await getReservations({ roomId, startTime, endTime, page })
    reservations.push(...nextPage.reservations)
  }
  return buildLegacyAvailability(room, date, reservations)
}

export const createReservation = (input: CreateReservationInput) =>
  apiRequest<{ reservationId: number }>("/reservation/create", {
    method: "POST",
    ...jsonBody({
      classId: input.classId,
      room: input.room,
      studentName: input.studentName,
      studentId: input.studentId,
      email: input.email,
      reason: buildLegacyReason(input),
      startTime: input.startTime,
      endTime: input.endTime,
    }),
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
  const response = await apiRequest<ReservationPage>(`/reservation/get?${query}`)
  if (!response.data) throw new Error("Reservation data is missing")
  return {
    ...response.data,
    reservations: response.data.reservations.map(normalizeLegacyReservation),
  }
}

export const getFutureReservations = async () => {
  const response = await apiRequest<Reservation[]>("/reservation/future")
  return (response.data ?? []).map(normalizeLegacyReservation)
}

export const updateReservationApproval = (id: number, approved: boolean, reason?: string) =>
  apiRequest("/reservation/approval", {
    method: "POST",
    ...jsonBody({ id, approved, reason: reason || null }),
  })
