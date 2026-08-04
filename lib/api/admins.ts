import { apiClient } from "@/lib/api/client"
import type { Admin } from "@/lib/api/types"

export const getAdmins = () => apiClient.get<Admin[]>("/admin/list")
export const createAdmin = (name: string, email: string, password: string) =>
  apiClient.post("/admin/create", { name, email, password })
export const editAdmin = (id: number, name: string, email: string) =>
  apiClient.post("/admin/edit", { id, name, email })
export const changeAdminPassword = (admin: number, newPassword: string) =>
  apiClient.post("/admin/edit-password", { admin, newPassword })
export const deleteAdmin = (id: number) =>
  apiClient.post("/admin/delete", { id })
export const createApprover = (room: number, admin: number) =>
  apiClient.post("/approver/create", { room, admin })
export const deleteApprover = (id: number) =>
  apiClient.post("/approver/delete", { id })
export const toggleApproverNotifications = (id: number) =>
  apiClient.post("/approver/toggle-notification", { id })
