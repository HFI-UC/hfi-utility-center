"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"

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
  const { errors } = form.formState
  const requiredText = {
    validate: (value: string) => Boolean(value.trim()) || t("fieldRequired"),
  }

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
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor={`admin-name-${admin.id}`}>
              {t("adminName")}
            </FieldLabel>
            <Input
              {...form.register("name", requiredText)}
              id={`admin-name-${admin.id}`}
              aria-invalid={Boolean(errors.name)}
            />
            <FieldError errors={[errors.name]} />
          </Field>
          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor={`admin-email-${admin.id}`}>
              {t("adminEmail")}
            </FieldLabel>
            <Input
              {...form.register("email", requiredText)}
              id={`admin-email-${admin.id}`}
              type="email"
              aria-invalid={Boolean(errors.email)}
            />
            <FieldError errors={[errors.email]} />
          </Field>
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
