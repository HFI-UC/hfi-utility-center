"use client"

import { DoorOpen, Pencil, Plus } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useMemo, useState } from "react"

import { EmptyState } from "@/components/layout/data-state"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createRoom, deleteRoom, editRoom, restoreRoom } from "@/lib/api/catalog"
import type { Campus, Room } from "@/lib/api/types"
import { formatApiTimestamp } from "@/lib/date-time"

import { CampusNameDialog } from "./campus-name-dialog"
import {
  FacilityRowMenu,
  IconHint,
  ResourceSection,
  RestoreFacilityButton,
  StateDot,
  type FacilityEditorActions,
  touchTarget,
} from "./facility-editor-actions"
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
  const campusNames = new Map(campuses.map((campus) => [campus.id, campus.name]))
  const activeCampuses = campuses.filter((campus) => !campus.deletedAt)
  const archivedCampusIds = new Set(
    campuses.filter((campus) => campus.deletedAt).map((campus) => campus.id),
  )
  const isArchived = (room: Room) =>
    Boolean(room.deletedAt) || archivedCampusIds.has(room.campus ?? -1)
  const locale = useLocale()
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
      }),
    [locale],
  )
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const editing = rooms.find((room) => room.id === editingId && !isArchived(room))

  return (
    <ResourceSection
      title={t("rooms")}
      count={rooms.length}
      action={
        <Button
          variant="outline"
          size="sm"
          disabled={working || activeCampuses.length === 0}
          onClick={() => setCreateOpen(true)}
          className={touchTarget}
        >
          <Plus aria-hidden />
          {common("add")}
        </Button>
      }
    >
      {rooms.length === 0 ? (
        <EmptyState icon={DoorOpen} title={t("roomsEmpty")} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs text-muted-foreground">{t("facilityName")}</TableHead>
              <TableHead className="text-xs text-muted-foreground">{t("status")}</TableHead>
              <TableHead className="text-xs text-muted-foreground">{t("campus")}</TableHead>
              <TableHead className="text-xs text-muted-foreground">{t("roomPolicies")}</TableHead>
              <TableHead className="hidden text-xs text-muted-foreground xl:table-cell">
                {t("createdAt")}
              </TableHead>
              <TableHead className="w-0 text-right text-xs text-muted-foreground">
                {t("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>
                  <span className="block max-w-[14rem] truncate font-medium">
                    {room.name}
                    {isArchived(room) ? (
                      <span className="ml-2 text-xs text-amber-700">{t("archived")}</span>
                    ) : null}
                  </span>
                  <span className="block font-mono text-xs text-muted-foreground">#{room.id}</span>
                </TableCell>
                <TableCell>
                  {isArchived(room) ? null : (
                    <div className="flex items-center gap-2">
                      <IconHint label={room.enabled ? t("roomOpen") : t("roomClosed")}>
                        <span className="inline-flex">
                          <Switch
                            size="sm"
                            checked={room.enabled}
                            className="after:-inset-y-4 sm:after:-inset-y-2"
                            disabled={working}
                            aria-label={room.name}
                            onCheckedChange={() =>
                              mutate(
                                () => editRoom(room.id, room.name, room.campus ?? 0, !room.enabled),
                                t("roomStatusUpdated"),
                              )
                            }
                          />
                        </span>
                      </IconHint>
                      <StateDot
                        enabled={room.enabled}
                        label={room.enabled ? common("enabled") : common("disabled")}
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="block max-w-[10rem] truncate">
                    {campusNames.get(room.campus ?? -1)}
                  </span>
                </TableCell>
                <TableCell>
                  {isArchived(room) ? (
                    "—"
                  ) : (
                    <PolicyEditor room={room} mutate={mutate} working={working} />
                  )}
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">
                  {formatApiTimestamp(dateFormatter, room.createdAt)}
                </TableCell>
                <TableCell className="w-0 text-right">
                  {room.deletedAt && !archivedCampusIds.has(room.campus ?? -1) ? (
                    <RestoreFacilityButton
                      action={() => restoreRoom(room.id)}
                      mutate={mutate}
                      working={working}
                    />
                  ) : isArchived(room) ? (
                    "—"
                  ) : (
                    <RoomRowMenu
                      room={room}
                      mutate={mutate}
                      working={working}
                      onEdit={() => setEditingId(room.id)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CampusNameDialog
        key="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        title={t("newRoom")}
        description={t("roomName")}
        nameLabel={t("roomName")}
        campuses={activeCampuses}
        working={working}
        onSave={(name, campus) => mutate(() => createRoom(name, campus), t("roomCreated"))}
      />
      {editing ? (
        <CampusNameDialog
          key={editing.id}
          open
          onOpenChange={(nextOpen) => !nextOpen && setEditingId(null)}
          mode="edit"
          title={t("renameRoom")}
          description={t("roomName")}
          nameLabel={t("roomName")}
          campuses={activeCampuses}
          initialName={editing.name}
          initialCampus={String(editing.campus ?? "")}
          working={working}
          onSave={(name, campus) =>
            mutate(() => editRoom(editing.id, name, campus, editing.enabled), t("roomUpdated"))
          }
        />
      ) : null}
    </ResourceSection>
  )
}

function RoomRowMenu({
  room,
  mutate,
  working,
  onEdit,
}: FacilityEditorActions & {
  room: Room
  onEdit: () => void
}) {
  const common = useTranslations("common")

  return (
    <FacilityRowMenu
      label={room.name}
      action={() => deleteRoom(room.id)}
      mutate={mutate}
      working={working}
    >
      <DropdownMenuItem onSelect={onEdit} disabled={working}>
        <Pencil aria-hidden />
        {common("edit")}
      </DropdownMenuItem>
    </FacilityRowMenu>
  )
}
