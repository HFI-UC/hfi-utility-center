"use client"

import { useId, useState } from "react"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

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
  const inputId = useId()
  const form = useForm({ defaultValues: { value: initialValue } })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) form.reset({ value: initialValue })
  }

  async function saveValue({ value }: { value: string }) {
    const submittedValue = inputType === "password" ? value : value.trim()
    const saved = await onSave(submittedValue)
    if (saved) setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{label}</DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={form.handleSubmit(saveValue)}>
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
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{cancelLabel}</Button>
            </DialogClose>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {saveLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
