import * as React from "react"
import { cn } from "@/lib/utils"

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-y rounded-[2px] border border-foreground/50 bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-red-600 focus-visible:ring-1 focus-visible:ring-red-600 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}
