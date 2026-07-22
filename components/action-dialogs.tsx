"use client"

import { useId, useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ConfirmAction({
  children,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onConfirm,
}: {
  children: React.ReactNode
  title: string
  description: string
  cancelLabel: string
  confirmLabel: string
  onConfirm: () => Promise<void> | void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => void onConfirm()}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

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
  onSave: (value: string) => Promise<void> | void
}) {
  const [open, setOpen] = useState(false)
  const inputId = useId()
  const form = useForm<{ value: string }>({
    defaultValues: { value: initialValue },
  })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) form.reset({ value: initialValue })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{label}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(async ({ value }) => {
            await onSave(value.trim())
            setOpen(false)
          })}
        >
          <div className="space-y-2">
            <Label htmlFor={inputId}>{label}</Label>
            <Input
              id={inputId}
              type={inputType}
              autoFocus
              {...form.register("value", {
                required: true,
                minLength: inputType === "password" ? 6 : 1,
              })}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {cancelLabel}
              </Button>
            </DialogClose>
            <Button type="submit">{saveLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
