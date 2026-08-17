"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { Turnstile } from "@/components/turnstile"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { checkLogin, loginWithPassword, loginWithToken } from "@/lib/api/auth"

type LoginFields = { email: string; password: string }

export function AdminLoginForm({
  token,
  redirectTo,
}: {
  token?: string
  redirectTo: string
}) {
  const t = useTranslations("admin")
  const router = useRouter()
  const form = useForm<LoginFields>({
    defaultValues: { email: "", password: "" },
  })
  const { errors } = form.formState
  const [turnstileToken, setTurnstileToken] = useState("")
  const [error, setError] = useState<string>()
  const handleToken = useCallback(
    (value: string) => setTurnstileToken(value),
    []
  )

  useEffect(() => {
    let ignore = false

    async function restoreSession() {
      if (token) await loginWithToken(token)
      else if (!(await checkLogin())) return
      if (!ignore) router.replace(redirectTo)
    }

    restoreSession()
    return () => {
      ignore = true
    }
  }, [redirectTo, router, token])

  async function submit({ email, password }: LoginFields) {
    if (!turnstileToken) {
      setError(t("verificationRequired"))
      return
    }
    setError(undefined)
    await loginWithPassword(email, password, turnstileToken)
    router.replace(redirectTo)
  }

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            {t("loginTitle")}
          </CardTitle>
          <CardDescription>{t("loginDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            onSubmit={form.handleSubmit(submit)}
            className="space-y-4"
          >
            <Field data-invalid={Boolean(errors.email)}>
              <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
              <Input
                {...form.register("email", { required: t("emailRequired") })}
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field data-invalid={Boolean(errors.password)}>
              <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
              <Input
                {...form.register("password", {
                  required: t("passwordRequired"),
                })}
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            <Turnstile onToken={handleToken} />
            <p className="min-h-5 text-sm text-destructive">{error}</p>
            <Button
              className="w-full"
              disabled={form.formState.isSubmitting || !turnstileToken}
            >
              {form.formState.isSubmitting ? <Spinner /> : null}
              {form.formState.isSubmitting ? t("loggingIn") : t("login")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
