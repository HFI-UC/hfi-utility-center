"use client"

import { useTranslations } from "next-intl"

import { LoadingState } from "@/components/layout/data-state"

import { CancelledNotice, LinkUnavailable } from "./cancel-details"

export function CancellationGate({
  hasToken,
  loading,
  error,
  hasPreview,
  cancelled,
}: {
  hasToken: boolean
  loading: boolean
  error?: string
  hasPreview: boolean
  cancelled: boolean
}) {
  const t = useTranslations("neo.management")

  if (!hasToken) return <LinkUnavailable description={t("invalidLink")} />
  if (cancelled) return <CancelledNotice />
  if (loading) {
    return (
      <div className="flex min-w-0 flex-col gap-3">
        <LoadingState label={t("loading")} rows={3} />
        <p className="text-sm text-muted-foreground">{t("loadingDescription")}</p>
      </div>
    )
  }
  if (!hasPreview) return <LinkUnavailable description={error ?? t("invalidLink")} />
  return null
}
