import type { Campus } from "@/lib/api/types"

// Office is an internal campus and is not offered for public booking.
export function isBookableCampus(campus: Campus) {
  return campus.name.trim().toLowerCase() !== "office"
}
