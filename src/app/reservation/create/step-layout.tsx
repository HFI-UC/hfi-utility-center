import { CircleAlert } from "lucide-react"
import { useId, type ReactNode } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"

export function StepLayout({
  title,
  description,
  error,
  children,
}: {
  title: string
  description?: string
  error?: string
  children: ReactNode
}) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="flex min-w-0 flex-col gap-5">
      <div className="flex min-w-0 flex-col gap-1">
        <h2
          id={titleId}
          tabIndex={-1}
          className="scroll-mt-24 text-xl font-semibold tracking-tight break-words outline-none"
        >
          {title}
        </h2>
        {description ? (
          <p className="text-sm break-words text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {error ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden />
          <AlertDescription className="break-words">{error}</AlertDescription>
        </Alert>
      ) : null}
      {children}
    </section>
  )
}
