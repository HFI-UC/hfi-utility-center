"use client"

import { Check, Pencil, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useErrorShake } from "@/hooks/use-error-shake"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import { editAdmin } from "@/lib/api/admins"
import type { Admin } from "@/lib/api/types"

type EditAdminFields = { name: string; email: string }

export function EditAdminDialog({
  admin,
  mutate,
  working,
  open,
  onOpenChange,
}: {
  admin: Admin
  mutate: AdminMutation
  working: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [actionError, setActionError] = useState(false)
  const form = useForm<EditAdminFields>({
    defaultValues: { name: admin.name, email: admin.email },
  })
  const { ref: formRef, shake } = useErrorShake<HTMLFormElement>()
  const requiredText = {
    validate: (value: string) => Boolean(value.trim()) || t("fieldRequired"),
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && form.formState.isSubmitting) return
    onOpenChange(nextOpen)
    if (nextOpen) {
      setActionError(false)
      form.reset({ name: admin.name, email: admin.email })
    }
  }

  async function saveAdmin({ name, email }: EditAdminFields) {
    setActionError(false)
    try {
      const saved = await mutate(
        () => editAdmin(admin.id, name.trim(), email.trim()),
        t("adminUpdated"),
      )
      if (saved) onOpenChange(false)
    } catch {
      setActionError(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Pencil aria-hidden className="size-4 shrink-0" />
            {common("edit")} · {admin.name}
          </DialogTitle>
          <DialogDescription>{admin.email}</DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          className="flex min-w-0 flex-col gap-4"
          onSubmit={form.handleSubmit(saveAdmin, shake)}
        >
          <Controller
            control={form.control}
            name="name"
            rules={requiredText}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`admin-name-${admin.id}`}>{t("adminName")}</FieldLabel>
                <Input {...field} id={`admin-name-${admin.id}`} aria-invalid={fieldState.invalid} />
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
                <FieldLabel htmlFor={`admin-email-${admin.id}`}>{t("adminEmail")}</FieldLabel>
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
          {actionError ? (
            <Alert variant="destructive">
              <AlertDescription>{common("unknown")}</AlertDescription>
            </Alert>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={form.formState.isSubmitting}>
                <X />
                {common("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={form.formState.isSubmitting || working}>
              <Check />
              {common("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
