"use client"

import { KeyRound, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { ConfirmAction, TextActionDialog } from "@/components/action-dialogs"
import { Button } from "@/components/ui/button"
import type { AdminMutation } from "@/features/admin/use-admin-mutation"
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
              <ConfirmAction
                title={common("delete")}
                description={t("confirmDelete", { name: admin.name })}
                cancelLabel={common("cancel")}
                confirmLabel={common("delete")}
                onConfirm={() =>
                  mutate(
                    deleteKey,
                    () => deleteAdmin(admin.id),
                    t("adminDeleted")
                  )
                }
              >
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={Boolean(workingKey)}
                >
                  <Trash2 />
                  {common("delete")}
                </Button>
              </ConfirmAction>
            </div>
          </article>
        )
      })}
    </div>
  )
}
