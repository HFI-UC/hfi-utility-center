export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  code?: string
  validation?: { field?: string; code?: string }
}

export interface Campus {
  id: number
  name: string
  createdAt?: string
  deletedAt?: string | null
  deletedBy?: number | null
}

export interface SchoolClass {
  id: number
  name: string
  campus: number | null
  createdAt?: string
  deletedAt?: string | null
  deletedBy?: number | null
}

export interface RoomPolicy {
  id: number
  roomId: number
  days: number[]
  startTime: number[]
  endTime: number[]
  enabled: boolean
}

export interface CatalogAdminData {
  campuses: Campus[]
  classes: SchoolClass[]
  rooms: Room[]
  admins: Admin[]
}

export interface Room {
  id: number
  name: string
  campus: number | null
  enabled: boolean
  createdAt?: string
  deletedAt?: string | null
  deletedBy?: number | null
  policies: RoomPolicy[]
}

export interface CatalogData {
  campuses: Campus[]
  classes: SchoolClass[]
  rooms: Room[]
}

export type ReservationStatus = "pending" | "ai_reviewing" | "approved" | "rejected" | "cancelled"
export type PurposeType = "personal" | "class" | "club"

export interface Reservation {
  id: number
  roomId: number | null
  studentName: string
  email: string | null
  startTime: string
  endTime: string
  className?: string | null
  roomName?: string | null
  reason: string
  status: ReservationStatus
  createdAt?: string
  campusName?: string | null
  latestExecutor?: string
  purposeType?: PurposeType | null
  needsMultimedia?: boolean
  cancelledAt?: string
  editCount?: number
}

export interface ReservationCreateResult {
  reservationId: number
  mode: "normal" | "priority"
  cancelledCount: number
}

export interface ReservationPage {
  reservations: Reservation[]
  total: number
}

export interface AvailabilitySlot {
  startTime: number
  endTime: number
  status: "available" | "occupied" | "policy" | "past"
}

export interface AvailabilityData {
  roomId: number
  date: string
  slotMinutes: number
  maxDurationMinutes: number
  slots: AvailabilitySlot[]
}

export interface Admin {
  id: number
  name: string
  email: string
  createdAt?: string
  receiveReservationNotifications: boolean
  role: "global" | "room"
}

export interface Announcement {
  id?: number | null
  title: string
  content: string
  enabled: boolean
  updatedAt?: string | null
}
