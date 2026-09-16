"use client"

import { useCallback, useState } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

import { AdminPageHeader, AdminSection } from "@/app/admin/admin-shell"
import { Button } from "@/components/astryx"
import { Spinner } from "@/components/astryx"
import { useAdminMutation, useAdminResource } from "@/lib/api/admin-hooks"
import { getAdmins } from "@/lib/api/admins"
import type { Admin } from "@/lib/api/types"

import { AdminList } from "./admin-list"
import styles from "./admin-user.module.css"
import { CreateAdminForm } from "./create-admin-form"

export default function AdminUsersPage() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [loadError, setLoadError] = useState(false)
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

  return (
    <main className={`admin-page ${styles.pageGrid}`}>
      <AdminPageHeader
        title={t("usersTitle")}
        description={t("usersDescription")}
        actions={
          <Button
            variant="outline"
            icon={<RefreshCw />}
            className="admin-action-button"
            onClick={adminResource.reload}
            disabled={adminResource.loading}
          >
            {common("refresh")}
          </Button>
        }
      />
      <CreateAdminForm mutate={mutate} working={working} />
      <AdminSection title={t("users")}>
        {adminResource.loading ? (
          <div className="flex min-h-32 items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            {t("usersLoading")}
          </div>
        ) : loadError ? (
          <div className={styles.errorState} role="alert">
            <AlertCircle aria-hidden="true" />
            <p>{t("usersLoadError")}</p>
            <Button
              variant="outline"
              className={styles.retryButton}
              icon={<RefreshCw />}
              onClick={adminResource.reload}
            >
              {common("refresh")}
            </Button>
          </div>
        ) : (
          <AdminList
            admins={adminResource.data}
            mutate={mutate}
            working={working}
          />
        )}
      </AdminSection>
    </main>
  )
}
