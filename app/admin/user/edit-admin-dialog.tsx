"use client"

import { useState } from "react"
import { Check, Pencil, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/astryx"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/astryx"
import { Field, FieldError, FieldLabel } from "@/components/astryx"
import { Input } from "@/components/astryx"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import { editAdmin } from "@/lib/api/admins"
import type { Admin } from "@/lib/api/types"

import styles from "./admin-user.module.css"

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
  const [actionError, setActionError] = useState(false)
  const form = useForm<EditAdminFields>({
    defaultValues: { name: admin.name, email: admin.email },
  })
  const requiredText = {
    validate: (value: string) => Boolean(value.trim()) || t("fieldRequired"),
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && form.formState.isSubmitting) return
    setOpen(nextOpen)
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
        t("adminUpdated")
      )
      if (saved) setOpen(false)
    } catch {
      setActionError(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={styles.actionButton}
          disabled={working}
          icon={<Pencil />}
        >
          {common("edit")}
        </Button>
      </DialogTrigger>
      <DialogContent className={styles.dialogSurface}>
        <DialogHeader className={styles.dialogHeader}>
          <span className={styles.dialogIcon} aria-hidden="true">
            <Pencil />
          </span>
          <div>
            <DialogTitle className={styles.dialogTitle}>
              {common("edit")} · {admin.name}
            </DialogTitle>
            <DialogDescription className={styles.dialogDescription}>
              {admin.email}
            </DialogDescription>
          </div>
        </DialogHeader>
        <form
          className={styles.dialogForm}
          onSubmit={form.handleSubmit(saveAdmin)}
        >
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
                  className={styles.dialogInput}
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
                  className={styles.dialogInput}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          {actionError ? (
            <p className={styles.formError} role="alert">
              {common("unknown")}
            </p>
          ) : null}
          <DialogFooter className={styles.dialogFooter}>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className={`${styles.dialogButton} admin-action-button`}
                icon={<X />}
                disabled={form.formState.isSubmitting}
              >
                {common("cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className={`${styles.dialogButton} admin-action-button`}
              icon={<Check />}
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
