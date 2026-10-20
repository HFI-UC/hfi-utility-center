import type { Campus, Reservation, Room } from "@/lib/api/types"
import { parseApiTimestamp } from "@/lib/date-time"
import { DAY_END_HOUR, DAY_START_HOUR } from "@/lib/reservations/availability"

export type RoomDayStatus = "free" | "in-use" | "pending" | "closed"

export interface DaySegment {
  id: number
  status: "approved" | "pending" | "ai_reviewing"
  left: number
  width: number
}

type BoardStatus = DaySegment["status"]

type BoardBooking = Reservation & { status: BoardStatus }

function isBoardBooking(item: Reservation): item is BoardBooking {
  return item.status === "approved" || item.status === "pending" || item.status === "ai_reviewing"
}

export interface RoomDay {
  room: Room
  campusName?: string
  bookings: Reservation[]
  current: Reservation | null
  next: Reservation | null
  status: RoomDayStatus
  // Start of the next booking when free, otherwise null.
  freeUntil: number | null
  segments: DaySegment[]
  openToday: boolean
}

// Local day window as millisecond timestamps.
export function dayWindow(now: Date) {
  const start = new Date(now)
  start.setHours(Math.floor(DAY_START_HOUR), (DAY_START_HOUR % 1) * 60, 0, 0)
  const end = new Date(now)
  end.setHours(Math.floor(DAY_END_HOUR), (DAY_END_HOUR % 1) * 60, 0, 0)
  return { start: start.getTime(), end: end.getTime() }
}

// Formats a fractional hour (e.g. 21.5) as "21:30".
export function formatDayHour(hour: number) {
  const whole = Math.floor(hour)
  const minutes = Math.round((hour - whole) * 60)
  return `${String(whole).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export function isRoomOpenToday(room: Room, weekday: number) {
  return room.policies.some((policy) => policy.enabled && policy.days.includes(weekday))
}

function coveringBooking(bookings: Reservation[], nowMs: number) {
  for (const item of bookings) {
    const start = parseApiTimestamp(item.startTime).getTime()
    const end = parseApiTimestamp(item.endTime).getTime()
    if (Number.isNaN(start) || Number.isNaN(end)) continue
    if (start <= nowMs && nowMs < end) return item
  }
  return null
}

// Builds daily room schedule models clamped to the active day window.
export function buildRoomDays(
  rooms: Room[],
  reservations: Reservation[],
  campuses: Campus[],
  now: Date,
): RoomDay[] {
  const names = new Map(campuses.map((campus) => [campus.id, campus.name]))
  const grouped = new Map<number, BoardBooking[]>()
  for (const item of reservations) {
    if (item.roomId === null) continue
    if (!isBoardBooking(item)) continue
    const list = grouped.get(item.roomId)
    if (list) list.push(item)
    else grouped.set(item.roomId, [item])
  }
  for (const list of grouped.values()) {
    list.sort(
      (a, b) => parseApiTimestamp(a.startTime).getTime() - parseApiTimestamp(b.startTime).getTime(),
    )
  }

  const nowMs = now.getTime()
  const { start: windowStart, end: windowEnd } = dayWindow(now)
  const span = Math.max(1, windowEnd - windowStart)
  const weekday = now.getDay()

  return rooms.map((room) => {
    const bookings = grouped.get(room.id) ?? []
    // Prefer the approved booking when a pending request overlaps it: the
    // approved one is what actually occupies the room right now.
    const covering =
      coveringBooking(
        [...bookings].sort((a, b) =>
          a.status === b.status ? 0 : a.status === "approved" ? -1 : 1,
        ),
        nowMs,
      ) ?? null
    const next =
      bookings.find((item) => parseApiTimestamp(item.startTime).getTime() > nowMs) ?? null
    const openToday = isRoomOpenToday(room, weekday)
    const status: RoomDayStatus = covering
      ? covering.status === "approved"
        ? "in-use"
        : "pending"
      : !openToday
        ? "closed"
        : "free"

    const segments: DaySegment[] = []
    for (const item of bookings) {
      if (item.status !== "approved" && item.status !== "pending" && item.status !== "ai_reviewing")
        continue
      const start = parseApiTimestamp(item.startTime).getTime()
      const end = parseApiTimestamp(item.endTime).getTime()
      if (Number.isNaN(start) || Number.isNaN(end) || end <= windowStart || start >= windowEnd) {
        continue
      }
      const left = Math.min(100, Math.max(0, ((start - windowStart) / span) * 100))
      const right = Math.min(100, Math.max(0, ((end - windowStart) / span) * 100))
      if (right - left > 0.5) {
        segments.push({ id: item.id, status: item.status, left, width: right - left })
      }
    }

    return {
      room,
      campusName: names.get(room.campus ?? -1),
      bookings,
      current: covering,
      next,
      status,
      freeUntil: covering ? null : next ? parseApiTimestamp(next.startTime).getTime() : windowEnd,
      segments,
      openToday,
    }
  })
}
