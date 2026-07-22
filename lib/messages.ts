export const messages = {
  common: {
    loading: "正在加载…",
    retry: "重试",
    back: "返回",
    next: "下一步",
    save: "保存",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    submit: "提交",
    unknownError: "操作失败，请稍后重试。",
    networkError: "无法连接服务器，请检查网络后重试。",
    unauthorized: "登录已失效，请重新登录。",
  },
  status: {
    pending: "待审批",
    approved: "已通过",
    rejected: "已拒绝",
  },
  errorCodes: {
    ROOM_UNAVAILABLE: "该房间目前不可预约。",
    INVALID_CREDENTIALS: "邮箱、密码或安全验证不正确。",
    INVALID_REFRESH_TOKEN: "登录已过期，请重新登录。",
    ADMIN_NOT_FOUND: "管理员账号不存在。",
  } satisfies Record<string, string>,
} as const

const legacyErrors: Record<string, string> = {
  "Room not found.": "房间不存在。",
  "Class not found.": "班级不存在。",
  "Campus not found.": "校区不存在。",
  "Reservation not found.": "预约不存在。",
  "User is not logged in.": messages.common.unauthorized,
  "Invalid email or password.": "邮箱或密码不正确。",
  "Turnstile verification failed.": "安全验证失败，请重新验证。",
  "Admin already exists.": "该管理员账号已存在。",
  "Email already in use.": "该邮箱已被使用。",
}

const englishCodes: Record<string, string> = {
  ROOM_UNAVAILABLE: "This room is currently unavailable.", INVALID_CREDENTIALS: "Email, password or verification is incorrect.", INVALID_REFRESH_TOKEN: "Your session has expired.", ADMIN_NOT_FOUND: "Administrator not found.", UNAUTHORIZED: "Please sign in again.",
}

export function localizedApiError(status: number, message?: string, code?: string, locale: "zh-CN" | "en-US" = "zh-CN") {
  if (locale === "en-US") {
    if (code && englishCodes[code]) return englishCodes[code]
    if (status === 401 || status === 403) return "Please sign in again."
    if (status === 404) return "The requested data was not found."
    if (status === 409) return "The data has changed. Refresh and try again."
    if (status >= 500) return "The server is temporarily unavailable."
    return message || "Something went wrong. Please try again."
  }
  if (code && code in messages.errorCodes) return messages.errorCodes[code as keyof typeof messages.errorCodes]
  if (message && legacyErrors[message]) return legacyErrors[message]
  if (status === 401 || status === 403) return messages.common.unauthorized
  if (status === 404) return "请求的数据不存在。"
  if (status === 409) return "数据已发生变化，请刷新后重试。"
  if (status >= 500) return "服务器暂时不可用，请稍后重试。"
  return messages.common.unknownError
}
