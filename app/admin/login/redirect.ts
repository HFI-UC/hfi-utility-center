const DEFAULT_REDIRECT = "/admin/reservation"
const ADMIN_ROUTES = new Set([
  "/admin",
  "/admin/reservation",
  "/admin/facility",
  "/admin/user",
])

export function safeAdminRedirect(value?: string) {
  const path = value?.split(/[?#]/, 1)[0]
  return path && ADMIN_ROUTES.has(path) ? value : DEFAULT_REDIRECT
}
