export type SupportedLocale = "zh-CN" | "en-US"

type ErrorMessages = {
  network: string
  unknown: string
  unauthorized: string
  notFound: string
  conflict: string
  server: string
  codes: Record<string, string>
  legacy: Record<string, string>
}

const errorMessages: Record<SupportedLocale, ErrorMessages> = {
  "zh-CN": {
    network: "无法连接服务器，请检查网络后重试。",
    unknown: "操作失败，请稍后重试。",
    unauthorized: "登录已失效，请重新登录。",
    notFound: "请求的数据不存在。",
    conflict: "数据已发生变化，请刷新后重试。",
    server: "服务器暂时不可用，请稍后重试。",
    codes: {
      ROOM_UNAVAILABLE: "该房间目前不可预约。",
      INVALID_CREDENTIALS: "邮箱、密码或安全验证不正确。",
      INVALID_REFRESH_TOKEN: "登录已过期，请重新登录。",
      ADMIN_NOT_FOUND: "管理员账号不存在。",
      UNAUTHORIZED: "请重新登录。",
    },
    legacy: {
      "Room not found.": "房间不存在。",
      "Class not found.": "班级不存在。",
      "Campus not found.": "校区不存在。",
      "Reservation not found.": "预约不存在。",
      "User is not logged in.": "登录已失效，请重新登录。",
      "Invalid email or password.": "邮箱或密码不正确。",
      "Turnstile verification failed.": "安全验证失败，请重新验证。",
      "Admin already exists.": "该管理员账号已存在。",
      "Email already in use.": "该邮箱已被使用。",
    },
  },
  "en-US": {
    network: "Unable to reach the server. Check your connection and try again.",
    unknown: "Something went wrong. Please try again.",
    unauthorized: "Your session has expired. Please sign in again.",
    notFound: "The requested data was not found.",
    conflict: "The data has changed. Refresh and try again.",
    server: "The server is temporarily unavailable.",
    codes: {
      ROOM_UNAVAILABLE: "This room is currently unavailable.",
      INVALID_CREDENTIALS: "Email, password or verification is incorrect.",
      INVALID_REFRESH_TOKEN: "Your session has expired.",
      ADMIN_NOT_FOUND: "Administrator not found.",
      UNAUTHORIZED: "Please sign in again.",
    },
    legacy: {
      "Room not found.": "Room not found.",
      "Class not found.": "Class not found.",
      "Campus not found.": "Campus not found.",
      "Reservation not found.": "Reservation not found.",
      "User is not logged in.": "Please sign in again.",
      "Invalid email or password.": "Invalid email or password.",
      "Turnstile verification failed.":
        "Verification failed. Please try again.",
      "Admin already exists.": "This administrator already exists.",
      "Email already in use.": "This email is already in use.",
    },
  },
}

export function localizedApiError(
  status: number,
  message?: string,
  code?: string,
  locale: SupportedLocale = "zh-CN"
) {
  const messages = errorMessages[locale]
  if (code && messages.codes[code]) return messages.codes[code]
  if (message && messages.legacy[message]) return messages.legacy[message]
  if (status === 0) return messages.network
  if (status === 401 || status === 403) return messages.unauthorized
  if (status === 404) return messages.notFound
  if (status === 409) return messages.conflict
  if (status >= 500) return messages.server
  return messages.unknown
}
