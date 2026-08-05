"use client"

import { RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

import { AdminPageHeader } from "@/app/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { useAdminMutation, useAdminResource } from "@/lib/api/admin-hooks"
import { getAdmins } from "@/lib/api/admins"
import { getErrorMessage } from "@/lib/api/client"
import type { Admin } from "@/lib/api/types"

import { AdminList } from "./admin-list"
import { CreateAdminForm } from "./create-admin-form"

export default function AdminUsersPage() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const adminResource = useAdminResource<Admin[]>(getAdmins, [])
  const {
    mutate,
    working,
    notice,
    error: mutationError,
  } = useAdminMutation(adminResource.reload)
  const error = mutationError ?? adminResource.error

  return (
    <main>
      <AdminPageHeader
        title={t("usersTitle")}
        description={t("usersDescription")}
        actions={
          <Button
            variant="outline"
            onClick={() => void adminResource.reload()}
            disabled={adminResource.loading}
          >
            <RefreshCw />
            {common("refresh")}
          </Button>
        }
      />
      <CreateAdminForm mutate={mutate} working={working} />
      {notice ? (
        <p className="border-b py-3 text-sm text-foreground">{notice}</p>
      ) : null}
      {error ? (
        <p className="border-b py-3 text-sm text-destructive">
          {getErrorMessage(error, t("usersLoadError"))}
        </p>
      ) : null}
      <AdminList
        admins={adminResource.data}
        mutate={mutate}
        working={working}
      />
    </main>
  )
}
