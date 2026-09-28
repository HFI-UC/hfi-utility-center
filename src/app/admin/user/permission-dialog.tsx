"use client"

import { ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import { getAdminPermissions, updateAdminPermissions, type AdminPermission } from "@/lib/api/admins"
import { getCampuses, getRooms } from "@/lib/api/catalog"
import type { Admin, Room } from "@/lib/api/types"

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
      const [permissions, availableRooms, campuses] = await Promise.all([
        getAdminPermissions(),
        getRooms(true),
        getCampuses(true),
      ])
      const current = permissions.find((item) => item.adminId === admin.id)
      if (!current) throw new Error(t("permissionsLoadError"))
      const archivedCampusIds = new Set(
        campuses.filter((campus) => campus.deletedAt).map((campus) => campus.id),
      )
      const activeRooms = availableRooms.filter(
        (room) => !room.deletedAt && !archivedCampusIds.has(room.campus ?? -1),
      )
      const activeRoomIds = new Set(activeRooms.map((room) => room.id))
      setRole(current.role)
      setRoomIds(current.roomIds.filter((id) => activeRoomIds.has(id)))
      setRooms(activeRooms)
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
      const activeRoomIds = new Set(rooms.map((room) => room.id))
      const saved = await mutate(
        () =>
          updateAdminPermissions({
            adminId: admin.id,
            role,
            roomIds: role === "global" ? [] : roomIds.filter((id) => activeRoomIds.has(id)),
          }),
        t("permissionsUpdated"),
      )
      if (saved) setOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : common("unknown"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={working}
        onClick={() => void openDialog()}
      >
        <ShieldCheck />
        {t("managePermissions")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
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
                    checked={role === "global"}
                    onChange={() => setRole("global")}
                  />
                  {t("globalAdmin")}
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={role === "room"} onChange={() => setRole("room")} />
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
                        onChange={() =>
                          setRoomIds((current) =>
                            current.includes(room.id)
                              ? current.filter((id) => id !== room.id)
                              : [...current, room.id],
                          )
                        }
                      />
                      {room.name}
                    </label>
                  ))}
                  {!rooms.length ? <p>{t("noRoomsToAssign")}</p> : null}
                </fieldset>
              ) : null}
            </div>
          ) : null}
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {common("cancel")}
            </Button>
            <Button
              type="button"
              disabled={loading || saving || !!error || working}
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
