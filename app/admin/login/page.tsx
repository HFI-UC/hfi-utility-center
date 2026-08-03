import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import { AdminLoginForm } from "./login-form"

function safeRedirect(value?: string) {
  if (value?.startsWith("/") && !value.startsWith("//")) return value
  return "/admin/reservations"
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; redirect?: string }>
}) {
  const [t, params] = await Promise.all([
    getTranslations("admin"),
    searchParams,
  ])
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-4 py-16 text-sm text-muted-foreground">
          {t("loginLoading")}
        </main>
      }
    >
      <AdminLoginForm
        token={params.token}
        redirectTo={safeRedirect(params.redirect)}
      />
    </Suspense>
  )
}
