"use client"

import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"

import { AdminSection } from "@/app/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import { createAdmin } from "@/lib/api/admins"

type CreateAdminFields = { name: string; email: string; password: string }

export function CreateAdminForm({
  mutate,
  working,
}: {
  mutate: AdminMutation
  working: boolean
}) {
  const t = useTranslations("admin")
  const form = useForm<CreateAdminFields>({
    defaultValues: { name: "", email: "", password: "" },
  })
  const requiredText = {
    validate: (value: string) => Boolean(value.trim()) || t("fieldRequired"),
  }

  async function createAccount(values: CreateAdminFields) {
    const created = await mutate(
      () =>
        createAdmin(values.name.trim(), values.email.trim(), values.password),
      t("adminCreated")
    )
    if (created) form.reset()
  }

  return (
    <AdminSection title={t("addAdmin")}>
      <form
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        onSubmit={form.handleSubmit(createAccount)}
      >
        <Controller
          control={form.control}
          name="name"
          rules={requiredText}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="new-admin-name">{t("name")}</FieldLabel>
              <Input
                {...field}
                id="new-admin-name"
                aria-invalid={fieldState.invalid}
              />
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
              <FieldLabel htmlFor="new-admin-password">
                {t("initialPassword")}
              </FieldLabel>
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
        <Button className="self-end" disabled={working}>
          <Plus />
          {t("addAccount")}
        </Button>
      </form>
    </AdminSection>
  )
}
