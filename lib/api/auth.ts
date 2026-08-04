import { apiClient } from "@/lib/api/client"

export const loginWithPassword = (
  email: string,
  password: string,
  turnstileToken: string
) =>
  apiClient.post("/admin/login", {
    email,
    password,
    token: null,
    turnstileToken,
  })

export const loginWithToken = (token: string) =>
  apiClient.post("/admin/login", {
    email: null,
    password: null,
    token,
    turnstileToken: null,
  })

export const checkLogin = () => apiClient.getVoid("/admin/check-login")
export const logout = () => apiClient.getVoid("/admin/logout")
