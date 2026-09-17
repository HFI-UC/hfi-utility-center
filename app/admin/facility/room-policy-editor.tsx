"use client"

import { useState } from "react"
import {
  CalendarClock,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react"
import { useTranslations } from "next-intl"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldLabel,
  Input,
} from "@/components/astryx"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import {
  createPolicy,
  deletePolicy,
  editPolicy,
  togglePolicy,
} from "@/lib/api/catalog"
import type { Room, RoomPolicy } from "@/lib/api/types"

import styles from "./facility.module.css"

type PolicyDraft = {
  days: number[]
  start: string
  end: string
}

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

  function toggleDay(day: number) {
    setDraft((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((item) => item !== day)
        : [...current.days, day].sort((a, b) => a - b),
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
        ? () =>
            editPolicy(
              editingId,
              draft.days,
              parseTime(draft.start),
              parseTime(draft.end)
            )
        : () =>
            createPolicy(
              room.id,
              draft.days,
              parseTime(draft.start),
              parseTime(draft.end)
            )
      const saved = await mutate(
        action,
        editingId ? t("policyUpdated") : t("policyCreated")
      )
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
        <button
          type="button"
          className={`${styles.secondaryButton} ${styles.policyLauncher}`}
        >
          <CalendarClock />
          {t("roomPolicies")} · {room.policies.length}
        </button>
      </DialogTrigger>
      <DialogContent className={`${styles.dialog} ${styles.dialogWide}`}>
        <DialogHeader className={styles.dialogHeader}>
          <DialogTitle>
            {room.name} · {t("roomPolicies")}
          </DialogTitle>
          <DialogDescription>{t("policyDialogDescription")}</DialogDescription>
        </DialogHeader>

        <form className={styles.policyForm} onSubmit={submit}>
          <Field>
            <FieldLabel>{t("selectDay")}</FieldLabel>
            <div className={styles.weekdays}>
              {weekdays.map((weekday, index) => {
                const selected = draft.days.includes(index)
                return (
                  <button
                    key={`${weekday}-${index}`}
                    type="button"
                    className={`${styles.weekday} ${selected ? styles.weekdaySelected : ""}`}
                    aria-pressed={selected}
                    onClick={() => toggleDay(index)}
                  >
                    {weekday}
                  </button>
                )
              })}
            </div>
          </Field>
          <div className={styles.timeFields}>
            <Field>
              <FieldLabel htmlFor={`policy-start-${room.id}`}>
                {t("policyStart")}
              </FieldLabel>
              <Input
                id={`policy-start-${room.id}`}
                className={styles.input}
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
              <FieldLabel htmlFor={`policy-end-${room.id}`}>
                {t("policyEnd")}
              </FieldLabel>
              <Input
                id={`policy-end-${room.id}`}
                className={styles.input}
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
            <div className={styles.toolbar}>
              {editingId ? (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={resetDraft}
                >
                  {common("cancel")}
                </button>
              ) : null}
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={working || saving}
              >
                {editingId ? <Pencil /> : <Plus />}
                {editingId ? common("save") : common("add")}
              </button>
            </div>
          </div>
          {error ? <p className={styles.error}>{error}</p> : null}
        </form>

        <div className={styles.policyList}>
          {room.policies.length ? (
            room.policies.map((policy) => (
              <div className={styles.policyItem} key={policy.id}>
                <div>
                  <div className={styles.policyDays}>
                    {policy.days.map((day) => weekdays[day]).join("、")}
                  </div>
                  <div className={styles.policyTime}>
                    {formatTime(policy.startTime)}–{formatTime(policy.endTime)}
                  </div>
                </div>
                <span
                  className={`${styles.status} ${
                    policy.enabled ? styles.statusOn : styles.statusOff
                  }`}
                >
                  {policy.enabled ? common("enabled") : common("disabled")}
                </span>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    disabled={working}
                    onClick={() => editExisting(policy)}
                  >
                    <Pencil />
                    {common("edit")}
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    disabled={working}
                    onClick={() =>
                      mutate(() => togglePolicy(policy.id), t("policyUpdated"))
                    }
                  >
                    {policy.enabled ? <PowerOff /> : <Power />}
                    {policy.enabled ? common("disabled") : common("enabled")}
                  </button>
                  <PolicyDeleteDialog
                    policy={policy}
                    mutate={mutate}
                    working={working}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className={styles.empty}>{t("policiesEmpty")}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PolicyDeleteDialog({
  policy,
  mutate,
  working,
}: {
  policy: RoomPolicy
  mutate: AdminMutation
  working: boolean
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")

  async function remove() {
    setError("")
    try {
      if (await mutate(() => deletePolicy(policy.id), t("policyDeleted"))) {
        setOpen(false)
      }
    } catch {
      setError(common("unknown"))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={working}
        >
          <Trash2 />
          {common("delete")}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className={styles.dialog}>
        <AlertDialogHeader className={styles.dialogHeader}>
          <AlertDialogTitle>{t("deletePolicy")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("confirmDelete", { name: t("roomPolicies") })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <p className={styles.error}>{error}</p> : null}
        <AlertDialogFooter className={styles.dialogActions}>
          <AlertDialogCancel className={styles.secondaryButton}>
            {common("cancel")}
          </AlertDialogCancel>
          <button
            type="button"
            className={styles.dangerButton}
            disabled={working}
            onClick={remove}
          >
            <Trash2 />
            {common("delete")}
          </button>
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
