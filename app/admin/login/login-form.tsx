"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { Controller, useForm } from "react-hook-form"

import { Turnstile } from "@/components/turnstile"
import { Button } from "@/components/astryx"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/astryx"
import { Field, FieldError, FieldLabel } from "@/components/astryx"
import { Input } from "@/components/astryx"
import { Spinner } from "@/components/astryx"
import {
  checkLogin,
  loginWithPassword,
  loginWithToken,
  rememberAdminEmail,
} from "@/lib/api/auth"

import { safeAdminRedirect } from "./redirect"

type LoginFields = { email: string; password: string }

export function AdminLoginForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? ""
  const redirectParams = new URLSearchParams(redirect.split("?")[1] ?? "")
  const token =
    searchParams.get("token") ?? redirectParams.get("token") ?? undefined
  redirectParams.delete("token")
  const redirectPath = redirect.split("?", 1)[0]
  const redirectQuery = redirectParams.toString()
  const redirectTo = safeAdminRedirect(
    redirectPath
      ? `${redirectPath}${redirectQuery ? `?${redirectQuery}` : ""}`
      : undefined
  )
  const t = useTranslations("admin")
  const router = useRouter()
  const form = useForm<LoginFields>({
    defaultValues: { email: "", password: "" },
  })
  const [turnstileToken, setTurnstileToken] = useState("")
  const [error, setError] = useState<string>()
  const [checkingSession, setCheckingSession] = useState(true)
  const handleToken = useCallback((value: string) => {
    setTurnstileToken(value)
    if (value) setError(undefined)
  }, [])

  useEffect(() => {
    let ignore = false

    async function restoreSession() {
      if (!token) {
        setCheckingSession(false)
        try {
          if ((await checkLogin()) && !ignore) {
            router.replace(redirectTo)
            router.refresh()
          }
        } catch {
          // The login form stays usable when the session probe is unavailable.
        }
        return
      }

      try {
        await loginWithToken(token)

        if (!ignore) {
          router.replace(redirectTo)
          router.refresh()
        }
      } catch {
        if (!ignore) setCheckingSession(false)
      }
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
    try {
      const normalizedEmail = email.trim()
      await loginWithPassword(normalizedEmail, password, turnstileToken)
      rememberAdminEmail(normalizedEmail)
      router.replace(redirectTo)
      router.refresh()
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : t("loginFailed")
      )
    }
  }

  if (checkingSession) {
    return (
      <main className="admin-login-loading">
        <Spinner className="size-8" />
        <span>{t("loginLoading")}</span>
      </main>
    )
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-brand" aria-label="HFI Campus" />

      <section className="admin-login-form-panel">
        <Card className="admin-login-card">
          <CardHeader className="admin-login-card__header">
            <CardTitle>{t("loginTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="admin-login-card__content">
            <form
              noValidate
              onSubmit={form.handleSubmit(submit)}
              className="admin-login-form"
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
                      placeholder="name@hfiuc.org"
                      className="admin-login-input"
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
                    <FieldLabel htmlFor={field.name}>
                      {t("password")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      autoComplete="current-password"
                      className="admin-login-input"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Turnstile onToken={handleToken} />
              <p className="admin-login-error" role="alert">
                {error}
              </p>
              <Button
                type="submit"
                className="admin-login-submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? <Spinner /> : null}
                {form.formState.isSubmitting ? t("loggingIn") : t("login")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
