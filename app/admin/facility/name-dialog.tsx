"use client"

import { useId, useState } from "react"
import { Pencil, Plus } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  Input,
} from "@/components/astryx"

import styles from "./facility.module.css"

export function FacilityNameDialog({
  mode,
  title,
  label,
  initialValue = "",
  working,
  onSave,
}: {
  mode: "create" | "edit"
  title: string
  label: string
  initialValue?: string
  working: boolean
  onSave: (value: string) => Promise<boolean>
}) {
  const common = useTranslations("common")
  const inputId = useId()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValue(initialValue)
      setError("")
    }
    setOpen(nextOpen)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const normalized = value.trim()
    if (!normalized) {
      setError(label)
      return
    }
    setSaving(true)
    setError("")
    try {
      if (await onSave(normalized)) setOpen(false)
    } catch {
      setError(common("unknown"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={
            mode === "create" ? styles.primaryButton : styles.secondaryButton
          }
          disabled={working}
        >
          {mode === "create" ? <Plus /> : <Pencil />}
          {mode === "create" ? common("add") : common("edit")}
        </button>
      </DialogTrigger>
      <DialogContent className={styles.dialog}>
        <DialogHeader className={styles.dialogHeader}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{label}</DialogDescription>
        </DialogHeader>
        <form className={styles.form} onSubmit={submit}>
          <Field>
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
            <Input
              id={inputId}
              className={styles.input}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoFocus
            />
          </Field>
          {error ? <p className={styles.error}>{error}</p> : null}
          <DialogFooter className={styles.dialogActions}>
            <DialogClose asChild>
              <button type="button" className={styles.secondaryButton}>
                {common("cancel")}
              </button>
            </DialogClose>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={working || saving}
            >
              {mode === "create" ? <Plus /> : <Pencil />}
              {mode === "create" ? common("add") : common("save")}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
