"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { AdminLoginForm } from "./login-form"
import { safeAdminRedirect } from "./redirect"

function AdminLoginContent() {
  const searchParams = useSearchParams()
  const params = {
    token: searchParams.get("token") ?? undefined,
    redirect: searchParams.get("redirect") ?? undefined,
  }
  const redirectParams = new URLSearchParams(params.redirect?.split("?")[1])
  const token = params.token ?? redirectParams.get("token") ?? undefined
  redirectParams.delete("token")

  const redirectPath = params.redirect?.split("?", 1)[0]
  const redirectQuery = redirectParams.toString()
  const redirectTo = safeAdminRedirect(
    redirectPath ? `${redirectPath}${redirectQuery ? `?${redirectQuery}` : ""}` : undefined,
  )

  return <AdminLoginForm token={token} redirectTo={redirectTo} />
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginContent />
    </Suspense>
  )
}
