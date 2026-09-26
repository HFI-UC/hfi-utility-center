import { Suspense } from "react"

import { Spinner } from "@/components/astryx"

import { AdminLoginForm } from "./login-form"

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="admin-login-loading">
          <Spinner className="size-8" />
        </main>
      }
    >
      <AdminLoginPageContent />
    </Suspense>
  )
}

function AdminLoginPageContent() {
  return <AdminLoginForm />
}
