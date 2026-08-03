import { apiRequest, jsonBody } from "@/lib/api/client"

export const loginWithPassword = (
  email: string,
  password: string,
  turnstileToken: string
) =>
  apiRequest("/admin/login", {
    method: "POST",
    ...jsonBody({ email, password, token: null, turnstileToken }),
  })

export const loginWithToken = (token: string) =>
  apiRequest("/admin/login", {
    method: "POST",
    ...jsonBody({
      email: null,
      password: null,
      token,
      turnstileToken: null,
    }),
  })

export const checkLogin = () => apiRequest("/admin/check-login")
export const logout = () => apiRequest("/admin/logout")
