import { AdminLoginForm } from "./login-form"
import { safeAdminRedirect } from "./redirect"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; redirect?: string }>
}) {
  const params = await searchParams
  const redirectParams = new URLSearchParams(params.redirect?.split("?")[1])
  const token = params.token ?? redirectParams.get("token") ?? undefined
  redirectParams.delete("token")

  const redirectPath = params.redirect?.split("?", 1)[0]
  const redirectQuery = redirectParams.toString()
  const redirectTo = safeAdminRedirect(
    redirectPath
      ? `${redirectPath}${redirectQuery ? `?${redirectQuery}` : ""}`
      : undefined
  )

  return (
    <AdminLoginForm
      token={token}
      redirectTo={redirectTo}
    />
  )
}
