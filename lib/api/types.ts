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

export interface RoomApprover {
  id: number
  roomId: number
  adminId: number
  notificationsEnabled: boolean
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
  approvers?: RoomApprover[]
}

export interface BootstrapData {
  schemaVersion: number
  dataVersion: string
  generatedAt: string
  campuses: Campus[]
  classes: SchoolClass[]
  rooms: Room[]
}

export type ReservationStatus = "pending" | "approved" | "rejected"

export interface Reservation {
  id: number
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
}

export interface OverviewAnalytics {
  today: Record<"requests" | "reservations" | "reservationCreations" | "approvals" | "rejections", number>
  weekly: Record<"reservations" | "reservationCreations" | "approvals" | "rejections", number[]>
  monthly: Record<"reservations" | "reservationCreations" | "approvals" | "rejections", number[]>
  daily: Record<"requests" | "reservations" | "reservationCreations" | "approvals" | "rejections", number[]>
}

export interface WeeklyAnalytics {
  rooms: { roomName: string; reservations: number; reservationCreations: number }[]
  totalReservations: number
  totalReservationCreations: number
  totalApprovals: number
  totalRejections: number
  reasons: { word: string; count: number }[]
  hourlyReservations: number[]
  dailyReservations: number[]
  dailyReservationCreations: number[]
}
