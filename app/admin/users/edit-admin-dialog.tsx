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
import type { AdminMutation } from "@/features/admin/use-admin-mutation"
import { editAdmin } from "@/lib/api/admins"
import type { Admin } from "@/lib/api/types"

type EditAdminFields = { name: string; email: string }

export function EditAdminDialog({
  admin,
  mutate,
  workingKey,
}: {
  admin: Admin
  mutate: AdminMutation
  workingKey?: string
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [open, setOpen] = useState(false)
  const mutationKey = `admin:${admin.id}:edit`
  const form = useForm<EditAdminFields>({
    defaultValues: { name: admin.name, email: admin.email },
  })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) form.reset({ name: admin.name, email: admin.email })
  }

  async function saveAdmin({ name, email }: EditAdminFields) {
    const saved = await mutate(
      mutationKey,
      () => editAdmin(admin.id, name.trim(), email.trim()),
      t("adminUpdated")
    )
    if (saved) setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" disabled={Boolean(workingKey)}>
          <Pencil />
          {common("edit")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{common("edit")}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(saveAdmin)}>
          {(["name", "email"] as const).map((name) => (
            <Controller
              key={name}
              control={form.control}
              name={name}
              rules={{ required: t("fieldRequired") }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${field.name}-${admin.id}`}>
                    {t(name === "name" ? "adminName" : "adminEmail")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${field.name}-${admin.id}`}
                    type={name === "email" ? "email" : "text"}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          ))}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {common("cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || Boolean(workingKey)}
            >
              {common("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
