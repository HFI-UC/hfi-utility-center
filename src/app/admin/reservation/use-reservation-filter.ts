"use client"

import { useMemo } from "react"

import type { Reservation } from "@/lib/api/types"

export const STATUS_FILTERS = [
  "all",
  "pending",
  "ai_reviewing",
  "approved",
  "rejected",
  "cancelled",
] as const

export type StatusFilter = (typeof STATUS_FILTERS)[number]

const SEARCH_FIELDS = ["studentName", "email", "roomName", "className", "reason"] as const

// Filters reservations by matching a keyword across searchable fields and status.
export function useReservationFilter(
  reservations: Reservation[],
  query: string,
  status: StatusFilter,
) {
  return useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return reservations.filter((item) => {
      if (status !== "all" && item.status !== status) return false
      if (!keyword) return true
      return [...SEARCH_FIELDS.map((field) => item[field]), String(item.id)].some((value) =>
        value?.toLowerCase().includes(keyword),
      )
    })
  }, [query, reservations, status])
}
