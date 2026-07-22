import { localizedApiError, messages } from "@/lib/messages"
import type { ApiResponse } from "@/lib/api/types"

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
  const locale = typeof document !== "undefined" && document.cookie.includes("hfiuc-locale=en-US") ? "en-US" : "zh-CN"
  let response: Response
  try {
    response = await fetch(`/api/backend${path}`, {
      credentials: "include",
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new ApiError(messages.common.networkError, 0)
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) {
    if (!response.ok) throw new ApiError(messages.common.unknownError, response.status)
    return { success: true, data: (await response.blob()) as T }
  }

  const payload = (await response.json()) as ApiResponse<T>
  if (!response.ok || !payload.success) {
    throw new ApiError(localizedApiError(response.status, payload.message, payload.code, locale), response.status, payload.code)
  }
  return payload
}

export function jsonBody(value: unknown): Pick<RequestInit, "body"> {
  return { body: JSON.stringify(value) }
}
