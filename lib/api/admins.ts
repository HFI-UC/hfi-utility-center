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
export const createApprover = (room: number, admin: number) =>
  api.post("/approver/create", { room, admin })
export const deleteApprover = (id: number) =>
  api.post("/approver/delete", { id })
export const toggleApproverNotifications = (id: number) =>
  api.post("/approver/toggle-notification", { id })
