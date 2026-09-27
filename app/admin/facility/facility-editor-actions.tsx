"use client"

import { useState } from "react"
import { Archive, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/astryx"
import type { AdminMutation } from "@/lib/api/admin-hooks"

import styles from "./facility.module.css"

export type FacilityEditorActions = {
  mutate: AdminMutation
  working: boolean
}

export function RestoreFacilityButton({
  action,
  mutate,
  working,
}: FacilityEditorActions & { action: () => Promise<unknown> }) {
  const t = useTranslations("admin")
  return (
    <button
      type="button"
      className={styles.secondaryButton}
      disabled={working}
      onClick={() => void mutate(action, t("facilityRestored"))}
    >
      <RotateCcw />
      {t("restoreArchived")}
    </button>
  )
}

export function ConfirmFacilityDelete({
  label,
  action,
  mutate,
  working,
}: FacilityEditorActions & {
  label: string
  action: () => Promise<unknown>
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")

  async function removeFacility() {
    setError("")
    try {
      if (await mutate(action, t("facilityArchived"))) setOpen(false)
    } catch {
      setError(common("unknown"))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className={styles.secondaryButton}
          disabled={working}
        >
          <Archive />
          {t("archive")}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className={styles.dialog}>
        <AlertDialogHeader className={styles.dialogHeader}>
          <AlertDialogTitle>{t("archive")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("confirmArchive", { name: label })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <p className={styles.error}>{error}</p> : null}
        <AlertDialogFooter className={styles.dialogActions}>
          <AlertDialogCancel className={styles.secondaryButton}>
            {common("cancel")}
          </AlertDialogCancel>
          <button
            type="button"
            className={styles.dangerButton}
            disabled={working}
            onClick={removeFacility}
          >
            <Archive />
            {t("archive")}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
