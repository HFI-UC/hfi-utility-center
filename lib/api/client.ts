import axios, { type AxiosRequestConfig } from "axios"
import { createTranslator } from "next-intl"

import { isAppLocale, type AppLocale } from "@/i18n/config"
import type { ApiResponse } from "@/lib/api/types"
import enMessages from "@/messages/en-US.json"
import zhMessages from "@/messages/zh-CN.json"

const messages = {
  "en-US": enMessages,
  "zh-CN": zhMessages,
} as const

type ApiErrorKey = keyof (typeof enMessages)["apiErrors"]
type RequestOptions = Omit<
  AxiosRequestConfig,
  "baseURL" | "data" | "method" | "url"
>

const errorKeyByCode = {
  ADMIN_ALREADY_EXISTS: "adminExists",
  ADMIN_EXISTS: "adminExists",
  ADMIN_NOT_FOUND: "adminNotFound",
  CAMPUS_NOT_FOUND: "campusNotFound",
  CLASS_NOT_FOUND: "classNotFound",
  EMAIL_IN_USE: "emailInUse",
  INVALID_CREDENTIALS: "invalidCredentials",
  INVALID_REFRESH_TOKEN: "sessionExpired",
  RESERVATION_NOT_FOUND: "reservationNotFound",
  ROOM_NOT_FOUND: "roomNotFound",
  ROOM_UNAVAILABLE: "roomUnavailable",
  TURNSTILE_VERIFICATION_FAILED: "verificationFailed",
  UNAUTHORIZED: "sessionExpired",
  USER_NOT_LOGGED_IN: "sessionExpired",
  VERIFICATION_FAILED: "verificationFailed",
} as const satisfies Record<string, ApiErrorKey>

const transport = axios.create({
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

function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    typeof value.success === "boolean"
  )
}

function currentLocale(): AppLocale {
  const storedLocale =
    typeof window === "undefined"
      ? undefined
      : window.localStorage.getItem("hfiuc-locale")

  if (storedLocale && isAppLocale(storedLocale)) return storedLocale
  if (
    typeof document !== "undefined" &&
    document.documentElement.lang === "en-US"
  ) {
    return "en-US"
  }
  return "zh-CN"
}

function errorKey(status: number, code?: string): ApiErrorKey {
  if (code && Object.prototype.hasOwnProperty.call(errorKeyByCode, code)) {
    return errorKeyByCode[code as keyof typeof errorKeyByCode]
  }
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
  readonly name = "ApiError"

  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly backendMessage?: string,
    options?: ErrorOptions
  ) {
    super(message, options)
  }
}

function responseError(status: number, value: unknown, cause?: unknown) {
  const payload = isApiResponse(value) ? value : undefined
  return new ApiError(
    localizedError(status, payload?.code),
    status,
    payload?.code,
    payload?.message,
    { cause }
  )
}

function normalizeError(error: unknown) {
  if (error instanceof ApiError) return error
  if (axios.isAxiosError(error)) {
    return responseError(
      error.response?.status ?? 0,
      error.response?.data,
      error
    )
  }
  return new ApiError(localizedError(0), 0, undefined, undefined, {
    cause: error,
  })
}

transport.interceptors.request.use(async (config) => {
  config.baseURL ??= apiBaseUrl()
  const method = config.method?.toUpperCase()
  if (method && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    await transport.get("/_csrf", { baseURL: apiBaseUrl() })
  }
  return config
})

transport.interceptors.response.use(
  (response) => {
    if (
      response.status < 200 ||
      response.status >= 300 ||
      !isApiResponse(response.data) ||
      !response.data.success
    ) {
      throw responseError(response.status, response.data)
    }
    return response
  },
  (error: unknown) => Promise.reject(normalizeError(error))
)

async function request<T>(
  method: "GET" | "POST",
  path: string,
  data?: unknown,
  options?: RequestOptions
) {
  try {
    const response = await transport.request<ApiResponse<T>>({
      ...options,
      method,
      url: path,
      data,
    })
    return { payload: response.data, status: response.status }
  } catch (error) {
    throw normalizeError(error)
  }
}

async function requestData<T>(
  method: "GET" | "POST",
  path: string,
  data?: unknown,
  options?: RequestOptions
) {
  const { payload, status } = await request<T>(method, path, data, options)
  if (payload.data == null) {
    throw new ApiError(
      localizedError(status, "INVALID_RESPONSE"),
      status,
      "INVALID_RESPONSE",
      payload.message
    )
  }
  return payload.data
}

export const api = {
  get<T>(path: string, options?: RequestOptions) {
    return requestData<T>("GET", path, undefined, options)
  },
  async getVoid(path: string, options?: RequestOptions) {
    await request("GET", path, undefined, options)
  },
  async post<TBody>(path: string, data: TBody, options?: RequestOptions) {
    await request("POST", path, data, options)
  },
  postForData<T, TBody>(path: string, data: TBody, options?: RequestOptions) {
    return requestData<T>("POST", path, data, options)
  },
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback
}

export function backendHref(path: string) {
  return `/api/backend${path}`
}
