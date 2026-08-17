"use client"

import { Pencil, Plus, Power } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useForm, type Control } from "react-hook-form"

import { TextActionDialog } from "@/app/admin/text-action-dialog"
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
import { createRoom, deleteRoom, editRoom } from "@/lib/api/catalog"
import type { Campus, Room } from "@/lib/api/types"

import {
  ConfirmFacilityDelete,
  type FacilityEditorActions,
} from "./facility-editor-actions"

type RoomForm = { name: string; campus: string }

export function RoomEditor({
  rooms,
  campuses,
  mutate,
  working,
}: FacilityEditorActions & { rooms: Room[]; campuses: Campus[] }) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const form = useForm<RoomForm>({ defaultValues: { name: "", campus: "" } })
  const nameError = form.formState.errors.name
  const campusNames = new Map(
    campuses.map((campus) => [campus.id, campus.name])
  )

  async function createNewRoom({ name, campus }: RoomForm) {
    const created = await mutate(() => createRoom(name.trim(), Number(campus)))
    if (created) form.reset()
  }

  return (
    <section>
      <h2 className="border-b pb-3 text-lg font-semibold">{t("rooms")}</h2>
      <form
        className="grid gap-2 py-4 sm:grid-cols-[1fr_10rem_auto]"
        onSubmit={form.handleSubmit(createNewRoom)}
      >
        <Field data-invalid={Boolean(nameError)}>
          <Input
            {...form.register("name", {
              validate: (name) => Boolean(name.trim()) || t("fieldRequired"),
            })}
            placeholder={t("newRoom")}
            aria-invalid={Boolean(nameError)}
          />
          <FieldError errors={[nameError]} />
        </Field>
        <RoomCampusField control={form.control} campuses={campuses} />
        <Button disabled={working}>
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
                {campusNames.get(room.campus)} ·{" "}
                {room.enabled ? t("roomOpen") : t("roomClosed")}
              </p>
            </div>
            <div className="flex">
              <Button
                size="icon-sm"
                variant="ghost"
                title={room.enabled ? t("roomClosed") : t("restoreBooking")}
                disabled={working}
                onClick={() =>
                  mutate(() =>
                    editRoom(room.id, room.name, room.campus, !room.enabled)
                  )
                }
              >
                <Power />
              </Button>
              <TextActionDialog
                title={t("renameRoom")}
                label={t("roomName")}
                initialValue={room.name}
                cancelLabel={common("cancel")}
                saveLabel={common("save")}
                onSave={(name) =>
                  mutate(() =>
                    editRoom(room.id, name, room.campus, room.enabled)
                  )
                }
              >
                <Button
                  size="icon-sm"
                  variant="ghost"
                  title={t("renameRoom")}
                  disabled={working}
                >
                  <Pencil />
                </Button>
              </TextActionDialog>
              <ConfirmFacilityDelete
                label={room.name}
                action={() => deleteRoom(room.id)}
                mutate={mutate}
                working={working}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function RoomCampusField({
  control,
  campuses,
}: {
  control: Control<RoomForm>
  campuses: Campus[]
}) {
  const t = useTranslations("admin")
  return (
    <Controller
      control={control}
      name="campus"
      rules={{ required: t("fieldRequired") }}
      render={({ field: { onBlur, onChange, ref, ...field }, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <Select
            {...field}
            onValueChange={onChange}
            onOpenChange={(open) => !open && onBlur()}
          >
            <SelectTrigger ref={ref} aria-invalid={fieldState.invalid}>
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
  )
}
