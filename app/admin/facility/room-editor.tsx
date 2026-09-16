"use client"

import { useId, useState } from "react"
import { Pencil, Plus, Power, PowerOff } from "lucide-react"
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
import { createRoom, deleteRoom, editRoom } from "@/lib/api/catalog"
import type { Campus, Room } from "@/lib/api/types"

import {
  ConfirmFacilityDelete,
  type FacilityEditorActions,
} from "./facility-editor-actions"
import styles from "./facility.module.css"
import { PolicyEditor } from "./room-policy-editor"

export function RoomEditor({
  rooms,
  campuses,
  mutate,
  working,
}: FacilityEditorActions & {
  rooms: Room[]
  campuses: Campus[]
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const campusNames = new Map(
    campuses.map((campus) => [campus.id, campus.name])
  )
  const dateFormatter = new Intl.DateTimeFormat(useLocale(), {
    dateStyle: "medium",
  })

  return (
    <AdminSection
      title={t("rooms")}
      className={styles.roomSection}
      action={
        <RoomDialog
          mode="create"
          campuses={campuses}
          working={working}
          onSave={(name, campus) =>
            mutate(() => createRoom(name, campus), t("roomCreated"))
          }
        />
      }
    >
      <p className={styles.sectionIntro}>{t("policyDialogDescription")}</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("campus")}</TableHead>
            <TableHead>{t("roomPolicies")}</TableHead>
            <TableHead className="hidden xl:table-cell">
              {t("createdAt")}
            </TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.length ? (
            rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell className="font-medium">
                  {room.name}
                  <span className="ml-2 text-xs text-[var(--color-text-secondary)]">
                    #{room.id}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`${styles.status} ${
                      room.enabled ? styles.statusOn : styles.statusOff
                    }`}
                  >
                    {room.enabled ? common("enabled") : common("disabled")}
                  </span>
                </TableCell>
                <TableCell>{campusNames.get(room.campus) ?? "—"}</TableCell>
                <TableCell>
                  <PolicyEditor room={room} mutate={mutate} working={working} />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {room.createdAt
                    ? dateFormatter.format(new Date(room.createdAt))
                    : "—"}
                </TableCell>
                <TableCell>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      disabled={working}
                      onClick={() =>
                        mutate(
                          () =>
                            editRoom(
                              room.id,
                              room.name,
                              room.campus,
                              !room.enabled
                            ),
                          t("roomStatusUpdated")
                        )
                      }
                    >
                      {room.enabled ? <PowerOff /> : <Power />}
                      {room.enabled ? t("roomClosed") : t("restoreBooking")}
                    </button>
                    <RoomDialog
                      mode="edit"
                      room={room}
                      campuses={campuses}
                      working={working}
                      onSave={(name, campus) =>
                        mutate(
                          () => editRoom(room.id, name, campus, room.enabled),
                          t("roomUpdated")
                        )
                      }
                    />
                    <ConfirmFacilityDelete
                      label={room.name}
                      action={() => deleteRoom(room.id)}
                      mutate={mutate}
                      working={working}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>
                <div className={styles.empty}>{t("roomsEmpty")}</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </AdminSection>
  )
}

function RoomDialog({
  mode,
  room,
  campuses,
  working,
  onSave,
}: {
  mode: "create" | "edit"
  room?: Room
  campuses: Campus[]
  working: boolean
  onSave: (name: string, campus: number) => Promise<boolean>
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const nameId = useId()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(room?.name ?? "")
  const [campus, setCampus] = useState(room ? String(room.campus) : "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setName(room?.name ?? "")
      setCampus(room ? String(room.campus) : "")
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
            {mode === "create" ? t("newRoom") : t("renameRoom")}
          </DialogTitle>
          <DialogDescription>{t("roomName")}</DialogDescription>
        </DialogHeader>
        <form className={styles.form} onSubmit={submit}>
          <Field>
            <FieldLabel htmlFor={nameId}>{t("roomName")}</FieldLabel>
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
