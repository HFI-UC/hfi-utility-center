import { api } from "@/lib/api/client"

export const loginWithPassword = (
  email: string,
  password: string,
  turnstileToken: string
) => api.post("/admin/login", { email, password, token: null, turnstileToken })

export const loginWithToken = (token: string) =>
  api.post("/admin/login", {
    email: null,
    password: null,
    token,
    turnstileToken: null,
  })

export const checkLogin = () => api.get("/admin/check-login")
export const logout = () => api.get("/admin/logout")
