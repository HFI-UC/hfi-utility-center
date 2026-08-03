"use client"

import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { AdminMutation } from "@/features/admin/use-admin-mutation"
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

  async function createAccount(values: CreateAdminFields) {
    const created = await mutate(
      "admin:create",
      () => createAdmin(values.name, values.email, values.password),
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
        {(["name", "email", "password"] as const).map((name) => (
          <Controller
            key={name}
            control={form.control}
            name={name}
            rules={{
              required: t("fieldRequired"),
              minLength: name === "password" ? 6 : undefined,
            }}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`new-admin-${name}`}>
                  {t(name === "password" ? "initialPassword" : name)}
                </FieldLabel>
                <Input
                  {...field}
                  id={`new-admin-${name}`}
                  type={inputType(name)}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        ))}
        <Button className="self-end" disabled={Boolean(workingKey)}>
          <Plus />
          {t("addAccount")}
        </Button>
      </form>
    </section>
  )
}

function inputType(name: keyof CreateAdminFields) {
  if (name === "password") return "password"
  if (name === "email") return "email"
  return "text"
}
