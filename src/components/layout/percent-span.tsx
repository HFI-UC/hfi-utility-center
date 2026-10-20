import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

type PercentBoxProps = {
  left: string
  width?: string
  className?: string
}

/** A box pinned by a runtime percentage. Timelines cannot know these offsets at build time. */
export function PercentSpan({
  left,
  width,
  className,
  ...props
}: ComponentProps<"span"> & PercentBoxProps) {
  return <span {...props} className={cn("absolute", className)} style={{ left, width }} />
}

/** Same pin as `PercentSpan`, on a div so a slider can take focus and pointer capture. */
export function PercentBox({
  left,
  width,
  className,
  ...props
}: ComponentProps<"div"> & PercentBoxProps) {
  return <div {...props} className={cn("absolute", className)} style={{ left, width }} />
}
