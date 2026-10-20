"use client"

import { useTranslations } from "next-intl"
import { useCallback, useEffect, useState } from "react"

import { ErrorState, LoadingState } from "@/components/layout/data-state"
import { PageHeader } from "@/components/layout/page-header"
import { RefreshButton } from "@/components/layout/refresh-button"
import { useAdminMutation, useAdminResource } from "@/lib/api/admin-hooks"
import { getAdmins } from "@/lib/api/admins"
import { getAdminSession } from "@/lib/api/auth"
import type { Admin } from "@/lib/api/types"

import { AdminList } from "./admin-list"
import { CreateAdminForm } from "./create-admin-form"

export default function AdminUsersPage() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [loadError, setLoadError] = useState(false)
  const [canManagePermissions, setCanManagePermissions] = useState(false)
  useEffect(() => {
    let active = true
    void getAdminSession()
      .then((session) => {
        if (active) setCanManagePermissions(session.role === "global")
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])
  const loadAdmins = useCallback(async () => {
    try {
      const admins = await getAdmins()
      setLoadError(false)
      return admins
    } catch {
      setLoadError(true)
      return []
    }
  }, [])
  const adminResource = useAdminResource<Admin[]>({
    loadResource: loadAdmins,
    initialData: [],
  })
  const { mutate, working } = useAdminMutation({
    reload: adminResource.reload,
  })
  const refresh = () => void adminResource.reload().catch(() => undefined)

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title={t("usersTitle")}
        actions={
          <RefreshButton
            label={common("refresh")}
            loading={adminResource.loading}
            onRefresh={refresh}
          />
        }
      />

      <div className="grid min-w-0 gap-6 lg:grid-cols-[22rem_1fr]">
        <CreateAdminForm mutate={mutate} working={working} />
        <section className="flex min-w-0 flex-col gap-4">
          <h2 className="text-sm font-medium">{t("users")}</h2>
          {adminResource.loading ? (
            <LoadingState label={t("usersLoading")} />
          ) : loadError ? (
            <ErrorState
              title={t("usersLoadError")}
              onRetry={refresh}
              retryLabel={common("refresh")}
            />
          ) : (
            <AdminList
              admins={adminResource.data}
              mutate={mutate}
              working={working}
              canManagePermissions={canManagePermissions}
            />
          )}
        </section>
      </div>
    </div>
  )
}
