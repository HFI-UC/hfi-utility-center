"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import { editAdmin } from "@/lib/api/admins"
import type { Admin } from "@/lib/api/types"

type EditAdminFields = { name: string; email: string }

export function EditAdminDialog({
  admin,
  mutate,
  working,
}: {
  admin: Admin
  mutate: AdminMutation
  working: boolean
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [open, setOpen] = useState(false)
  const form = useForm<EditAdminFields>({
    defaultValues: { name: admin.name, email: admin.email },
  })
  const requiredText = {
    validate: (value: string) => Boolean(value.trim()) || t("fieldRequired"),
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) form.reset({ name: admin.name, email: admin.email })
  }

  async function saveAdmin({ name, email }: EditAdminFields) {
    const saved = await mutate(
      () => editAdmin(admin.id, name.trim(), email.trim()),
      t("adminUpdated")
    )
    if (saved) setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={working}>
          <Pencil />
          {common("edit")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{common("edit")}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(saveAdmin)}>
          <Controller
            control={form.control}
            name="name"
            rules={requiredText}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`admin-name-${admin.id}`}>
                  {t("adminName")}
                </FieldLabel>
                <Input
                  {...field}
                  id={`admin-name-${admin.id}`}
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
                <FieldLabel htmlFor={`admin-email-${admin.id}`}>
                  {t("adminEmail")}
                </FieldLabel>
                <Input
                  {...field}
                  id={`admin-email-${admin.id}`}
                  type="email"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{common("cancel")}</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || working}
            >
              {common("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
