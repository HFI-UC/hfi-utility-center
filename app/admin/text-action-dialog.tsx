"use client"

import { useId, useState } from "react"
import { Check, KeyRound, X } from "lucide-react"
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

import styles from "./user/admin-user.module.css"

export function TextActionDialog({
  children,
  title,
  label,
  initialValue = "",
  inputType = "text",
  cancelLabel,
  saveLabel,
  onSave,
}: {
  children: React.ReactNode
  title: string
  label: string
  initialValue?: string
  inputType?: "text" | "password" | "email"
  cancelLabel: string
  saveLabel: string
  onSave: (value: string) => Promise<boolean>
}) {
  const [open, setOpen] = useState(false)
  const [actionError, setActionError] = useState(false)
  const common = useTranslations("common")
  const inputId = useId()
  const form = useForm({ defaultValues: { value: initialValue } })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && form.formState.isSubmitting) return
    setOpen(nextOpen)
    if (nextOpen) {
      setActionError(false)
      form.reset({ value: initialValue })
    }
  }

  async function saveValue({ value }: { value: string }) {
    const submittedValue = inputType === "password" ? value : value.trim()
    setActionError(false)
    try {
      const saved = await onSave(submittedValue)
      if (saved) setOpen(false)
    } catch {
      setActionError(true)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={styles.dialogSurface}>
        <DialogHeader className={styles.dialogHeader}>
          <span className={styles.dialogIcon} aria-hidden="true">
            <KeyRound />
          </span>
          <div>
            <DialogTitle className={styles.dialogTitle}>{title}</DialogTitle>
            <DialogDescription className={styles.dialogDescription}>
              {label}
            </DialogDescription>
          </div>
        </DialogHeader>
        <form
          className={styles.dialogForm}
          onSubmit={form.handleSubmit(saveValue)}
        >
          <Controller
            control={form.control}
            name="value"
            rules={{
              validate: (value) => Boolean(value.trim()) || label,
              minLength: {
                value: inputType === "password" ? 6 : 1,
                message: label,
              },
            }}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
                <Input
                  {...field}
                  id={inputId}
                  type={inputType}
                  autoFocus
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
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className={`${styles.dialogButton} admin-action-button`}
              icon={<Check />}
              disabled={form.formState.isSubmitting}
            >
              {saveLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
