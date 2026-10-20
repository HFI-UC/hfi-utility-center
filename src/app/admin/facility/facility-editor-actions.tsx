"use client"

import { Ellipsis, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState, type ReactElement, type ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogFooter } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FieldError } from "@/components/ui/field"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { AdminMutation } from "@/lib/api/admin-hooks"
import { cn } from "@/lib/utils"

export type FacilityEditorActions = {
  mutate: AdminMutation
  working: boolean
}

export const touchTarget = "min-h-11 sm:min-h-0"

export const iconTouchTarget = "size-11 sm:size-8"

export function RestoreFacilityButton({
  action,
  mutate,
  working,
}: FacilityEditorActions & { action: () => Promise<unknown> }) {
  const t = useTranslations("admin")
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={working}
      onClick={() => void mutate(action, t("facilityRestored"))}
      className={touchTarget}
    >
      <RotateCcw aria-hidden />
      {t("restoreArchived")}
    </Button>
  )
}

export function IconHint({ label, children }: { label: string; children: ReactElement }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function ResourceSection({
  title,
  count,
  action,
  children,
}: {
  title: string
  count: number
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex min-w-0 items-baseline gap-2 text-sm font-medium break-words">
          {title}
          <span className="text-muted-foreground tabular-nums">{count}</span>
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function StateDot({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground">
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          enabled ? "bg-success" : "bg-muted-foreground/40",
        )}
      />
      {label}
    </span>
  )
}

export function FacilityRowMenu({
  label,
  action,
  mutate,
  working,
  children,
}: FacilityEditorActions & {
  label: string
  action: () => Promise<unknown>
  children?: ReactNode
}) {
  const t = useTranslations("admin")
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("actions")}
            disabled={working}
            className="size-11 sm:size-7"
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          {children}
          {children ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem
            variant="destructive"
            disabled={working}
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 aria-hidden />
            {t("archive")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmFacilityDelete
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        label={label}
        action={action}
        mutate={mutate}
        working={working}
      />
    </>
  )
}

export function ConfirmFacilityDelete({
  open,
  onOpenChange,
  label,
  action,
  mutate,
  working,
}: FacilityEditorActions & {
  open: boolean
  onOpenChange: (open: boolean) => void
  label: string
  action: () => Promise<unknown>
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [error, setError] = useState("")

  async function removeFacility() {
    setError("")
    try {
      if (await mutate(action, t("facilityDeleted"))) onOpenChange(false)
    } catch {
      setError(common("unknown"))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("archive")}</AlertDialogTitle>
          <AlertDialogDescription>{t("confirmArchive", { name: label })}</AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <FieldError>{error}</FieldError> : null}
        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost" className={touchTarget}>
            {common("cancel")}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={working}
            onClick={removeFacility}
            className={touchTarget}
          >
            <Trash2 aria-hidden />
            {t("archive")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function DialogFormActions({
  mode,
  disabled,
}: {
  mode: "create" | "edit"
  disabled: boolean
}) {
  const common = useTranslations("common")

  return (
    <DialogFooter>
      <DialogClose asChild>
        <Button type="button" variant="ghost" className={touchTarget}>
          {common("cancel")}
        </Button>
      </DialogClose>
      <Button type="submit" disabled={disabled} className={touchTarget}>
        {mode === "create" ? <Plus aria-hidden /> : <Pencil aria-hidden />}
        {mode === "create" ? common("add") : common("save")}
      </Button>
    </DialogFooter>
  )
}
