import { apiRequest, backendHref, requireData } from "@/lib/api/client"
import type { OverviewAnalytics, WeeklyAnalytics } from "@/lib/api/types"

export async function getOverviewAnalytics() {
  const response = await apiRequest<OverviewAnalytics>("/analytics/overview")
  return requireData(response, "Overview data is missing")
}
export async function getWeeklyAnalytics() {
  const response = await apiRequest<WeeklyAnalytics>("/analytics/weekly")
  return requireData(response, "Weekly data is missing")
}

export function analyticsExportUrl(
  report: "overview" | "weekly",
  type: "pdf" | "png",
  turnstileToken: string
) {
  const query = new URLSearchParams({ type, turnstileToken })
  return backendHref(`/analytics/${report}/export?${query}`)
}
