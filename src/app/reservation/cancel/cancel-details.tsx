"use client"

import { CheckCircle2, Clock3, FileText, Monitor, Pencil, UserRound, XCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import type { ReactNode } from "react"

import { EmptyState } from "@/components/layout/data-state"
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
import { Spinner } from "@/components/ui/spinner"
import type { CancellationPreview } from "@/lib/api/reservations"
import type { PurposeType } from "@/lib/api/types"
import { formatApiTimestamp } from "@/lib/date-time"

const DETAIL =
  "grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-3 py-2.5 sm:grid-cols-[8.5rem_minmax(0,1fr)]"

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={DETAIL}>
      <dt className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm break-words">{children}</dd>
    </div>
  )
}

export function CancelDetails({
  preview,
  dateFormatter,
  working,
  onEdit,
  onCancel,
}: {
  preview: CancellationPreview
  dateFormatter: Intl.DateTimeFormat
  working: boolean
  onEdit: () => void
  onCancel: () => void
}) {
  const t = useTranslations("neo.management")
  const purposeKey = (preview.purposeType || "personal") as PurposeType

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <dl className="flex min-w-0 flex-col divide-y divide-border">
        <DetailRow label={t("date")}>
          <span className="font-mono text-xs">
            {formatApiTimestamp(dateFormatter, preview.startTime)}
          </span>
        </DetailRow>
        <DetailRow label={t("time")}>
          <span className="flex items-center gap-1.5 font-mono text-xs tabular-nums">
            <Clock3 aria-hidden className="size-3.5 text-muted-foreground" />
            {preview.startTime.slice(11, 16)} – {preview.endTime.slice(11, 16)}
          </span>
        </DetailRow>
        <DetailRow label={t("reservedBy")}>
          <span className="flex items-center gap-1.5">
            <UserRound aria-hidden className="size-3.5 text-muted-foreground" />
            {preview.studentName}
          </span>
        </DetailRow>
        <DetailRow label={t("purpose")}>
          <span className="flex items-center gap-1.5">
            <FileText aria-hidden className="size-3.5 text-muted-foreground" />
            {t(`purposeOptions.${purposeKey}`)}
          </span>
        </DetailRow>
        <DetailRow label={t("multimedia")}>
          <span className="flex items-center gap-1.5">
            <Monitor aria-hidden className="size-3.5 text-muted-foreground" />
            {preview.needsMultimedia ? t("required") : t("notRequired")}
          </span>
        </DetailRow>
        <DetailRow label={t("reason")}>
          <span className="flex items-start gap-1.5">
            <FileText aria-hidden className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            {preview.reason}
          </span>
        </DetailRow>
      </dl>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          type="button"
          disabled={
            preview.remainingEdits <= 0 ||
            (preview.status !== "pending" && preview.status !== "approved")
          }
          onClick={onEdit}
          className="min-h-11 sm:min-h-8"
        >
          <Pencil aria-hidden />
          {t("modify")}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="destructive" className="min-h-11 sm:min-h-8">
              <XCircle aria-hidden />
              {t("cancelReservation")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("cancelConfirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("cancelConfirmDescription", { date: preview.startTime.slice(0, 10) })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="min-h-11 sm:min-h-8">
                {t("keepReservation")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onCancel}
                disabled={working}
                className="min-h-11 sm:min-h-8"
              >
                {working ? <Spinner /> : null}
                {t("confirmCancel")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button asChild variant="ghost" className="min-h-11 sm:min-h-8">
          <Link href="/" prefetch={false}>
            {t("home")}
          </Link>
        </Button>
      </div>
    </div>
  )
}

export function CancelledNotice() {
  const t = useTranslations("neo.management")

  return (
    <EmptyState
      icon={
        <span className="flex size-11 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground">
          <CheckCircle2 className="size-5" aria-hidden />
        </span>
      }
      title={t("cancelledTitle")}
      description={t("cancelledDescription")}
      action={
        <>
          <Button asChild className="min-h-11 sm:min-h-8">
            <Link href="/reservation/create" prefetch={false}>
              {t("bookAgain")}
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11 sm:min-h-8">
            <Link href="/" prefetch={false}>
              {t("home")}
            </Link>
          </Button>
        </>
      }
    />
  )
}

export function LinkUnavailable({ description }: { description: string }) {
  const t = useTranslations("neo.management")

  return (
    <EmptyState
      icon={XCircle}
      title={t("unavailable")}
      description={description}
      action={
        <Button asChild variant="outline" className="min-h-11 sm:min-h-8">
          <Link href="/" prefetch={false}>
            {t("home")}
          </Link>
        </Button>
      }
    />
  )
}
