"use client"

import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import { createAdmin } from "@/lib/api/admins"

type CreateAdminFields = { name: string; email: string; password: string }

export function CreateAdminForm({
  mutate,
  workingKey,
}: {
  mutate: AdminMutation
  workingKey?: string
}) {
  const t = useTranslations("admin")
  const form = useForm<CreateAdminFields>({
    defaultValues: { name: "", email: "", password: "" },
  })
  const { errors } = form.formState
  const requiredText = {
    validate: (value: string) => Boolean(value.trim()) || t("fieldRequired"),
  }

  async function createAccount(values: CreateAdminFields) {
    const created = await mutate(
      "admin:create",
      () =>
        createAdmin(values.name.trim(), values.email.trim(), values.password),
      t("adminCreated")
    )
    if (created) form.reset()
  }

  return (
    <section className="border-b py-7">
      <h2 className="text-lg font-semibold">{t("addAdmin")}</h2>
      <form
        className="mt-4 grid gap-3 md:grid-cols-4"
        onSubmit={form.handleSubmit(createAccount)}
      >
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="new-admin-name">{t("name")}</FieldLabel>
          <Input
            {...form.register("name", requiredText)}
            id="new-admin-name"
            aria-invalid={Boolean(errors.name)}
          />
          <FieldError errors={[errors.name]} />
        </Field>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="new-admin-email">{t("email")}</FieldLabel>
          <Input
            {...form.register("email", requiredText)}
            id="new-admin-email"
            type="email"
            aria-invalid={Boolean(errors.email)}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="new-admin-password">
            {t("initialPassword")}
          </FieldLabel>
          <Input
            {...form.register("password", {
              ...requiredText,
              minLength: { value: 6, message: t("newPassword") },
            })}
            id="new-admin-password"
            type="password"
            aria-invalid={Boolean(errors.password)}
          />
          <FieldError errors={[errors.password]} />
        </Field>
        <Button className="self-end" disabled={Boolean(workingKey)}>
          <Plus />
          {t("addAccount")}
        </Button>
      </form>
    </section>
  )
}
