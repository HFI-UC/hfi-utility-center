"use client"

import { Bell, BellOff, Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldError } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import {
  createApprover,
  deleteApprover,
  toggleApproverNotifications,
} from "@/lib/api/admins"
import type { Admin, Room } from "@/lib/api/types"

type ApproverForm = { room: string; admin: string }

export function ApproverEditor({
  rooms,
  admins,
  mutate,
  working,
}: {
  rooms: Room[]
  admins: Admin[]
  mutate: AdminMutation
  working: boolean
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const form = useForm<ApproverForm>({
    defaultValues: { room: "", admin: "" },
  })
  const adminNames = new Map(admins.map((admin) => [admin.id, admin.name]))

  async function addApprover({ room, admin }: ApproverForm) {
    const created = await mutate(() =>
      createApprover(Number(room), Number(admin))
    )
    if (created) form.reset()
  }

  return (
    <section>
      <h2 className="border-b pb-3 text-lg font-semibold">{t("approvers")}</h2>
      <form
        className="grid gap-2 py-4 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={form.handleSubmit(addApprover)}
      >
        <Controller
          control={form.control}
          name="room"
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
                  <SelectValue placeholder={t("selectRoom")} />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={String(room.id)}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="admin"
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
                  <SelectValue placeholder={t("selectAdmin")} />
                </SelectTrigger>
                <SelectContent>
                  {admins.map((admin) => (
                    <SelectItem key={admin.id} value={String(admin.id)}>
                      {admin.name} · {admin.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Button disabled={working}>
          <Plus />
          {common("add")}
        </Button>
      </form>
      <div className="divide-y border-t">
        {rooms.flatMap((room) =>
          (room.approvers ?? []).map((approver) => {
            const adminName =
              adminNames.get(approver.adminId) ??
              t("adminNumber", { id: approver.adminId })
            return (
              <div
                key={approver.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {room.name} · {adminName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {approver.notificationsEnabled
                      ? t("notificationsOn")
                      : t("notificationsOff")}
                  </p>
                </div>
                <div className="flex">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title={t("toggleNotifications")}
                    disabled={working}
                    onClick={() =>
                      void mutate(() =>
                        toggleApproverNotifications(approver.id)
                      )
                    }
                  >
                    {approver.notificationsEnabled ? <Bell /> : <BellOff />}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title={t("removeApprover")}
                        disabled={working}
                      >
                        <Trash2 />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t("removeApprover")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("confirmDelete", { name: adminName })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {common("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() =>
                            void mutate(() => deleteApprover(approver.id))
                          }
                        >
                          {common("delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
