import { api } from "@/lib/api/client"
import type { ApiResponse } from "@/lib/api/types"

const ADMIN_EMAIL_STORAGE_KEY = "hfiuc-admin-email"

export function rememberAdminEmail(email: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(ADMIN_EMAIL_STORAGE_KEY, email.trim().toLowerCase())
}

export function getRememberedAdminEmail() {
  if (typeof window === "undefined") return undefined
  return localStorage.getItem(ADMIN_EMAIL_STORAGE_KEY) ?? undefined
}

export function forgetAdminEmail() {
  if (typeof window === "undefined") return
  localStorage.removeItem(ADMIN_EMAIL_STORAGE_KEY)
}

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
export async function logout() {
  try {
    return await api.get("/admin/logout")
  } finally {
    forgetAdminEmail()
  }
}
