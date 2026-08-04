import { AdminLoginForm } from "./login-form"
import { safeAdminRedirect } from "./redirect"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; redirect?: string }>
}) {
  const params = await searchParams
  return (
    <AdminLoginForm
      token={params.token}
      redirectTo={safeAdminRedirect(params.redirect)}
    />
  )
}
