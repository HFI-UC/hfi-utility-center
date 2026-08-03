"use client"

import { RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

import { AdminPageHeader } from "@/components/admin-page-header"
import { Button } from "@/components/ui/button"
import { useAdminMutation } from "@/features/admin/use-admin-mutation"
import { useAdminResource } from "@/features/admin/use-admin-resource"
import { getAdmins } from "@/lib/api/admins"
import type { Admin } from "@/lib/api/types"

import { AdminList } from "./admin-list"
import { CreateAdminForm } from "./create-admin-form"

export default function AdminUsersPage() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const adminResource = useAdminResource<Admin[]>({
    load: getAdmins,
    initialData: [],
    fallbackError: t("usersLoadError"),
  })
  const { runMutation, workingKey, notice } = useAdminMutation({
    reload: adminResource.reload,
    reportError: adminResource.reportError,
    fallbackError: common("unknown"),
  })

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
      <CreateAdminForm mutate={runMutation} workingKey={workingKey} />
      {adminResource.error ? (
        <p className="border-b py-3 text-sm text-destructive">
          {adminResource.error}
        </p>
      ) : null}
      {notice ? (
        <p className="border-b py-3 text-sm text-foreground">{notice}</p>
      ) : null}
      <AdminList
        admins={adminResource.data}
        mutate={runMutation}
        workingKey={workingKey}
      />
    </main>
  )
}
