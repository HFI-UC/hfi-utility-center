"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
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
      if (await mutate(action, t("facilityDeleted"))) setOpen(false)
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
          <Trash2 />
          {common("delete")}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className={styles.dialog}>
        <AlertDialogHeader className={styles.dialogHeader}>
          <AlertDialogTitle>{common("delete")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("confirmDelete", { name: label })}
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
            <Trash2 />
            {common("delete")}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
