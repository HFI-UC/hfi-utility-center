import type { ReactNode } from "react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function SectionCard({
  title,
  description,
  actions,
  children,
  footer,
  className,
  contentClassName,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  contentClassName?: string
}) {
  return (
    <Card size="sm" className={cn("min-w-0", className)}>
      {title || description || actions ? (
        <CardHeader className="min-w-0">
          <div className="flex min-w-0 flex-col gap-1">
            {title ? <CardTitle className="break-words">{title}</CardTitle> : null}
            {description ? (
              <CardDescription className="break-words">{description}</CardDescription>
            ) : null}
          </div>
          {actions ? (
            <CardAction className="flex flex-wrap items-center">{actions}</CardAction>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn("min-w-0", contentClassName)}>{children}</CardContent>
      {footer ? <CardFooter className="flex-wrap">{footer}</CardFooter> : null}
    </Card>
  )
}
