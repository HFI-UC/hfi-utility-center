import axios from "axios"

import type { ApiResponse } from "@/lib/api/types"

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api.hfiuc.org"

export const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
  validateStatus: () => true,
  xsrfCookieName: "_csrf",
  xsrfHeaderName: "x-csrf-token",
  withXSRFToken: true,
})

api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase()
  if (method && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    await api.get("/_csrf")
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiResponse
    if (response.status < 200 || response.status >= 300 || !payload.success) {
      throw new Error(payload.message ?? response.statusText)
    }
    return response
  },
  (error: unknown) => {
    if (!axios.isAxiosError<ApiResponse>(error)) return Promise.reject(error)
    return Promise.reject(
      new Error(error.response?.data.message ?? error.message, { cause: error })
    )
  }
)

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

export function backendHref(path: string) {
  return new URL(path, backendUrl).toString()
}
