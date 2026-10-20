"use client"

import { useTranslations } from "next-intl"

import { AppShell } from "@/components/layout/app-shell"
import { ErrorState, LoadingState } from "@/components/layout/data-state"
import { PageHeader } from "@/components/layout/page-header"

export function BookingGate({
  loading,
  error,
  onRetry,
}: {
  loading: boolean
  error?: string
  onRetry: () => void
}) {
  const t = useTranslations("booking")

  if (loading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl">
          <PageHeader title={t("createTitle")} description={t("intro")} />
          <LoadingState label={t("loadingTitle")} rows={5} />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <PageHeader title={t("createTitle")} description={t("intro")} />
        <ErrorState
          title={t("loadError")}
          description={error ?? t("connectionError")}
          onRetry={onRetry}
        />
      </div>
    </AppShell>
  )
}
