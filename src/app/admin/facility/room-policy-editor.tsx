"use client"

import {
  CalendarClock,
  Ellipsis,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RotateCcw,
  Trash2,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { EmptyState } from "@/components/layout/data-state"
import {
  AlertDialog,
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import { createPolicy, deletePolicy, editPolicy, togglePolicy } from "@/lib/api/catalog"
import type { Room, RoomPolicy } from "@/lib/api/types"

import { IconHint, StateDot, iconTouchTarget, touchTarget } from "./facility-editor-actions"

type PolicyDraft = {
  days: number[]
  start: string
  end: string
}

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const

const defaultDraft: PolicyDraft = {
  days: [1, 2, 3, 4, 5],
  start: "08:00",
  end: "18:00",
}

export function PolicyEditor({
  room,
  mutate,
  working,
}: {
  room: Room
  mutate: AdminMutation
  working: boolean
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const weekdays = t("policyWeekdays").split(",")
  const [draft, setDraft] = useState<PolicyDraft>(defaultDraft)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function resetDraft() {
    setDraft(defaultDraft)
    setEditingId(null)
    setError("")
  }

  function editExisting(policy: RoomPolicy) {
    setEditingId(policy.id)
    setDraft({
      days: [...policy.days],
      start: formatTime(policy.startTime),
      end: formatTime(policy.endTime),
    })
    setError("")
  }

  function toggleDays(values: string[]) {
    setDraft((current) => ({
      ...current,
      days: values.map(Number).sort((a, b) => a - b),
    }))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!draft.days.length) {
      setError(t("fieldRequired"))
      return
    }
    if (timeInMinutes(draft.end) <= timeInMinutes(draft.start)) {
      setError(t("policyEndAfterStart"))
      return
    }

    setSaving(true)
    setError("")
    try {
      const action = editingId
        ? () => editPolicy(editingId, draft.days, parseTime(draft.start), parseTime(draft.end))
        : () => createPolicy(room.id, draft.days, parseTime(draft.start), parseTime(draft.end))
      const saved = await mutate(action, editingId ? t("policyUpdated") : t("policyCreated"))
      if (saved) resetDraft()
    } catch {
      setError(common("unknown"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog onOpenChange={(open) => !open && resetDraft()}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={`${touchTarget} -ml-2 max-w-full`}>
          <CalendarClock aria-hidden />
          <span className="truncate">
            {t("roomPolicies")} · {room.policies.length}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {room.name} · {t("roomPolicies")}
          </DialogTitle>
          <DialogDescription>{t("policyDialogDescription")}</DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={submit}>
          <Field>
            <FieldLabel>{t("selectDay")}</FieldLabel>
            <ToggleGroup
              type="multiple"
              variant="outline"
              value={draft.days.map(String)}
              onValueChange={toggleDays}
              className="grid w-full grid-cols-4 sm:grid-cols-7"
            >
              {weekdays.map((weekday, day) => (
                <ToggleGroupItem
                  key={WEEKDAY_KEYS[day] ?? weekday}
                  value={String(day)}
                  aria-label={weekday}
                  className="min-h-11"
                >
                  {weekday}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {error ? <FieldError>{error}</FieldError> : null}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor={`policy-start-${room.id}`}>{t("policyStart")}</FieldLabel>
              <Input
                id={`policy-start-${room.id}`}
                type="time"
                value={draft.start}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    start: event.target.value,
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`policy-end-${room.id}`}>{t("policyEnd")}</FieldLabel>
              <Input
                id={`policy-end-${room.id}`}
                type="time"
                value={draft.end}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    end: event.target.value,
                  }))
                }
              />
            </Field>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {editingId ? (
              <IconHint label={common("cancel")}>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={common("cancel")}
                  onClick={resetDraft}
                  className={iconTouchTarget}
                >
                  <RotateCcw />
                </Button>
              </IconHint>
            ) : null}
            <Button type="submit" disabled={working || saving} className={touchTarget}>
              {editingId ? <Pencil aria-hidden /> : <Plus aria-hidden />}
              {editingId ? common("save") : common("add")}
            </Button>
          </div>
        </form>

        {room.policies.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title={t("roomPolicies")}
            description={t("policiesEmpty")}
          />
        ) : (
          <ul className="divide-y divide-border">
            {room.policies.map((policy) => (
              <li key={policy.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium break-words">
                    {policy.days.map((day) => weekdays[day]).join("、")}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatTime(policy.startTime)}–{formatTime(policy.endTime)}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StateDot
                    enabled={policy.enabled}
                    label={policy.enabled ? common("enabled") : common("disabled")}
                  />
                  <PolicyRowMenu
                    policy={policy}
                    mutate={mutate}
                    working={working}
                    onEdit={() => editExisting(policy)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}

function PolicyRowMenu({
  policy,
  mutate,
  working,
  onEdit,
}: {
  policy: RoomPolicy
  mutate: AdminMutation
  working: boolean
  onEdit: () => void
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("actions")}
            disabled={working}
            className="size-11 sm:size-7"
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem onSelect={onEdit} disabled={working}>
            <Pencil aria-hidden />
            {common("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={working}
            onSelect={() => mutate(() => togglePolicy(policy.id), t("policyUpdated"))}
          >
            {policy.enabled ? <PowerOff aria-hidden /> : <Power aria-hidden />}
            {policy.enabled ? common("disabled") : common("enabled")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={working}
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 aria-hidden />
            {common("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <PolicyDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        policy={policy}
        mutate={mutate}
        working={working}
      />
    </>
  )
}

function PolicyDeleteDialog({
  open,
  onOpenChange,
  policy,
  mutate,
  working,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  policy: RoomPolicy
  mutate: AdminMutation
  working: boolean
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [error, setError] = useState("")

  async function remove() {
    setError("")
    try {
      if (await mutate(() => deletePolicy(policy.id), t("policyDeleted"))) {
        onOpenChange(false)
      }
    } catch {
      setError(common("unknown"))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deletePolicy")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("confirmDelete", { name: t("roomPolicies") })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <FieldError>{error}</FieldError> : null}
        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost" className={touchTarget}>
            {common("cancel")}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={working}
            onClick={remove}
            className={touchTarget}
          >
            <Trash2 aria-hidden />
            {common("delete")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function parseTime(value: string): [number, number] {
  const [hours, minutes] = value.split(":").map(Number)
  return [hours, minutes]
}

function timeInMinutes(value: string) {
  const [hours, minutes] = parseTime(value)
  return hours * 60 + minutes
}

function formatTime([hour, minute]: number[]) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}
