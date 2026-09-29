"use client"

import type { LucideIcon } from "lucide-react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import { createElement, isValidElement, type ReactNode } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function LoadingState({
  label,
  rows = 3,
  className,
}: {
  label?: string
  rows?: number
  className?: string
}) {
  const t = useTranslations("states")

  return (
    <div
      // A polite live region for async status; `output` is a form-result
      // element and would be the wrong semantic here.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("flex w-full min-w-0 flex-col gap-3", className)}
    >
      <span className="sr-only">{label ?? t("loading")}</span>
      <Skeleton className="h-6 w-40 max-w-full" />
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: Math.max(1, rows) }, (_, slot) => `loading-row-${slot + 1}`).map(
          (rowKey, slot) => (
            <Skeleton key={rowKey} className={cn("h-4", slot % 3 === 2 ? "w-2/3" : "w-full")} />
          ),
        )}
      </div>
    </div>
  )
}

export function ErrorState({
  title,
  description,
  onRetry,
  retryLabel,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}) {
  const t = useTranslations("states")

  return (
    <Alert
      variant="destructive"
      className={cn("grid-cols-1 items-start sm:grid-cols-[auto_1fr_auto]", className)}
    >
      <AlertCircle aria-hidden />
      <div className="flex min-w-0 flex-col gap-1">
        <AlertTitle className="break-words">{title ?? t("errorTitle")}</AlertTitle>
        <AlertDescription className="break-words">
          {description ?? t("errorDescription")}
        </AlertDescription>
      </div>
      {onRetry ? (
        <TooltipProvider delayDuration={80}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onRetry}
                aria-label={retryLabel ?? t("retry")}
                className="size-9 justify-self-start sm:justify-self-end"
              >
                <RotateCcw aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{retryLabel ?? t("retry")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </Alert>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon | ReactNode
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  const t = useTranslations("states")

  return (
    <div
      className={cn(
        "flex min-h-40 w-full min-w-0 flex-col items-center justify-center gap-2 px-4 py-10 text-center",
        className,
      )}
    >
      <span className="text-muted-foreground">
        {isValidElement(icon)
          ? icon
          : createElement(icon as LucideIcon, { className: "size-5", "aria-hidden": true })}
      </span>
      <p className="text-sm font-medium break-words text-foreground">{title ?? t("emptyTitle")}</p>
      {description ? (
        <p className="max-w-sm text-sm break-words text-muted-foreground">{description}</p>
      ) : null}
      {action ? (
        <div className="mt-2 flex w-full flex-wrap justify-center gap-2">{action}</div>
      ) : null}
    </div>
  )
}
