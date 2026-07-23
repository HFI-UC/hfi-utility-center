import { apiRequest, backendHref } from "@/lib/api/client"
import type { OverviewAnalytics, WeeklyAnalytics } from "@/lib/api/types"

export async function getOverviewAnalytics() {
  const response = await apiRequest<OverviewAnalytics>("/analytics/overview")
  if (!response.data) throw new Error("Overview data is missing")
  return response.data
}
export async function getWeeklyAnalytics() {
  const response = await apiRequest<WeeklyAnalytics>("/analytics/weekly")
  if (!response.data) throw new Error("Weekly data is missing")
  return response.data
}

export function analyticsExportUrl(
  report: "overview" | "weekly",
  type: "pdf" | "png",
  turnstileToken: string
) {
  const query = new URLSearchParams({ type, turnstileToken })
  return backendHref(`/analytics/${report}/export?${query}`)
}
