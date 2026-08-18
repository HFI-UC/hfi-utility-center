"use client"

import { Bell, BellOff, Plus, Trash2, UserRoundCheck } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
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
import type { AdminMutation } from "@/lib/api/admin-hooks"
import {
  createApprover,
  deleteApprover,
  toggleApproverNotifications,
} from "@/lib/api/admins"
import type { Admin, Room } from "@/lib/api/types"

type ApproverForm = { admin: string }

export function ApproverEditor({
  room,
  admins,
  mutate,
  working,
}: {
  room: Room
  admins: Admin[]
  mutate: AdminMutation
  working: boolean
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const form = useForm<ApproverForm>({ defaultValues: { admin: "" } })
  const adminById = new Map(admins.map((admin) => [admin.id, admin]))
  const assignedAdminIds = new Set(
    (room.approvers ?? []).map((approver) => approver.adminId)
  )
  const availableAdmins = admins.filter(
    (admin) => !assignedAdminIds.has(admin.id)
  )

  async function addApprover({ admin }: ApproverForm) {
    const created = await mutate(() => createApprover(room.id, Number(admin)))
    if (created) form.reset()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserRoundCheck />
          {room.approvers?.length ?? 0}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {room.name} · {t("approvers")}
          </DialogTitle>
          <DialogDescription>
            {t("approverDialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex items-end gap-3"
          onSubmit={form.handleSubmit(addApprover)}
        >
          <Controller
            control={form.control}
            name="admin"
            rules={{ required: t("fieldRequired") }}
            render={({
              field: { onBlur, onChange, ref, ...field },
              fieldState,
            }) => (
              <Field className="flex-1" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`approver-${room.id}`}>
                  {t("selectAdmin")}
                </FieldLabel>
                <Select
                  {...field}
                  onValueChange={onChange}
                  onOpenChange={(open) => !open && onBlur()}
                >
                  <SelectTrigger
                    id={`approver-${room.id}`}
                    ref={ref}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder={t("selectAdmin")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAdmins.map((admin) => (
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
          <Button disabled={working || !availableAdmins.length}>
            <Plus />
            {common("add")}
          </Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("id")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("notifications")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {room.approvers?.length ? (
              room.approvers.map((approver) => {
                const admin = adminById.get(approver.adminId)
                const adminName =
                  admin?.name ?? t("adminNumber", { id: approver.adminId })

                return (
                  <TableRow key={approver.id}>
                    <TableCell>#{approver.id}</TableCell>
                    <TableCell className="font-medium">{adminName}</TableCell>
                    <TableCell>{admin?.email ?? "—"}</TableCell>
                    <TableCell>
                      {approver.notificationsEnabled
                        ? t("notificationsOn")
                        : t("notificationsOff")}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title={t("toggleNotifications")}
                          disabled={working}
                          onClick={() =>
                            mutate(() =>
                              toggleApproverNotifications(approver.id)
                            )
                          }
                        >
                          {approver.notificationsEnabled ? (
                            <Bell />
                          ) : (
                            <BellOff />
                          )}
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
                                  mutate(() => deleteApprover(approver.id))
                                }
                              >
                                {common("delete")}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t("approversEmpty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
