import { Suspense } from "react"
import { AdminLoginForm } from "@/features/admin/admin-login-form"

export default function AdminLoginPage() {
  return <Suspense fallback={<main className="mx-auto max-w-md px-4 py-16 text-sm text-muted-foreground">正在准备登录…</main>}><AdminLoginForm /></Suspense>
}
