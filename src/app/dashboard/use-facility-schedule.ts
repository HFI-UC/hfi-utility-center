"use client"

import { useCallback, useEffect, useState } from "react"

import { getCampuses, getRooms } from "@/lib/api/catalog"
import { getReservations } from "@/lib/api/reservations"
import type { Campus, Reservation, Room } from "@/lib/api/types"
import { parseApiTimestamp } from "@/lib/date-time"

const POLL_MS = 30000
const TICK_MS = 5000
const PAGE_SIZE = 20

// Background-polled schedule and reservation data for the active day.
export function useFacilitySchedule() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [now, setNow] = useState(() => new Date())
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updated, setUpdated] = useState<Date | null>(null)
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setDate(end.getDate() + 1)
      const params = {
        startTime: Math.floor(start.getTime() / 1000),
        endTime: Math.floor(end.getTime() / 1000),
      }
      const [catalog, campusList, first] = await Promise.all([
        getRooms(),
        getCampuses(),
        getReservations({ ...params, page: 0 }),
      ])
      const rest = await Promise.all(
        Array.from({ length: Math.max(0, Math.ceil(first.total / PAGE_SIZE) - 1) }, (_, index) =>
          getReservations({ ...params, page: index + 1 }),
        ),
      )
      setRooms(catalog.filter((room) => room.enabled))
      setCampuses(campusList.filter((campus) => !campus.deletedAt))
      setReservations(
        [...first.reservations, ...rest.flatMap((page) => page.reservations)].sort(
          (a, b) =>
            parseApiTimestamp(a.startTime).getTime() - parseApiTimestamp(b.startTime).getTime(),
        ),
      )
      setUpdated(new Date())
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0)
    const poll = window.setInterval(() => void refresh(), POLL_MS)
    // Update local clock between polls to keep time-dependent statuses current without refetching.
    const tick = window.setInterval(() => setNow(new Date()), TICK_MS)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(poll)
      window.clearInterval(tick)
    }
  }, [refresh])

  return { rooms, campuses, reservations, now, error, loading, updated, refresh }
}
