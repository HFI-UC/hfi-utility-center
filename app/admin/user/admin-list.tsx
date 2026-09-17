"use client"

import { useState } from "react"
import { Bell, BellOff, KeyRound, Trash2, TriangleAlert, X } from "lucide-react"
import { useTranslations } from "next-intl"

import { TextActionDialog } from "@/app/admin/text-action-dialog"
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/astryx"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import {
  changeAdminPassword,
  deleteAdmin,
  setAdminNotifications,
} from "@/lib/api/admins"
import type { Admin } from "@/lib/api/types"

import styles from "./admin-user.module.css"
import { EditAdminDialog } from "./edit-admin-dialog"

export function AdminList({
  admins,
  mutate,
  working,
}: {
  admins: Admin[]
  mutate: AdminMutation
  working: boolean
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [notificationError, setNotificationError] = useState<number | null>(
    null
  )

  if (admins.length === 0) {
    return (
      <div className={styles.emptyState}>
        <BellOff aria-hidden="true" />
        <p>{t("usersEmpty")}</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {admins.map((admin) => {
        const receivesNotifications = admin.receiveReservationNotifications

        return (
          <article key={admin.id} className={styles.accountCard}>
            <header className={styles.accountHeader}>
              <span className={styles.avatar} aria-hidden="true">
                {admin.name.trim().slice(0, 1).toUpperCase() || "A"}
              </span>
              <div className={styles.identity}>
                <strong>{admin.name}</strong>
                <a href={`mailto:${admin.email}`}>{admin.email}</a>
              </div>
            </header>

            <section
              className={`${styles.notificationRow} ${
                receivesNotifications ? styles.notificationEnabled : ""
              }`}
            >
              <div className={styles.notificationCopy}>
                <span className={styles.notificationIcon} aria-hidden="true">
                  {receivesNotifications ? <Bell /> : <BellOff />}
                </span>
                <span className={styles.notificationLabel}>
                  <strong>{t("notifications")}</strong>
                  <span>
                    {receivesNotifications
                      ? t("reservationNotificationsOn")
                      : t("reservationNotificationsOff")}
                  </span>
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                icon={receivesNotifications ? <Bell /> : <BellOff />}
                className={`${styles.actionButton} ${styles.notificationToggle}`}
                disabled={working}
                onClick={async () => {
                  setNotificationError(null)
                  try {
                    await mutate(
                      () =>
                        setAdminNotifications(admin.id, !receivesNotifications),
                      t("adminNotificationsUpdated")
                    )
                  } catch {
                    setNotificationError(admin.id)
                  }
                }}
              >
                {receivesNotifications
                  ? t("notificationDisable")
                  : t("notificationEnable")}
              </Button>
            </section>
            {notificationError === admin.id ? (
              <p className={styles.formError} role="alert">
                {common("unknown")}
              </p>
            ) : null}

            <footer className={styles.actions}>
              <EditAdminDialog
                admin={admin}
                mutate={mutate}
                working={working}
              />
              <TextActionDialog
                title={t("changePassword")}
                label={t("newPassword")}
                inputType="password"
                cancelLabel={common("cancel")}
                saveLabel={common("save")}
                onSave={(password) =>
                  mutate(
                    () => changeAdminPassword(admin.id, password),
                    t("passwordUpdated")
                  )
                }
              >
                <Button
                  size="sm"
                  variant="outline"
                  icon={<KeyRound />}
                  className={styles.actionButton}
                  disabled={working}
                >
                  {t("changePassword")}
                </Button>
              </TextActionDialog>
              <DeleteAdminDialog
                admin={admin}
                mutate={mutate}
                working={working}
              />
            </footer>
          </article>
        )
      })}
    </div>
  )
}

function DeleteAdminDialog({
  admin,
  mutate,
  working,
}: {
  admin: Admin
  mutate: AdminMutation
  working: boolean
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState(false)

  async function confirmDelete() {
    setActionError(false)
    setDeleting(true)
    try {
      const deleted = await mutate(
        () => deleteAdmin(admin.id),
        t("adminDeleted")
      )
      if (deleted) setOpen(false)
    } catch {
      setActionError(true)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!deleting) {
          setOpen(nextOpen)
          if (nextOpen) setActionError(false)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          icon={<Trash2 />}
          className={`${styles.actionButton} ${styles.dangerButton}`}
          disabled={working}
        >
          {common("delete")}
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`${styles.dialogSurface} ${styles.dangerDialog}`}
      >
        <DialogHeader className={styles.dialogHeader}>
          <span className={styles.dialogIcon} aria-hidden="true">
            <TriangleAlert />
          </span>
          <div>
            <DialogTitle className={styles.dialogTitle}>
              {common("delete")}
            </DialogTitle>
            <DialogDescription className={styles.dialogDescription}>
              {t("confirmDelete", { name: admin.name })}
            </DialogDescription>
          </div>
        </DialogHeader>
        <p className={styles.dangerName}>{admin.email}</p>
        {actionError ? (
          <p className={styles.formError} role="alert">
            {common("unknown")}
          </p>
        ) : null}
        <DialogFooter className={styles.dialogFooter}>
          <Button
            type="button"
            variant="outline"
            icon={<X />}
            className={`${styles.dialogButton} admin-action-button`}
            disabled={deleting}
            onClick={() => setOpen(false)}
          >
            {common("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            icon={<Trash2 />}
            className={`${styles.dialogButton} admin-action-button`}
            disabled={deleting}
            onClick={confirmDelete}
          >
            {common("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
