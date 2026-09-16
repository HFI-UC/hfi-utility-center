import { api } from "@/lib/api/client"
import type { Admin, ApiResponse } from "@/lib/api/types"

export async function getAdmins() {
  const response = await api.get<ApiResponse<Admin[]>>("/admin/list")
  return response.data.data!
}
export const createAdmin = (name: string, email: string, password: string) =>
  api.post("/admin/create", { name, email, password })
export const editAdmin = (id: number, name: string, email: string) =>
  api.post("/admin/edit", { id, name, email })
export const changeAdminPassword = (admin: number, newPassword: string) =>
  api.post("/admin/edit-password", { admin, newPassword })
export const deleteAdmin = (id: number) => api.post("/admin/delete", { id })
export const setAdminNotifications = (id: number, enabled: boolean) =>
  api.post("/admin/notification-settings", { id, enabled })
