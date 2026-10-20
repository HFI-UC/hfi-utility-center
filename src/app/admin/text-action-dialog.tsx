"use client"

import { Check, KeyRound, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useState } from "react"
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

export function TextActionDialog({
  open,
  onOpenChange,
  title,
  label,
  initialValue = "",
  inputType = "text",
  cancelLabel,
  saveLabel,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  label: string
  initialValue?: string
  inputType?: "text" | "password" | "email"
  cancelLabel: string
  saveLabel: string
  onSave: (value: string) => Promise<boolean>
}) {
  const [actionError, setActionError] = useState(false)
  const common = useTranslations("common")
  const inputId = useId()
  const form = useForm({ defaultValues: { value: initialValue } })
  const { ref: formRef, shake } = useErrorShake<HTMLFormElement>()

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && form.formState.isSubmitting) return
    onOpenChange(nextOpen)
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
            <KeyRound aria-hidden className="size-4 shrink-0" />
            {title}
          </DialogTitle>
          <DialogDescription>{label}</DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          className="flex min-w-0 flex-col gap-4"
          onSubmit={form.handleSubmit(saveValue, shake)}
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
                {/* Dialogs should focus their first field; the rule cannot see it from JSX. */}
                {/* oxlint-disable jsx-a11y/no-autofocus */}
                <Input
                  {...field}
                  id={inputId}
                  type={inputType}
                  autoFocus
                  aria-invalid={fieldState.invalid}
                />
                {/* oxlint-enable jsx-a11y/no-autofocus */}
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
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              <Check />
              {saveLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
