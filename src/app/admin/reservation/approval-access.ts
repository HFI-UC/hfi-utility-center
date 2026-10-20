import type { AdminSession } from "@/lib/api/auth"
import type { Reservation } from "@/lib/api/types"

export interface ApprovalScope {
  role: AdminSession["role"]
  // Undefined means the assigned rooms are unknown. The approval API still
  // rejects a room administrator who is not assigned to the reservation.
  roomIds: ReadonlySet<number> | undefined
}

// Pending and AI-review reservations stay open to every administrator.
// Changing an approved or rejected result is limited to a global administrator
// or a room administrator assigned to that room.
export function canDecideReservation(reservation: Reservation, scope: ApprovalScope) {
  if (reservation.status === "cancelled") return false
  if (reservation.status === "pending" || reservation.status === "ai_reviewing") return true
  if (scope.role === "global" || scope.roomIds === undefined) return true
  return reservation.roomId !== null && scope.roomIds.has(reservation.roomId)
}

export function isReapproval(reservation: Reservation) {
  return reservation.status === "approved" || reservation.status === "rejected"
}
