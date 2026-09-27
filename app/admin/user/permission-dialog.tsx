"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/astryx"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import {
  getAdminPermissions,
  updateAdminPermissions,
  type AdminPermission,
} from "@/lib/api/admins"
import { getRooms } from "@/lib/api/catalog"
import type { Admin, Room } from "@/lib/api/types"

import styles from "./admin-user.module.css"

export function PermissionDialog({
  admin,
  mutate,
  working,
}: {
  admin: Admin
  mutate: AdminMutation
  working: boolean
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [role, setRole] = useState<AdminPermission["role"]>(admin.role)
  const [roomIds, setRoomIds] = useState<number[]>([])
  const [rooms, setRooms] = useState<Room[]>([])

  async function openDialog() {
    setOpen(true)
    setLoading(true)
    setError("")
    try {
      const [permissions, availableRooms] = await Promise.all([
        getAdminPermissions(),
        getRooms(true),
      ])
      const current = permissions.find((item) => item.adminId === admin.id)
      if (!current) throw new Error(t("permissionsLoadError"))
      setRole(current.role)
      setRoomIds(current.roomIds)
      setRooms(availableRooms)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : common("unknown"))
    } finally {
      setLoading(false)
    }
  }

  async function savePermissions() {
    setSaving(true)
    setError("")
    try {
      const updated = await mutate(
        () =>
          updateAdminPermissions({
            adminId: admin.id,
            role,
            roomIds: role === "global" ? [] : roomIds,
          }),
        t("permissionsUpdated")
      )
      if (updated) setOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : common("unknown"))
    } finally {
      setSaving(false)
    }
  }

  function toggleRoom(roomId: number) {
    setRoomIds((current) =>
      current.includes(roomId)
        ? current.filter((id) => id !== roomId)
        : [...current, roomId]
    )
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        icon={<ShieldCheck />}
        className={styles.actionButton}
        disabled={working}
        onClick={() => void openDialog()}
      >
        {t("managePermissions")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={styles.dialogSurface}>
          <DialogHeader>
            <DialogTitle>{t("managePermissions")}</DialogTitle>
            <DialogDescription>
              {admin.name} · {admin.email}
            </DialogDescription>
          </DialogHeader>
          {loading ? <p>{t("permissionsLoading")}</p> : null}
          {!loading && !error ? (
            <div className="space-y-4">
              <fieldset className="space-y-2">
                <legend className="font-medium">{t("adminRole")}</legend>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`role-${admin.id}`}
                    checked={role === "global"}
                    onChange={() => setRole("global")}
                  />
                  {t("globalAdmin")}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`role-${admin.id}`}
                    checked={role === "room"}
                    onChange={() => setRole("room")}
                  />
                  {t("roomAdmin")}
                </label>
              </fieldset>
              {role === "room" ? (
                <fieldset className="max-h-60 space-y-2 overflow-y-auto">
                  <legend className="font-medium">{t("allowedRooms")}</legend>
                  {rooms.map((room) => (
                    <label key={room.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={roomIds.includes(room.id)}
                        onChange={() => toggleRoom(room.id)}
                      />
                      {room.name}
                      {room.deletedAt ? ` (${t("archived")})` : ""}
                    </label>
                  ))}
                  {!rooms.length ? <p>{t("noRoomsToAssign")}</p> : null}
                </fieldset>
              ) : null}
            </div>
          ) : null}
          {error ? (
            <div role="alert" className={styles.formError}>
              <p>{error}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void openDialog()}
              >
                {common("refresh")}
              </Button>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {common("cancel")}
            </Button>
            <Button
              type="button"
              disabled={loading || !!error || saving || working}
              onClick={() => void savePermissions()}
            >
              {common("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
