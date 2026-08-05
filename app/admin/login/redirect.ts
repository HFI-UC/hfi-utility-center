const DEFAULT_REDIRECT = "/admin/reservations"
const ADMIN_ROUTES = new Set([
  "/admin",
  "/admin/reservations",
  "/admin/facilities",
  "/admin/users",
])

export function safeAdminRedirect(value?: string) {
  const path = value?.split(/[?#]/, 1)[0]
  return path && ADMIN_ROUTES.has(path) ? value : DEFAULT_REDIRECT
}
