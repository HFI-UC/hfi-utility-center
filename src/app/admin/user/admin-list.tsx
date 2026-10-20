"use client"

import {
  AlertCircle,
  KeyRound,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UserRound,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { TextActionDialog } from "@/app/admin/text-action-dialog"
import { EmptyState } from "@/components/layout/data-state"
import { StatusBadge } from "@/components/layout/status-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import { changeAdminPassword, deleteAdmin, setAdminNotifications } from "@/lib/api/admins"
import type { Admin } from "@/lib/api/types"

import { EditAdminDialog } from "./edit-admin-dialog"
import { PermissionDialog } from "./permission-dialog"

export function AdminList({
  admins,
  mutate,
  working,
  canManagePermissions,
}: {
  admins: Admin[]
  mutate: AdminMutation
  working: boolean
  canManagePermissions: boolean
}) {
  const t = useTranslations("admin")
  const isMobile = useIsMobile()

  if (admins.length === 0) {
    return <EmptyState icon={UserRound} title={t("usersEmpty")} />
  }

  if (isMobile) {
    return (
      <ul className="flex min-w-0 flex-col divide-y divide-border">
        {admins.map((admin) => (
          <li key={admin.id} className="py-4">
            <AdminAccountCard
              admin={admin}
              mutate={mutate}
              working={working}
              canManagePermissions={canManagePermissions}
            />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("columnAccount")}</TableHead>
          <TableHead className="w-72">{t("notifications")}</TableHead>
          <TableHead className="w-20 text-right">{t("actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admins.map((admin) => (
          <AdminAccountRow
            key={admin.id}
            admin={admin}
            mutate={mutate}
            working={working}
            canManagePermissions={canManagePermissions}
          />
        ))}
      </TableBody>
    </Table>
  )
}

function useAccountMenu({
  admin,
  mutate,
  working,
  canManagePermissions,
}: {
  admin: Admin
  mutate: AdminMutation
  working: boolean
  canManagePermissions: boolean
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [editOpen, setEditOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [permissionsOpen, setPermissionsOpen] = useState(false)

  return {
    trigger: (
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                aria-label={t("actions")}
                disabled={working}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Pencil />
                {common("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setPasswordOpen(true)}>
                <KeyRound />
                {t("changePassword")}
              </DropdownMenuItem>
              {canManagePermissions ? (
                <DropdownMenuItem onSelect={() => setPermissionsOpen(true)}>
                  <ShieldCheck />
                  {t("managePermissions")}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                <Trash2 />
                {common("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipTrigger>
        <TooltipContent>{t("actions")}</TooltipContent>
      </Tooltip>
    ),
    dialogs: (
      <>
        <EditAdminDialog
          admin={admin}
          mutate={mutate}
          working={working}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
        <TextActionDialog
          open={passwordOpen}
          onOpenChange={setPasswordOpen}
          title={t("changePassword")}
          label={t("newPassword")}
          inputType="password"
          cancelLabel={common("cancel")}
          saveLabel={common("save")}
          onSave={(password) =>
            mutate(() => changeAdminPassword(admin.id, password), t("passwordUpdated"))
          }
        />
        <DeleteAdminDialog
          admin={admin}
          mutate={mutate}
          working={working}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />
        {canManagePermissions ? (
          <PermissionDialog
            admin={admin}
            mutate={mutate}
            working={working}
            open={permissionsOpen}
            onOpenChange={setPermissionsOpen}
          />
        ) : null}
      </>
    ),
  }
}

function useNotificationToggle(admin: Admin, mutate: AdminMutation) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [failed, setFailed] = useState(false)
  const receives = admin.receiveReservationNotifications

  return {
    receives,
    error: failed ? common("unknown") : undefined,
    toggle: async () => {
      setFailed(false)
      try {
        await mutate(
          () => setAdminNotifications(admin.id, !receives),
          t("adminNotificationsUpdated"),
        )
      } catch {
        setFailed(true)
      }
    },
  }
}

function AdminAccountRow({
  admin,
  mutate,
  working,
  canManagePermissions,
}: {
  admin: Admin
  mutate: AdminMutation
  working: boolean
  canManagePermissions: boolean
}) {
  const { trigger, dialogs } = useAccountMenu({ admin, mutate, working, canManagePermissions })
  const { receives, error, toggle } = useNotificationToggle(admin, mutate)

  return (
    <TableRow>
      <TableCell>
        <AccountIdentity admin={admin} />
      </TableCell>
      <TableCell>
        <NotificationControl
          receives={receives}
          error={error}
          working={working}
          onToggle={() => void toggle()}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end">{trigger}</div>
        {dialogs}
      </TableCell>
    </TableRow>
  )
}

function AdminAccountCard({
  admin,
  mutate,
  working,
  canManagePermissions,
}: {
  admin: Admin
  mutate: AdminMutation
  working: boolean
  canManagePermissions: boolean
}) {
  const { trigger, dialogs } = useAccountMenu({ admin, mutate, working, canManagePermissions })
  const { receives, error, toggle } = useNotificationToggle(admin, mutate)

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <AccountIdentity admin={admin} />
        {trigger}
      </div>
      <NotificationControl
        receives={receives}
        error={error}
        working={working}
        onToggle={() => void toggle()}
      />
      {dialogs}
    </div>
  )
}

function AccountIdentity({ admin }: { admin: Admin }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar>
        <AvatarFallback>{admin.name.trim().slice(0, 1).toUpperCase() || "A"}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium break-words">{admin.name}</span>
        <span className="text-xs text-muted-foreground">
          {admin.role === "global" ? "Global" : "Room"}
        </span>
        <a
          href={`mailto:${admin.email}`}
          className="truncate text-xs text-muted-foreground underline underline-offset-4"
        >
          {admin.email}
        </a>
      </div>
    </div>
  )
}

function NotificationControl({
  receives,
  error,
  working,
  onToggle,
}: {
  receives: boolean
  error?: string
  working: boolean
  onToggle: () => void
}) {
  const t = useTranslations("admin")
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <Switch
          checked={receives}
          disabled={working}
          onCheckedChange={onToggle}
          aria-label={t("notifications")}
        />
        <StatusBadge tone={receives ? "approved" : "neutral"}>
          {receives ? t("reservationNotificationsOn") : t("reservationNotificationsOff")}
        </StatusBadge>
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}

function DeleteAdminDialog({
  admin,
  mutate,
  working,
  open,
  onOpenChange,
}: {
  admin: Admin
  mutate: AdminMutation
  working: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState(false)

  function handleOpenChange(nextOpen: boolean) {
    if (deleting) return
    onOpenChange(nextOpen)
    if (nextOpen) setActionError(false)
  }

  async function confirmDelete() {
    setActionError(false)
    setDeleting(true)
    try {
      const deleted = await mutate(() => deleteAdmin(admin.id), t("adminDeleted"))
      if (deleted) onOpenChange(false)
    } catch {
      setActionError(true)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlert />
          </AlertDialogMedia>
          <AlertDialogTitle>{common("delete")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("confirmDelete", { name: admin.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <p className="truncate text-sm text-muted-foreground">{admin.email}</p>
        {actionError ? (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{common("unknown")}</AlertDescription>
          </Alert>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">{common("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleting || working}
            onClick={(event) => {
              event.preventDefault()
              void confirmDelete()
            }}
          >
            <Trash2 />
            {common("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
