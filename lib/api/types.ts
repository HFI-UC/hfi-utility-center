export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  code?: string
}

export interface Campus {
  id: number
  name: string
  isPrivileged: boolean
  createdAt?: string
}

export interface SchoolClass {
  id: number
  name: string
  campus: number
  createdAt?: string
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
  campus: number
  enabled: boolean
  createdAt?: string
  policies: RoomPolicy[]
}

export interface CatalogData {
  campuses: Campus[]
  classes: SchoolClass[]
  rooms: Room[]
}

export type ReservationStatus =
  "pending" | "approved" | "rejected" | "cancelled"
export type PurposeType = "personal" | "class" | "club"

export interface Reservation {
  id: number
  roomId: number | null
  studentName: string
  studentId?: string
  email: string
  startTime: string
  endTime: string
  className?: string
  roomName?: string
  reason: string
  status: ReservationStatus
  createdAt?: string
  campusName?: string
  latestExecutor?: string
  purposeType?: PurposeType | null
  needsMultimedia?: boolean
  cancelledAt?: string
  editCount?: number
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
}

export interface Announcement {
  id?: number | null
  title: string
  content: string
  enabled: boolean
  updatedAt?: string | null
}
