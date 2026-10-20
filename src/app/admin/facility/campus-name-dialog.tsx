"use client"

import { useTranslations } from "next-intl"
import { useId, useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Campus } from "@/lib/api/types"

import { DialogFormActions } from "./facility-editor-actions"

export function CampusNameDialog({
  open,
  onOpenChange,
  mode,
  title,
  description,
  nameLabel,
  campuses,
  initialName = "",
  initialCampus = "",
  working,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  title: string
  description: string
  nameLabel: string
  campuses: Campus[]
  initialName?: string
  initialCampus?: string
  working: boolean
  onSave: (name: string, campus: number) => Promise<boolean>
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const nameId = useId()
  const campusId = useId()
  const [name, setName] = useState(initialName)
  const [campus, setCampus] = useState(initialCampus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setName(initialName)
      setCampus(initialCampus)
      setError("")
    }
    onOpenChange(nextOpen)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || !campus) {
      setError(t("fieldRequired"))
      return
    }
    setSaving(true)
    setError("")
    try {
      if (await onSave(name.trim(), Number(campus))) onOpenChange(false)
    } catch {
      setError(common("unknown"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <Field>
            <FieldLabel htmlFor={nameId}>{nameLabel}</FieldLabel>
            {/* Dialogs should focus their first field; the rule cannot see it from JSX. */}
            {/* oxlint-disable jsx-a11y/no-autofocus */}
            <Input
              id={nameId}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
            {/* oxlint-enable jsx-a11y/no-autofocus */}
          </Field>
          <Field>
            <FieldLabel htmlFor={campusId}>{t("selectCampus")}</FieldLabel>
            <Select value={campus || undefined} onValueChange={setCampus}>
              <SelectTrigger id={campusId} className="w-full">
                <SelectValue placeholder={t("selectCampus")} />
              </SelectTrigger>
              <SelectContent>
                {campuses.map((item) => (
                  <SelectItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error ? <FieldError>{error}</FieldError> : null}
          </Field>
          <DialogFormActions mode={mode} disabled={working || saving} />
        </form>
      </DialogContent>
    </Dialog>
  )
}
