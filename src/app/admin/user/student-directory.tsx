"use client"

import { Pencil, Plus, Trash2, UsersRound } from "lucide-react"
import { useTranslations } from "next-intl"
import { useCallback, useEffect, useState, type FormEvent } from "react"

import { ErrorState, LoadingState } from "@/components/layout/data-state"
import { SectionCard } from "@/components/layout/section-card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getClasses } from "@/lib/api/catalog"
import {
  createStudent,
  deleteStudent,
  editStudent,
  getStudents,
  type StudentInput,
  type StudentRecord,
} from "@/lib/api/students"
import type { SchoolClass } from "@/lib/api/types"

const EMPTY_STUDENT: StudentInput = { email: "", name: "", classId: null }

export function StudentDirectory() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [query, setQuery] = useState("")
  const [editor, setEditor] = useState<"create" | "edit" | null>(null)
  const [draft, setDraft] = useState<StudentInput>(EMPTY_STUDENT)
  const [actionError, setActionError] = useState("")
  const [working, setWorking] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<StudentRecord | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const [records, availableClasses] = await Promise.all([getStudents(), getClasses()])
      setStudents(records)
      setClasses(availableClasses)
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    void Promise.all([getStudents(), getClasses()])
      .then(([records, availableClasses]) => {
        if (!active) return
        setStudents(records)
        setClasses(availableClasses)
      })
      .catch(() => {
        if (active) setLoadError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const needle = query.trim().toLowerCase()
  const matches = students.filter((student) =>
    [student.email, student.name, student.className ?? ""].some((value) =>
      value.toLowerCase().includes(needle),
    ),
  )
  const visible = matches.slice(0, 100)

  function openCreate() {
    setDraft(EMPTY_STUDENT)
    setActionError("")
    setEditor("create")
  }

  function openEdit(student: StudentRecord) {
    setDraft({ email: student.email, name: student.name, classId: student.classId })
    setActionError("")
    setEditor("edit")
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (working || !editor) return
    setWorking(true)
    setActionError("")
    try {
      const input = {
        email: draft.email.trim().toLowerCase(),
        name: draft.name.trim(),
        classId: draft.classId,
      }
      if (editor === "create") await createStudent(input)
      else await editStudent(input)
      setEditor(null)
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : common("unknown"))
    } finally {
      setWorking(false)
    }
  }

  async function remove() {
    if (working || !deleteTarget) return
    setWorking(true)
    setActionError("")
    try {
      await deleteStudent(deleteTarget.email)
      setDeleteTarget(null)
      await load()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : common("unknown"))
    } finally {
      setWorking(false)
    }
  }

  return (
    <SectionCard
      title={t("studentsTitle")}
      description={t("studentsDescription")}
      actions={
        <Button type="button" size="sm" disabled={loading || working} onClick={openCreate}>
          <Plus />
          {t("addStudent")}
        </Button>
      }
    >
      {loading ? (
        <LoadingState label={t("studentsLoading")} />
      ) : loadError ? (
        <ErrorState
          title={t("studentsLoadError")}
          retryLabel={common("refresh")}
          onRetry={() => void load()}
        />
      ) : (
        <div className="space-y-3">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("studentSearch")}
            aria-label={t("studentSearch")}
            className="max-w-sm"
          />
          <p className="text-xs text-muted-foreground">
            {t("studentsShown", { shown: visible.length, count: matches.length })}
          </p>
          {visible.length ? (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {visible.map((student) => (
                <li
                  key={student.email}
                  className="flex flex-wrap items-center justify-between gap-3 p-3"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <UsersRound
                      aria-hidden
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    />
                    <div className="min-w-0 text-sm">
                      <p className="font-medium">{student.name}</p>
                      <p className="break-all text-muted-foreground">{student.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {student.className || t("studentNoClass")}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t("editStudent", { name: student.name })}
                      disabled={working}
                      onClick={() => openEdit(student)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t("deleteStudent", { name: student.name })}
                      disabled={working}
                      onClick={() => {
                        setActionError("")
                        setDeleteTarget(student)
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {t("studentsEmpty")}
            </p>
          )}
        </div>
      )}

      <Dialog open={editor !== null} onOpenChange={(open) => !open && !working && setEditor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editor === "edit" ? t("editStudentTitle") : t("addStudent")}</DialogTitle>
            <DialogDescription>{t("studentEditorDescription")}</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void save(event)}>
            <div className="space-y-2">
              <label htmlFor="student-email" className="text-sm font-medium">
                {t("email")}
              </label>
              <Input
                id="student-email"
                type="email"
                required
                value={draft.email}
                readOnly={editor === "edit"}
                onChange={(event) => setDraft({ ...draft, email: event.target.value })}
              />
              {editor === "edit" ? (
                <p className="text-xs text-muted-foreground">{t("studentEmailLocked")}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label htmlFor="student-name" className="text-sm font-medium">
                {t("name")}
              </label>
              <Input
                id="student-name"
                required
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="student-class" className="text-sm font-medium">
                {t("class")}
              </label>
              <Select
                value={draft.classId === null ? "none" : String(draft.classId)}
                onValueChange={(value) =>
                  setDraft({ ...draft, classId: value === "none" ? null : Number(value) })
                }
              >
                <SelectTrigger id="student-class" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("studentNoClass")}</SelectItem>
                  {classes.map((schoolClass) => (
                    <SelectItem key={schoolClass.id} value={String(schoolClass.id)}>
                      {schoolClass.name}
                    </SelectItem>
                  ))}
                  {draft.classId !== null && !classes.some((item) => item.id === draft.classId) ? (
                    <SelectItem value={String(draft.classId)} disabled>
                      {t("studentArchivedClass")}
                    </SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            </div>
            {actionError && editor ? (
              <p role="alert" className="text-sm text-destructive">
                {actionError}
              </p>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={working}
                onClick={() => setEditor(null)}
              >
                {common("cancel")}
              </Button>
              <Button type="submit" disabled={working}>
                {common("save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && !working && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteStudentTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteStudentConfirm", { email: deleteTarget?.email ?? "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && deleteTarget ? (
            <p role="alert" className="text-sm text-destructive">
              {actionError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={working}>{common("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={working}
              onClick={(event) => {
                event.preventDefault()
                void remove()
              }}
            >
              {common("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SectionCard>
  )
}
