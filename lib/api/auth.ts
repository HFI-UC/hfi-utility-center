import { apiRequest, jsonBody } from "@/lib/api/client"

export const login = (
  email: string | null,
  password: string | null,
  token: string | null,
  turnstileToken: string | null
) =>
  apiRequest("/admin/login", {
    method: "POST",
    ...jsonBody({ email, password, token, turnstileToken }),
  })

export const checkLogin = () => apiRequest("/admin/check-login")
export const logout = () => apiRequest("/admin/logout")
