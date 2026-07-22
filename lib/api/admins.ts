import { apiRequest, jsonBody } from "@/lib/api/client"
import type { Admin } from "@/lib/api/types"

export async function getAdmins() {
  const response = await apiRequest<Admin[]>("/admin/list")
  return response.data ?? []
}
export const createAdmin = (name: string, email: string, password: string) =>
  apiRequest("/admin/create", { method: "POST", ...jsonBody({ name, email, password }) })
export const editAdmin = (id: number, name: string, email: string) =>
  apiRequest("/admin/edit", { method: "POST", ...jsonBody({ id, name, email }) })
export const changeAdminPassword = (admin: number, newPassword: string) =>
  apiRequest("/admin/edit-password", { method: "POST", ...jsonBody({ admin, newPassword }) })
export const deleteAdmin = (id: number) =>
  apiRequest("/admin/delete", { method: "POST", ...jsonBody({ id }) })
export const createApprover = (room: number, admin: number) =>
  apiRequest("/approver/create", { method: "POST", ...jsonBody({ room, admin }) })
export const deleteApprover = (id: number) =>
  apiRequest("/approver/delete", { method: "POST", ...jsonBody({ id }) })
export const toggleApproverNotifications = (id: number) =>
  apiRequest("/approver/toggle-notification", { method: "POST", ...jsonBody({ id }) })
