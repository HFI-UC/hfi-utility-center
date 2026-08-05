"use client"

import { useEffect, useState } from "react"
import { LogIn } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"

import { Turnstile } from "@/components/turnstile"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { checkLogin, loginWithPassword, loginWithToken } from "@/lib/api/auth"
import { getErrorMessage } from "@/lib/api/client"

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

  useEffect(() => {
    let ignore = false

    async function restoreSession() {
      try {
        if (token) await loginWithToken(token)
        else await checkLogin()
        if (!ignore) router.replace(redirectTo)
      } catch (loadError) {
        if (!ignore && token) {
          setError(getErrorMessage(loadError, t("invalidLoginLink")))
        }
      }
    }

    void restoreSession()
    return () => {
      ignore = true
    }
  }, [redirectTo, router, t, token])

  async function submit({ email, password }: LoginFields) {
    if (!turnstileToken) {
      setError(t("verificationRequired"))
      return
    }
    setError(undefined)
    try {
      await loginWithPassword(email, password, turnstileToken)
      router.replace(redirectTo)
    } catch (submitError) {
      setError(getErrorMessage(submitError, t("loginFailed")))
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
        <Turnstile onToken={setTurnstileToken} />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button
          className="w-full"
          disabled={form.formState.isSubmitting || !turnstileToken}
        >
          {form.formState.isSubmitting ? <Spinner /> : <LogIn />}
          {form.formState.isSubmitting ? t("loggingIn") : t("login")}
        </Button>
      </form>
    </main>
  )
}
