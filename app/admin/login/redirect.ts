const DEFAULT_REDIRECT = "/admin/reservations"
const LOCAL_ORIGIN = "https://hfiuc.local"

export function safeAdminRedirect(value?: string) {
  if (!value || value.includes("\\") || !URL.canParse(value, LOCAL_ORIGIN)) {
    return DEFAULT_REDIRECT
  }

  const target = new URL(value, LOCAL_ORIGIN)
  const staysOnSite = target.origin === LOCAL_ORIGIN
  const staysInAdmin =
    target.pathname === "/admin" ||
    (target.pathname.startsWith("/admin/") &&
      target.pathname !== "/admin/login")

  if (!staysOnSite || !staysInAdmin) return DEFAULT_REDIRECT
  return `${target.pathname}${target.search}${target.hash}`
}
