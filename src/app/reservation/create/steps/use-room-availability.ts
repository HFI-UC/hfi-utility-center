"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { getAvailability } from "@/lib/api/reservations"
import type { AvailabilityData, Room } from "@/lib/api/types"

export function useRoomAvailability({
  room,
  date,
  priority = false,
}: {
  room?: Room
  date: string
  priority?: boolean
}) {
  const t = useTranslations("booking")
  const [revision, setRevision] = useState(0)
  const requestKey = `${room?.id}-${date}-${priority}-${revision}`
  const [result, setResult] = useState<{
    key: string
    availability?: AvailabilityData
    error?: string
  }>()
  const [selectionError, reportError] = useState<string>()

  useEffect(() => {
    if (!room || !date) return
    let active = true
    const selectedRoom = room
    async function load() {
      try {
        const availability = await getAvailability(selectedRoom.id, date, selectedRoom, undefined, {
          priority,
        })
        if (active) setResult({ key: requestKey, availability })
      } catch (error) {
        if (active)
          setResult({
            key: requestKey,
            error: error instanceof Error ? error.message : t("availabilityError"),
          })
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [room, date, priority, requestKey, t])

  const current = result?.key === requestKey ? result : undefined
  return {
    availability: current?.availability,
    error: current?.error ?? (current ? selectionError : undefined),
    loading: Boolean(room && date && !current),
    refresh: () => {
      reportError(undefined)
      setRevision((value) => value + 1)
    },
    reportError,
  }
}
