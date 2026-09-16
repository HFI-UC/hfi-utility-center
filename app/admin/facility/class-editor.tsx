"use client"

import { useId, useState } from "react"
import { Pencil, Plus } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { AdminSection } from "@/app/admin/admin-shell"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/astryx"
import { createClass, deleteClass, editClass } from "@/lib/api/catalog"
import type { Campus, SchoolClass } from "@/lib/api/types"

import {
  ConfirmFacilityDelete,
  type FacilityEditorActions,
} from "./facility-editor-actions"
import styles from "./facility.module.css"

export function ClassEditor({
  classes,
  campuses,
  mutate,
  working,
}: FacilityEditorActions & {
  classes: SchoolClass[]
  campuses: Campus[]
}) {
  const t = useTranslations("admin")
  const campusNames = new Map(
    campuses.map((campus) => [campus.id, campus.name])
  )
  const dateFormatter = new Intl.DateTimeFormat(useLocale(), {
    dateStyle: "medium",
  })

  return (
    <AdminSection
      title={t("classes")}
      action={
        <ClassDialog
          mode="create"
          campuses={campuses}
          working={working}
          onSave={(name, campus) =>
            mutate(() => createClass(name, campus), t("classCreated"))
          }
        />
      }
    >
      <p className={styles.sectionIntro}>{t("newClassDescription")}</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("campus")}</TableHead>
            <TableHead className="hidden md:table-cell">
              {t("createdAt")}
            </TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.length ? (
            classes.map((schoolClass) => (
              <TableRow key={schoolClass.id}>
                <TableCell className="font-medium">
                  {schoolClass.name}
                  <span className="ml-2 text-xs text-[var(--color-text-secondary)]">
                    #{schoolClass.id}
                  </span>
                </TableCell>
                <TableCell>
                  {campusNames.get(schoolClass.campus) ?? "—"}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {schoolClass.createdAt
                    ? dateFormatter.format(new Date(schoolClass.createdAt))
                    : "—"}
                </TableCell>
                <TableCell>
                  <div className={styles.rowActions}>
                    <ClassDialog
                      mode="edit"
                      schoolClass={schoolClass}
                      campuses={campuses}
                      working={working}
                      onSave={(name, campus) =>
                        mutate(
                          () => editClass(schoolClass.id, name, campus),
                          t("classUpdated")
                        )
                      }
                    />
                    <ConfirmFacilityDelete
                      label={schoolClass.name}
                      action={() => deleteClass(schoolClass.id)}
                      mutate={mutate}
                      working={working}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4}>
                <div className={styles.empty}>{t("classesEmpty")}</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </AdminSection>
  )
}

function ClassDialog({
  mode,
  schoolClass,
  campuses,
  working,
  onSave,
}: {
  mode: "create" | "edit"
  schoolClass?: SchoolClass
  campuses: Campus[]
  working: boolean
  onSave: (name: string, campus: number) => Promise<boolean>
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const nameId = useId()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(schoolClass?.name ?? "")
  const [campus, setCampus] = useState(
    schoolClass ? String(schoolClass.campus) : ""
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setName(schoolClass?.name ?? "")
      setCampus(schoolClass ? String(schoolClass.campus) : "")
      setError("")
    }
    setOpen(nextOpen)
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
      if (await onSave(name.trim(), Number(campus))) setOpen(false)
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
          disabled={working || campuses.length === 0}
        >
          {mode === "create" ? <Plus /> : <Pencil />}
          {mode === "create" ? common("add") : common("edit")}
        </button>
      </DialogTrigger>
      <DialogContent className={styles.dialog}>
        <DialogHeader className={styles.dialogHeader}>
          <DialogTitle>
            {mode === "create" ? t("newClass") : t("renameClass")}
          </DialogTitle>
          <DialogDescription>{t("newClassDescription")}</DialogDescription>
        </DialogHeader>
        <form className={styles.form} onSubmit={submit}>
          <Field>
            <FieldLabel htmlFor={nameId}>{t("className")}</FieldLabel>
            <Input
              id={nameId}
              className={styles.input}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
          </Field>
          <Field>
            <FieldLabel>{t("selectCampus")}</FieldLabel>
            <select
              className={`${styles.input} ${styles.nativeSelect}`}
              value={campus}
              onChange={(event) => setCampus(event.target.value)}
            >
              <option value="" disabled>
                {t("selectCampus")}
              </option>
              {campuses.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
            </select>
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
