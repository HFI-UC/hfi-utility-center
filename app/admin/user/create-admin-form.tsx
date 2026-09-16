"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"

import { AdminSection } from "@/app/admin/admin-shell"
import { Button } from "@/components/astryx"
import { Field, FieldError, FieldLabel } from "@/components/astryx"
import { Input } from "@/components/astryx"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import { createAdmin } from "@/lib/api/admins"

import styles from "./admin-user.module.css"

type CreateAdminFields = { name: string; email: string; password: string }

export function CreateAdminForm({
  mutate,
  working,
}: {
  mutate: AdminMutation
  working: boolean
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [actionError, setActionError] = useState(false)
  const form = useForm<CreateAdminFields>({
    defaultValues: { name: "", email: "", password: "" },
  })
  const requiredText = {
    validate: (value: string) => Boolean(value.trim()) || t("fieldRequired"),
  }

  async function createAccount(values: CreateAdminFields) {
    setActionError(false)
    try {
      const created = await mutate(
        () =>
          createAdmin(values.name.trim(), values.email.trim(), values.password),
        t("adminCreated")
      )
      if (created) form.reset()
    } catch {
      setActionError(true)
    }
  }

  return (
    <AdminSection title={t("addAdmin")}>
      <form
        className={styles.createForm}
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
        <Button
          className={styles.createAction}
          disabled={working || form.formState.isSubmitting}
          icon={<Plus />}
        >
          {t("addAccount")}
        </Button>
        {actionError ? (
          <p className={styles.formError} role="alert">
            {common("unknown")}
          </p>
        ) : null}
      </form>
    </AdminSection>
  )
}
