export interface ApiEnvelope<T> {
  success: boolean
  data?: T
  message?: string
}

export interface Campus {
  id: number
  name: string
  isPrivileged: boolean
}

export interface SchoolClass {
  id: number
  name: string
  campus: number
}

export interface RoomPolicy {
  days: number[]
  enabled: boolean
  startTime: [number, number]
  endTime: [number, number]
}

export interface Room {
  id: number
  name: string
  campus: number
  enabled: boolean
  policies: RoomPolicy[]
}

export interface OccupiedInterval {
  startTime: string
  endTime: string
  status: string
}

export interface Availability {
  roomId: number
  date: string
  occupied: OccupiedInterval[]
}

export interface CreateReservationPayload {
  room: number
  startTime: number
  endTime: number
  studentName: string
  studentId: string
  email: string
  reason: string
  classId: number
  purposeType: 'personal'
  needsMultimedia: boolean
}

export interface CreateReservationResponse {
  reservationId: number
}

export type PanelName =
  | 'classCampus'
  | 'schoolClass'
  | 'campus'
  | 'room'
  | 'date'
  | 'time'
  | 'reason'
  | 'multimedia'

export interface TimeSlot {
  minutes: number
  label: string
  epoch: number
}
