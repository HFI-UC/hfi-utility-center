import * as React from "react"
import { cn } from "@/lib/utils"

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-foreground focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}
