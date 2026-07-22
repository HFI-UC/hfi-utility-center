import { Suspense } from "react"
import { AdminLoginForm } from "@/features/admin/admin-login-form"
import { getTranslations } from "next-intl/server"

export default async function AdminLoginPage() {
  const t = await getTranslations("admin")
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-4 py-16 text-sm text-muted-foreground">
          {t("loginLoading")}
        </main>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}
