import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusTone =
  | "success"
  | "warning"
  | "info"
  | "danger"
  | "neutral"
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"

const DOT_CLASS: Record<StatusTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  danger: "bg-danger",
  pending: "bg-warning",
  approved: "bg-success",
  rejected: "bg-danger",
  cancelled: "bg-muted-foreground",
  neutral: "bg-muted-foreground",
}

export function StatusBadge({
  tone,
  children,
  dot = false,
  className,
}: {
  tone: StatusTone
  children: ReactNode
  dot?: boolean
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn("max-w-full", className)} data-tone={tone}>
      {dot ? (
        <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", DOT_CLASS[tone])} />
      ) : null}
      <span className="truncate">{children}</span>
    </Badge>
  )
}
