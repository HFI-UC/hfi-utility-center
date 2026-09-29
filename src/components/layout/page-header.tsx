import type { ReactNode } from "react"

import { Breadcrumb, BreadcrumbList } from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  breadcrumb,
  children,
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  breadcrumb?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-4 pb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {breadcrumb ? (
          <Breadcrumb className="min-w-0">
            <BreadcrumbList className="min-w-0 flex-wrap">{breadcrumb}</BreadcrumbList>
          </Breadcrumb>
        ) : null}
        {eyebrow ? (
          <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="min-w-0 text-2xl font-semibold tracking-tight text-balance break-words">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm break-words text-muted-foreground">{description}</p>
        ) : null}
        {children}
      </div>
      {actions ? (
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
