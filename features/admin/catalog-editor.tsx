"use client"

import { useForm } from "react-hook-form"
import { Pencil, Plus, Power, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RhfSelect } from "@/components/rhf-select"
import { ConfirmAction, TextActionDialog } from "@/components/action-dialogs"
import type { Campus, Room, SchoolClass } from "@/lib/api/types"
import {
  createCampus,
  createClass,
  createRoom,
  deleteCampus,
  deleteClass,
  deleteRoom,
  editCampus,
  editClass,
  editRoom,
} from "@/lib/api/catalog"

type Reload = () => Promise<void>

function ConfirmDelete({
  label,
  action,
  reload,
}: {
  label: string
  action: () => Promise<unknown>
  reload: Reload
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  return (
    <ConfirmAction
      title={common("delete")}
      description={t("confirmDelete", { name: label })}
      cancelLabel={common("cancel")}
      confirmLabel={common("delete")}
      onConfirm={async () => {
        await action()
        await reload()
      }}
    >
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        title={`${common("delete")} ${label}`}
      >
        <Trash2 />
      </Button>
    </ConfirmAction>
  )
}

export function CampusEditor({
  campuses,
  reload,
  report,
}: {
  campuses: Campus[]
  reload: Reload
  report: (value?: string) => void
}) {
  const form = useForm<{ name: string }>()
  const t = useTranslations("admin")
  const common = useTranslations("common")
  return (
    <section>
      <h2 className="border-b pb-3 text-lg font-semibold">{t("campuses")}</h2>
      <form
        className="flex gap-2 py-4"
        onSubmit={form.handleSubmit(async ({ name }) => {
          try {
            await createCampus(name)
            form.reset()
            await reload()
          } catch (error) {
            report(error instanceof Error ? error.message : undefined)
          }
        })}
      >
        <Input
          {...form.register("name", { required: true })}
          placeholder={t("newCampus")}
        />
        <Button>
          <Plus />
          {common("add")}
        </Button>
      </form>
      <div className="divide-y border-t">
        {campuses.map((campus) => (
          <div
            key={campus.id}
            className="flex items-center justify-between gap-3 py-3"
          >
            <span className="text-sm font-medium">{campus.name}</span>
            <div className="flex">
              <TextActionDialog
                title={t("renameCampus")}
                label={t("campusName")}
                initialValue={campus.name}
                cancelLabel={common("cancel")}
                saveLabel={common("save")}
                onSave={async (name) => {
                  await editCampus(campus.id, name)
                  await reload()
                }}
              >
                <Button
                  size="icon-sm"
                  variant="ghost"
                  title={t("renameCampus")}
                >
                  <Pencil />
                </Button>
              </TextActionDialog>
              <ConfirmDelete
                label={campus.name}
                action={() => deleteCampus(campus.id)}
                reload={reload}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function ClassEditor({
  classes,
  campuses,
  reload,
  report,
}: {
  classes: SchoolClass[]
  campuses: Campus[]
  reload: Reload
  report: (value?: string) => void
}) {
  const form = useForm<{ name: string; campus: string }>()
  const t = useTranslations("admin")
  const common = useTranslations("common")
  return (
    <section>
      <h2 className="border-b pb-3 text-lg font-semibold">{t("classes")}</h2>
      <form
        className="grid gap-2 py-4 sm:grid-cols-[1fr_10rem_auto]"
        onSubmit={form.handleSubmit(async ({ name, campus }) => {
          try {
            await createClass(name, Number(campus))
            form.reset()
            await reload()
          } catch (error) {
            report(error instanceof Error ? error.message : undefined)
          }
        })}
      >
        <Input
          {...form.register("name", { required: true })}
          placeholder={t("newClass")}
        />
        <RhfSelect
          control={form.control}
          name="campus"
          placeholder={t("selectCampus")}
          options={campuses.map((campus) => ({
            value: String(campus.id),
            label: campus.name,
          }))}
        />
        <Button>
          <Plus />
          {common("add")}
        </Button>
      </form>
      <div className="divide-y border-t">
        {classes.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {campuses.find((campus) => campus.id === item.campus)?.name}
              </p>
            </div>
            <div className="flex">
              <TextActionDialog
                title={t("renameClass")}
                label={t("className")}
                initialValue={item.name}
                cancelLabel={common("cancel")}
                saveLabel={common("save")}
                onSave={async (name) => {
                  await editClass(item.id, name, item.campus)
                  await reload()
                }}
              >
                <Button size="icon-sm" variant="ghost" title={t("renameClass")}>
                  <Pencil />
                </Button>
              </TextActionDialog>
              <ConfirmDelete
                label={item.name}
                action={() => deleteClass(item.id)}
                reload={reload}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function RoomEditor({
  rooms,
  campuses,
  reload,
  report,
}: {
  rooms: Room[]
  campuses: Campus[]
  reload: Reload
  report: (value?: string) => void
}) {
  const form = useForm<{ name: string; campus: string }>()
  const t = useTranslations("admin")
  const common = useTranslations("common")
  return (
    <section>
      <h2 className="border-b pb-3 text-lg font-semibold">{t("rooms")}</h2>
      <form
        className="grid gap-2 py-4 sm:grid-cols-[1fr_10rem_auto]"
        onSubmit={form.handleSubmit(async ({ name, campus }) => {
          try {
            await createRoom(name, Number(campus))
            form.reset()
            await reload()
          } catch (error) {
            report(error instanceof Error ? error.message : undefined)
          }
        })}
      >
        <Input
          {...form.register("name", { required: true })}
          placeholder={t("newRoom")}
        />
        <RhfSelect
          control={form.control}
          name="campus"
          placeholder={t("selectCampus")}
          options={campuses.map((campus) => ({
            value: String(campus.id),
            label: campus.name,
          }))}
        />
        <Button>
          <Plus />
          {common("add")}
        </Button>
      </form>
      <div className="divide-y border-t">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div>
              <p className="text-sm font-medium">{room.name}</p>
              <p className="text-xs text-muted-foreground">
                {campuses.find((campus) => campus.id === room.campus)?.name} ·{" "}
                {room.enabled ? t("roomOpen") : t("roomClosed")}
              </p>
            </div>
            <div className="flex">
              <Button
                size="icon-sm"
                variant="ghost"
                title={room.enabled ? t("roomClosed") : t("restoreBooking")}
                onClick={async () => {
                  await editRoom(room.id, room.name, room.campus, !room.enabled)
                  await reload()
                }}
              >
                <Power />
              </Button>
              <TextActionDialog
                title={t("renameRoom")}
                label={t("roomName")}
                initialValue={room.name}
                cancelLabel={common("cancel")}
                saveLabel={common("save")}
                onSave={async (name) => {
                  await editRoom(room.id, name, room.campus, room.enabled)
                  await reload()
                }}
              >
                <Button size="icon-sm" variant="ghost" title={t("renameRoom")}>
                  <Pencil />
                </Button>
              </TextActionDialog>
              <ConfirmDelete
                label={room.name}
                action={() => deleteRoom(room.id)}
                reload={reload}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
