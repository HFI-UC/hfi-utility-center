import axios from "axios"
import { createTranslator } from "next-intl"

import enMessages from "@/messages/en-US.json"
import zhMessages from "@/messages/zh-CN.json"
import { isAppLocale, type AppLocale } from "@/i18n/config"
import type { ApiResponse } from "@/lib/api/types"

const messages = {
  "en-US": enMessages,
  "zh-CN": zhMessages,
} as const

type ApiErrorKey = keyof (typeof enMessages)["apiErrors"]

export const api = axios.create({
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
  config.baseURL ??= apiBaseUrl()
  const method = config.method?.toUpperCase()
  if (method && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    await api.get("/_csrf", { baseURL: apiBaseUrl() })
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse
    if (response.status < 200 || response.status >= 300 || !payload?.success) {
      throw new ApiError(
        localizedError(response.status, payload?.code),
        response.status,
        payload?.code
      )
    }
    return response
  },
  () => Promise.reject(new ApiError(localizedError(0), 0))
)

function errorKeyFromCode(code?: string): ApiErrorKey | undefined {
  switch (code) {
    case "ROOM_UNAVAILABLE":
      return "roomUnavailable"
    case "INVALID_CREDENTIALS":
      return "invalidCredentials"
    case "INVALID_REFRESH_TOKEN":
    case "UNAUTHORIZED":
      return "sessionExpired"
    case "ADMIN_NOT_FOUND":
      return "adminNotFound"
    default:
      return undefined
  }
}

function currentLocale(): AppLocale {
  const storedLocale =
    typeof window === "undefined"
      ? undefined
      : window.localStorage.getItem("hfiuc-locale")

  if (storedLocale && isAppLocale(storedLocale)) {
    return storedLocale
  }
  if (
    typeof document !== "undefined" &&
    document.documentElement.lang === "en-US"
  ) {
    return "en-US"
  }
  return "zh-CN"
}

function errorKey(status: number, code?: string): ApiErrorKey {
  const codeKey = errorKeyFromCode(code)
  if (codeKey) return codeKey
  if (status === 0) return "network"
  if (status === 401 || status === 403) return "sessionExpired"
  if (status === 404) return "notFound"
  if (status === 409) return "conflict"
  if (status >= 500) return "server"
  return "unknown"
}

function localizedError(status: number, code?: string) {
  const locale = currentLocale()
  const t = createTranslator({
    locale,
    messages: messages[locale],
    namespace: "apiErrors",
  })
  return t(errorKey(status, code))
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

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}

export function backendHref(path: string) {
  return `/api/backend${path}`
}
