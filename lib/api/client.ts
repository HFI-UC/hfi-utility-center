import axios, { type AxiosRequestConfig } from "axios"
import { createTranslator } from "next-intl"

import enMessages from "@/messages/en-US.json"
import zhMessages from "@/messages/zh-CN.json"
import type { ApiResponse } from "@/lib/api/types"

const messages = {
  "en-US": enMessages,
  "zh-CN": zhMessages,
} as const

const api = axios.create({
  withCredentials: true,
  validateStatus: () => true,
  xsrfCookieName: "_csrf",
  xsrfHeaderName: "x-csrf-token",
  withXSRFToken: true,
})

function apiBaseUrl() {
  if (typeof window !== "undefined") return "/api/backend"
  return process.env.BACKEND_URL ?? "https://api.hfiuc.org"
}

api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase()
  if (method && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    await api.get("/_csrf", { baseURL: apiBaseUrl() })
  }
  return config
})

const codeKeys: Record<string, string> = {
  ROOM_UNAVAILABLE: "roomUnavailable",
  INVALID_CREDENTIALS: "invalidCredentials",
  INVALID_REFRESH_TOKEN: "sessionExpired",
  ADMIN_NOT_FOUND: "adminNotFound",
  UNAUTHORIZED: "sessionExpired",
}

const messageKeys: Record<string, string> = {
  "Room not found.": "roomNotFound",
  "Class not found.": "classNotFound",
  "Campus not found.": "campusNotFound",
  "Reservation not found.": "reservationNotFound",
  "User is not logged in.": "sessionExpired",
  "Invalid email or password.": "invalidCredentials",
  "Turnstile verification failed.": "verificationFailed",
  "Admin already exists.": "adminExists",
  "Email already in use.": "emailInUse",
}

function localizedError(
  status: number,
  message?: string | null,
  code?: string
) {
  const storedLocale =
    typeof window === "undefined"
      ? undefined
      : window.localStorage.getItem("hfiuc-locale")
  const locale =
    storedLocale === "en-US" || storedLocale === "zh-CN"
      ? storedLocale
      : typeof document !== "undefined" &&
          document.documentElement.lang === "en-US"
        ? "en-US"
        : "zh-CN"
  const t = createTranslator({
    locale,
    messages: messages[locale],
    namespace: "apiErrors",
  })
  const key = (code && codeKeys[code]) || (message && messageKeys[message])
  if (key) return t(key as never)
  if (status === 0) return t("network")
  if (status === 401 || status === 403) return t("sessionExpired")
  if (status === 404) return t("notFound")
  if (status === 409) return t("conflict")
  if (status >= 500) return t("server")
  return t("unknown")
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
  }
}

export async function apiRequest<T>(
  path: string,
  init: AxiosRequestConfig = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await api.request<ApiResponse<T>>({
      ...init,
      baseURL: apiBaseUrl(),
      url: path,
    })
    const payload = response.data
    if (response.status < 200 || response.status >= 300 || !payload?.success) {
      throw new ApiError(
        localizedError(response.status, payload?.message, payload?.code),
        response.status,
        payload?.code
      )
    }
    return payload
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(localizedError(0), 0)
  }
}

export function requireData<T>(response: ApiResponse<T>, message: string): T {
  if (response.data === undefined) throw new Error(message)
  return response.data
}

export function jsonBody(value: unknown): Pick<AxiosRequestConfig, "data"> {
  return { data: value }
}

export function backendHref(path: string) {
  return `/api/backend${path}`
}

export { api }
