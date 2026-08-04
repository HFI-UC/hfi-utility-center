"use client"

import { KeyRound, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { TextActionDialog } from "@/app/admin/text-action-dialog"
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
import type { AdminMutation } from "@/lib/api/admin-hooks"
import { changeAdminPassword, deleteAdmin } from "@/lib/api/admins"
import type { Admin } from "@/lib/api/types"

import { EditAdminDialog } from "./edit-admin-dialog"

export function AdminList({
  admins,
  mutate,
  workingKey,
}: {
  admins: Admin[]
  mutate: AdminMutation
  workingKey?: string
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")

  return (
    <div className="divide-y">
      {admins.map((admin) => {
        const passwordKey = `admin:${admin.id}:password`
        const deleteKey = `admin:${admin.id}:delete`
        return (
          <article
            key={admin.id}
            className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
          >
            <div>
              <p className="font-semibold">{admin.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {admin.email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <EditAdminDialog
                admin={admin}
                mutate={mutate}
                workingKey={workingKey}
              />
              <TextActionDialog
                title={t("changePassword")}
                label={t("newPassword")}
                inputType="password"
                cancelLabel={common("cancel")}
                saveLabel={common("save")}
                onSave={(password) =>
                  mutate(
                    passwordKey,
                    () => changeAdminPassword(admin.id, password),
                    t("passwordUpdated")
                  )
                }
              >
                <Button
                  size="sm"
                  variant="outline"
                  disabled={Boolean(workingKey)}
                >
                  <KeyRound />
                  {t("changePassword")}
                </Button>
              </TextActionDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={Boolean(workingKey)}
                  >
                    <Trash2 />
                    {common("delete")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{common("delete")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("confirmDelete", { name: admin.name })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{common("cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() =>
                        void mutate(
                          deleteKey,
                          () => deleteAdmin(admin.id),
                          t("adminDeleted")
                        )
                      }
                    >
                      {common("delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </article>
        )
      })}
    </div>
  )
}
