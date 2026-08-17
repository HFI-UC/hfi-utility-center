import { useEffect, useState } from "react"

import { getAvailability } from "@/lib/api/reservations"
import type { AvailabilityData, Room } from "@/lib/api/types"

export function useRoomAvailability({
  room,
  date,
}: {
  room?: Room
  date: string
}) {
  const [availability, setAvailability] = useState<AvailabilityData>()
  const [error, setError] = useState<string>()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (!date || !room) return
    let active = true
    const selectedRoom = room

    async function loadAvailability() {
      const nextAvailability = await getAvailability(
        selectedRoom.id,
        date,
        selectedRoom
      )
      if (active) setAvailability(nextAvailability)
    }

    loadAvailability()
    return () => {
      active = false
    }
  }, [date, room])

  async function refresh() {
    if (!date || !room) return
    setRefreshing(true)
    setError(undefined)
    try {
      setAvailability(await getAvailability(room.id, date, room))
    } finally {
      setRefreshing(false)
    }
  }

  const currentAvailability =
    availability &&
    availability.roomId === room?.id &&
    availability.date === date
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
