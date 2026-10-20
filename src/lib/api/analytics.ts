import { api } from "@/lib/api/client"
import type { ApiResponse } from "@/lib/api/types"

export interface AnalyticsOverview {
  today: {
    reservations: number
    reservationCreations: number
    requests: number
    approvals: number
    rejections: number
  }
  pending: number
}

export interface WeeklyAnalytics {
  totalReservations: number
  totalReservationCreations: number
  totalApprovals: number
  totalRejections: number
  rooms: Array<{
    roomName: string
    reservations: number
    reservationCreations: number
  }>
  dailyReservations: number[]
}

export async function getAnalyticsOverview() {
  const response = await api.get<ApiResponse<AnalyticsOverview>>("/analytics/overview")
  return response.data.data!
}

export async function getWeeklyAnalytics() {
  const response = await api.get<ApiResponse<WeeklyAnalytics>>("/analytics/weekly")
  return response.data.data!
}
