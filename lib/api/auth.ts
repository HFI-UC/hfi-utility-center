import { api } from "@/lib/api/client"
import type { ApiResponse } from "@/lib/api/types"

export const loginWithPassword = (
  email: string,
  password: string,
  turnstileToken: string
) =>
  api.post("/admin/login", {
    email,
    password,
    token: null,
    turnstileToken,
  })

export const loginWithToken = (token: string) =>
  api.post("/admin/login", {
    email: null,
    password: null,
    token,
    turnstileToken: null,
  })

export async function checkLogin() {
  const response = await api.get<ApiResponse>("/admin/check-login", {
    suppressErrorToast: true,
  })
  return Boolean(response.data?.success)
}
export const logout = () => api.get("/admin/logout")
