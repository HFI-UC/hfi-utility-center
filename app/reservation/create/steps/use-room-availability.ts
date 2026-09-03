import { useEffect, useState } from "react"

import { getAvailability } from "@/lib/api/reservations"
import type { AvailabilityData, Room } from "@/lib/api/types"
import { buildLegacyAvailability } from "@/lib/reservations/availability"

export function useRoomAvailability({
  room,
  date,
  privileged = false,
}: {
  room?: Room
  date: string
  privileged?: boolean
}) {
  const [availability, setAvailability] = useState<AvailabilityData>()
  const [availabilityIsPrivileged, setAvailabilityIsPrivileged] =
    useState(false)
  const [error, setError] = useState<string>()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!date || !room) return
    let active = true
    const selectedRoom = room

    async function loadAvailability() {
      if (privileged) {
        setAvailability(
          buildLegacyAvailability({ ...selectedRoom, policies: [] }, date, [])
        )
        setAvailabilityIsPrivileged(true)
        return
      }
      const nextAvailability = await getAvailability(
        selectedRoom.id,
        date,
        selectedRoom
      )
      if (active) {
        setAvailability(nextAvailability)
        setAvailabilityIsPrivileged(false)
      }
    }

    loadAvailability()
    return () => {
      active = false
    }
  }, [date, privileged, room])

  async function refresh() {
    if (!date || !room) return
    setRefreshing(true)
    setError(undefined)
    try {
      if (privileged) {
        setAvailability(
          buildLegacyAvailability({ ...room, policies: [] }, date, [])
        )
        setAvailabilityIsPrivileged(true)
      } else {
        setAvailability(await getAvailability(room.id, date, room))
        setAvailabilityIsPrivileged(false)
      }
    } finally {
      setRefreshing(false)
    }
  }

  const currentAvailability =
    availability &&
    availability.roomId === room?.id &&
    availability.date === date &&
    availabilityIsPrivileged === privileged
      ? availability
      : undefined

  return {
    availability: currentAvailability,
    error,
    loading: refreshing || Boolean(room && date && !currentAvailability),
    refresh,
    clearError: () => setError(undefined),
    reportError: setError,
  }
}
