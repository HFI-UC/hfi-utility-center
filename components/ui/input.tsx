import * as React from "react"
import { cn } from "@/lib/utils"

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[2px] border border-foreground/50 bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-red-600 focus-visible:ring-1 focus-visible:ring-red-600 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}
