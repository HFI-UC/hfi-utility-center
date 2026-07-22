"use client"

import { useCallback, useEffect, useState } from "react"
import { LogIn } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Turnstile } from "@/components/turnstile"
import { checkLogin, login } from "@/lib/api/auth"

export function AdminLoginForm() {
  const t = useTranslations("admin")
  const router = useRouter()
  const params = useSearchParams()
  const form = useForm<{ email: string; password: string }>({
    defaultValues: { email: "", password: "" },
  })
  const [turnstileToken, setTurnstileToken] = useState("")
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const token = params.get("token")
  const redirect = params.get("redirect") || "/admin/reservations"
  const handleToken = useCallback(
    (value: string) => setTurnstileToken(value),
    []
  )

  useEffect(() => {
    let active = true
    if (token)
      login(null, null, token, null)
        .then(() => {
          if (active) router.replace(redirect)
        })
        .catch((loadError) => {
          if (active)
            setError(
              loadError instanceof Error
                ? loadError.message
                : t("invalidLoginLink")
            )
        })
    else
      checkLogin()
        .then(() => {
          if (active) router.replace(redirect)
        })
        .catch(() => undefined)
    return () => {
      active = false
    }
  }, [redirect, router, t, token])

  async function submit({
    email,
    password,
  }: {
    email: string
    password: string
  }) {
    if (!turnstileToken) {
      setError(t("verificationRequired"))
      return
    }
    setSubmitting(true)
    setError(undefined)
    try {
      await login(email, password, null, turnstileToken)
      router.replace(redirect)
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : t("loginFailed")
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-7xl px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div className="border-b pb-10 lg:border-r lg:border-b-0 lg:pr-14">
        <h1 className="text-4xl font-semibold sm:text-5xl">
          {t("loginTitle")}
        </h1>
        <p className="mt-5 max-w-md leading-7 text-muted-foreground">
          {t("loginDescription")}
        </p>
      </div>
      <form
        noValidate
        onSubmit={form.handleSubmit(submit)}
        className="space-y-5 pt-10 lg:pt-0 lg:pl-14"
      >
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register("email", { required: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register("password", { required: true })}
          />
        </div>
        <Turnstile onToken={handleToken} />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" disabled={submitting || !turnstileToken}>
          <LogIn />
          {submitting ? t("loggingIn") : t("login")}
        </Button>
      </form>
    </main>
  )
}
