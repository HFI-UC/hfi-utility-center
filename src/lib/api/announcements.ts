import { api } from "@/lib/api/client"
import type { Announcement, ApiResponse } from "@/lib/api/types"

export async function getCurrentAnnouncement() {
  const response = await api.get<ApiResponse<Announcement | null>>("/announcement/current", {
    suppressErrorToast: true,
  })
  return response.data.data ?? null
}

export async function getAdminAnnouncement() {
  const response = await api.get<ApiResponse<Announcement | null>>("/announcement/admin")
  return response.data.data ?? null
}

export const updateAnnouncement = (title: string, content: string, enabled: boolean) =>
  api.post("/announcement/update", { title, content, enabled })
