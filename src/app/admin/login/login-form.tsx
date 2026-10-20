"use client"

import { LogIn } from "lucide-react"
import { useTranslations } from "next-intl"
import { redirect, useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { AppShell } from "@/components/layout/app-shell"
import { LoadingState } from "@/components/layout/data-state"
import { Turnstile } from "@/components/turnstile"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useErrorShake } from "@/hooks/use-error-shake"
import { checkLogin, loginWithPassword, loginWithToken, rememberAdminEmail } from "@/lib/api/auth"

type LoginFields = { email: string; password: string }

export function AdminLoginForm({ token, redirectTo }: { token?: string; redirectTo: string }) {
  const t = useTranslations("admin")
  const router = useRouter()
  const form = useForm<LoginFields>({
    defaultValues: { email: "", password: "" },
  })
  const turnstileTokenRef = useRef("")
  const [error, setError] = useState<string>()
  const [sessionStatus, setSessionStatus] = useState<
    "checking" | "authenticated" | "unauthenticated"
  >(() => (token ? "checking" : "unauthenticated"))
  const { ref: formRef, shake } = useErrorShake<HTMLFormElement>()
  const handleToken = useCallback((value: string) => {
    turnstileTokenRef.current = value
    if (value) setError(undefined)
  }, [])

  useEffect(() => {
    let ignore = false

    async function restoreSession() {
      if (!token) {
        try {
          if (await checkLogin()) {
            if (!ignore) setSessionStatus("authenticated")
            return
          }
        } catch {
          // The login form stays usable when the session probe is unavailable.
        }
        if (!ignore) setSessionStatus("unauthenticated")
        return
      }

      try {
        await loginWithToken(token)
        if (!ignore) setSessionStatus("authenticated")
      } catch {
        if (!ignore) setSessionStatus("unauthenticated")
      }
    }

    void restoreSession()
    return () => {
      ignore = true
    }
  }, [token])

  async function submit({ email, password }: LoginFields) {
    if (!turnstileTokenRef.current) {
      setError(t("verificationRequired"))
      return
    }
    setError(undefined)
    try {
      const normalizedEmail = email.trim()
      await loginWithPassword(normalizedEmail, password, turnstileTokenRef.current)
      rememberAdminEmail(normalizedEmail)
      router.replace(redirectTo)
      router.refresh()
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : t("loginFailed"))
    }
  }
  if (sessionStatus === "authenticated") {
    redirect(redirectTo)
  }

  if (sessionStatus === "checking") {
    return (
      <AppShell width="narrow">
        <div className="flex min-h-[80svh] items-center justify-center">
          <LoadingState label={t("loginLoading")} />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell width="narrow">
      <div className="flex min-h-[80svh] flex-col items-center justify-center gap-6">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">{t("loginTitle")}</h1>

        <Card className="w-full max-w-md">
          <CardContent>
            <form
              noValidate
              ref={formRef}
              onSubmit={(e) => form.handleSubmit(submit, shake)(e)}
              className="flex flex-col gap-4"
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
              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}
              <Button
                type="submit"
                size="lg"
                className="h-11 w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? <Spinner /> : <LogIn />}
                {t("login")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
