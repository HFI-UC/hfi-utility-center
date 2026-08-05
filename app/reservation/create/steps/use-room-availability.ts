import { useCallback, useEffect, useRef, useState } from "react"

import { getAvailability } from "@/lib/api/reservations"
import type { AvailabilityData, Room } from "@/lib/api/types"

export function useRoomAvailability({
  room,
  date,
}: {
  room?: Room
  date: string
}) {
  const requestId = useRef(0)
  const [availability, setAvailability] = useState<AvailabilityData>()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  const loadAvailability = useCallback(async () => {
    if (!date || !room) {
      setAvailability(undefined)
      setError(undefined)
      setLoading(false)
      return
    }

    const currentRequest = ++requestId.current
    setAvailability(undefined)
    setLoading(true)
    setError(undefined)

    try {
      const nextAvailability = await getAvailability(room.id, date, room)
      if (requestId.current !== currentRequest) return
      setAvailability(nextAvailability)
    } catch (error) {
      if (requestId.current === currentRequest) {
        setError(
          error instanceof Error ? error.message : "Unable to load availability"
        )
      }
    } finally {
      if (requestId.current === currentRequest) setLoading(false)
    }
  }, [date, room])

  useEffect(() => {
    async function loadCurrentAvailability() {
      await loadAvailability()
    }

    void loadCurrentAvailability()
    return () => {
      requestId.current += 1
    }
  }, [loadAvailability])

  return {
    availability,
    error,
    loading,
    refresh: loadAvailability,
  }
}
