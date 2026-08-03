import { useCallback, useEffect, useRef, useState } from "react"

import { getAvailability } from "@/lib/api/reservations"
import type { AvailabilityData, Room } from "@/lib/api/types"
import { getErrorMessage } from "@/lib/api/client"

export function useRoomAvailability({
  room,
  date,
  fallbackError,
}: {
  room?: Room
  date: string
  fallbackError: string
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
    setLoading(true)
    setError(undefined)

    try {
      const nextAvailability = await getAvailability(room.id, date, room)
      if (requestId.current === currentRequest) {
        setAvailability(nextAvailability)
      }
    } catch (loadError) {
      if (requestId.current !== currentRequest) return
      setAvailability(undefined)
      setError(getErrorMessage(loadError, fallbackError))
    } finally {
      if (requestId.current === currentRequest) setLoading(false)
    }
  }, [date, fallbackError, room])

  useEffect(() => {
    async function loadInitialAvailability() {
      await loadAvailability()
    }

    void loadInitialAvailability()
    return () => {
      requestId.current += 1
    }
  }, [loadAvailability])

  return {
    availability,
    error,
    loading,
    refresh: loadAvailability,
    clearError: () => setError(undefined),
    reportError: setError,
  }
}
