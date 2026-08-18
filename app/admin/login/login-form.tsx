"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"

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
            <Controller
              control={form.control}
              name="email"
              rules={{ required: t("emailRequired") }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("email")}</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="password"
              rules={{ required: t("passwordRequired") }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>{t("password")}</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="password"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
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
