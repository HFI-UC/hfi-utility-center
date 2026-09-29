"use client"

import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { SectionCard } from "@/components/layout/section-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useErrorShake } from "@/hooks/use-error-shake"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import { createAdmin } from "@/lib/api/admins"

type CreateAdminFields = { name: string; email: string; password: string }

export function CreateAdminForm({ mutate, working }: { mutate: AdminMutation; working: boolean }) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [actionError, setActionError] = useState(false)
  const form = useForm<CreateAdminFields>({
    defaultValues: { name: "", email: "", password: "" },
  })
  const { ref: formRef, shake } = useErrorShake<HTMLFormElement>()
  const requiredText = {
    validate: (value: string) => Boolean(value.trim()) || t("fieldRequired"),
  }

  async function createAccount(values: CreateAdminFields) {
    setActionError(false)
    try {
      const created = await mutate(
        () => createAdmin(values.name.trim(), values.email.trim(), values.password),
        t("adminCreated"),
      )
      if (created) form.reset()
    } catch {
      setActionError(true)
    }
  }

  return (
    <SectionCard title={t("addAdmin")}>
      <form
        ref={formRef}
        className="flex min-w-0 flex-col gap-4"
        onSubmit={form.handleSubmit(createAccount, shake)}
      >
        <Controller
          control={form.control}
          name="name"
          rules={requiredText}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="new-admin-name">{t("name")}</FieldLabel>
              <Input {...field} id="new-admin-name" aria-invalid={fieldState.invalid} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="email"
          rules={requiredText}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="new-admin-email">{t("email")}</FieldLabel>
              <Input
                {...field}
                id="new-admin-email"
                type="email"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          rules={{
            ...requiredText,
            minLength: { value: 6, message: t("newPassword") },
          }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="new-admin-password">{t("initialPassword")}</FieldLabel>
              <Input
                {...field}
                id="new-admin-password"
                type="password"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Button
          type="submit"
          className="h-10 w-full"
          disabled={working || form.formState.isSubmitting}
        >
          <Plus />
          {t("addAccount")}
        </Button>
        {actionError ? (
          <Alert variant="destructive">
            <AlertDescription>{common("unknown")}</AlertDescription>
          </Alert>
        ) : null}
      </form>
    </SectionCard>
  )
}
