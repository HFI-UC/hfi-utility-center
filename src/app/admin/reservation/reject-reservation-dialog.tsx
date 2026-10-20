"use client"

import { X } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

export function RejectReservationDialog({
  open,
  changing = false,
  reason,
  error,
  working,
  onReasonChange,
  onConfirm,
  onOpenChange,
}: {
  open: boolean
  changing?: boolean
  reason: string
  error?: string
  working: boolean
  onReasonChange: (value: string) => void
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <X />
          </AlertDialogMedia>
          <AlertDialogTitle>{t(changing ? "changeApproval" : "reject")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(changing ? "changeApprovalDescription" : "rejectionDialogDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Field data-invalid={Boolean(error)}>
          <FieldLabel htmlFor="rejection-reason">{t("reason")}</FieldLabel>
          <Textarea
            id="rejection-reason"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder={t("rejectionPlaceholder")}
            aria-invalid={Boolean(error)}
          />
          <FieldError>{error}</FieldError>
        </Field>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={working}>{common("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={working}
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
          >
            {t(changing ? "confirmChangeApproval" : "confirmReject")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
