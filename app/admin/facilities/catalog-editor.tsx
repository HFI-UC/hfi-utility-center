"use client"

import { Controller, useForm } from "react-hook-form"
import { Pencil, Plus, Power, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const form = useForm<{ name: string }>({ defaultValues: { name: "" } })
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
        <Controller
          control={form.control}
          name="name"
          rules={{ required: t("fieldRequired") }}
          render={({ field, fieldState }) => (
            <Field className="flex-1" data-invalid={fieldState.invalid}>
              <Input
                {...field}
                placeholder={t("newCampus")}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
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
  const form = useForm<{ name: string; campus: string }>({
    defaultValues: { name: "", campus: "" },
  })
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
        <Controller
          control={form.control}
          name="name"
          rules={{ required: t("fieldRequired") }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                placeholder={t("newClass")}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="campus"
          rules={{ required: t("fieldRequired") }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onOpenChange={(open) => !open && field.onBlur()}
              >
                <SelectTrigger
                  ref={field.ref}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder={t("selectCampus")} />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={String(campus.id)}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
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
  const form = useForm<{ name: string; campus: string }>({
    defaultValues: { name: "", campus: "" },
  })
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
        <Controller
          control={form.control}
          name="name"
          rules={{ required: t("fieldRequired") }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                placeholder={t("newRoom")}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="campus"
          rules={{ required: t("fieldRequired") }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onOpenChange={(open) => !open && field.onBlur()}
              >
                <SelectTrigger
                  ref={field.ref}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder={t("selectCampus")} />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((campus) => (
                    <SelectItem key={campus.id} value={String(campus.id)}>
                      {campus.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
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
