import axios from "axios"
import type { AxiosRequestConfig } from "axios"

import type { ApiResponse } from "@/lib/api/types"
import enMessages from "@/messages/en-US.json"
import zhMessages from "@/messages/zh-CN.json"

declare module "axios" {
  interface AxiosRequestConfig {
    suppressErrorToast?: boolean
  }
}

const backendUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "/backend"

export const api = axios.create({
  baseURL: backendUrl,
  timeout: 5000,
  withCredentials: true,
  validateStatus: () => true,
  xsrfCookieName: "_csrf",
  xsrfHeaderName: "x-csrf-token",
  withXSRFToken: true,
})

class RequestError extends Error {
  notified = false
}

function requestFailedMessage() {
  const isEnglish =
    typeof document !== "undefined" &&
    document.cookie.split("; ").includes("locale=en-US")
  return isEnglish ? enMessages.common.unknown : zhMessages.common.unknown
}

function normalizeRequestError(error: unknown) {
  if (error instanceof RequestError) return error

  if (axios.isAxiosError<ApiResponse>(error)) {
    return new RequestError(
      error.response?.data?.message || requestFailedMessage(),
      { cause: error }
    )
  }

  return new RequestError(requestFailedMessage(), { cause: error })
}

function rejectRequest(error: unknown, config?: AxiosRequestConfig) {
  const requestError = normalizeRequestError(error)

  if (
    typeof window !== "undefined" &&
    !config?.suppressErrorToast &&
    !requestError.notified
  ) {
    console.error("HFI Utility Center request failed:", requestError.message)
    requestError.notified = true
  }

  return Promise.reject(requestError)
}

api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase()
  if (method && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrfResponse = await api.get<ApiResponse<string>>("/_csrf", {
      suppressErrorToast: true,
    })
    const csrfToken =
      csrfResponse.headers["x-csrf-token"] || csrfResponse.data.data
    if (csrfToken) config.headers.set("x-csrf-token", csrfToken)
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse | undefined
    if (response.status < 200 || response.status >= 300 || !payload?.success) {
      if (response.config.suppressErrorToast) return response
      return rejectRequest(
        new RequestError(payload?.message || requestFailedMessage()),
        response.config
      )
    }
    return response
  },
  (error: unknown) => {
    const config = axios.isAxiosError(error) ? error.config : undefined
    return rejectRequest(error, config)
  }
)

export function backendHref(path: string) {
  if (/^https?:\/\//.test(backendUrl))
    return new URL(path, backendUrl).toString()
  const normalized = `${backendUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`
  return typeof window === "undefined"
    ? normalized
    : new URL(normalized, window.location.origin).toString()
}
