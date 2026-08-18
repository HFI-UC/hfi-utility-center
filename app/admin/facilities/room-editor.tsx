"use client"

import { useState } from "react"
import { Pencil, Plus, Power } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Controller, useForm, type Control } from "react-hook-form"

import { AdminSection } from "@/app/admin/admin-shell"
import { TextActionDialog } from "@/app/admin/text-action-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createRoom, deleteRoom, editRoom } from "@/lib/api/catalog"
import type { Admin, Campus, Room } from "@/lib/api/types"

import { ApproverEditor } from "./approver-editor"
import {
  ConfirmFacilityDelete,
  type FacilityEditorActions,
} from "./facility-editor-actions"
import { PolicyEditor } from "./room-policy-editor"

type RoomForm = { name: string; campus: string }

export function RoomEditor({
  rooms,
  campuses,
  admins,
  mutate,
  working,
}: FacilityEditorActions & {
  rooms: Room[]
  campuses: Campus[]
  admins: Admin[]
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [open, setOpen] = useState(false)
  const form = useForm<RoomForm>({ defaultValues: { name: "", campus: "" } })
  const campusNames = new Map(
    campuses.map((campus) => [campus.id, campus.name])
  )
  const dateFormatter = new Intl.DateTimeFormat(useLocale(), {
    dateStyle: "medium",
  })

  async function createNewRoom({ name, campus }: RoomForm) {
    const created = await mutate(() => createRoom(name.trim(), Number(campus)))
    if (created) {
      form.reset()
      setOpen(false)
    }
  }

  return (
    <AdminSection
      title={t("rooms")}
      className="xl:col-span-2"
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon-sm" disabled={working}>
              <Plus />
              <span className="sr-only">{common("add")}</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("newRoom")}</DialogTitle>
              <DialogDescription>{t("roomName")}</DialogDescription>
            </DialogHeader>
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit(createNewRoom)}
            >
              <Controller
                control={form.control}
                name="name"
                rules={{
                  validate: (name) =>
                    Boolean(name.trim()) || t("fieldRequired"),
                }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="new-room-name">
                      {t("roomName")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="new-room-name"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <RoomCampusField control={form.control} campuses={campuses} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{common("cancel")}</Button>
                </DialogClose>
                <Button disabled={working}>{common("add")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden sm:table-cell">{t("id")}</TableHead>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("campus")}</TableHead>
            <TableHead>{t("roomPolicies")}</TableHead>
            <TableHead>{t("approvers")}</TableHead>
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
                <TableCell className="hidden sm:table-cell">
                  #{room.id}
                </TableCell>
                <TableCell className="font-medium">{room.name}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      room.enabled
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {room.enabled ? common("enabled") : common("disabled")}
                  </Badge>
                </TableCell>
                <TableCell>{campusNames.get(room.campus)}</TableCell>
                <TableCell>
                  <PolicyEditor room={room} mutate={mutate} working={working} />
                </TableCell>
                <TableCell>
                  <ApproverEditor
                    room={room}
                    admins={admins}
                    mutate={mutate}
                    working={working}
                  />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  {room.createdAt
                    ? dateFormatter.format(new Date(room.createdAt))
                    : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title={
                        room.enabled ? t("roomClosed") : t("restoreBooking")
                      }
                      disabled={working}
                      onClick={() =>
                        mutate(() =>
                          editRoom(
                            room.id,
                            room.name,
                            room.campus,
                            !room.enabled
                          )
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
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                {t("roomsEmpty")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </AdminSection>
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
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor="new-room-campus">{t("selectCampus")}</FieldLabel>
          <Select
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              id="new-room-campus"
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
  )
}
