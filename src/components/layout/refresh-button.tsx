"use client"

import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function RefreshButton({
  label,
  loading,
  onRefresh,
  className,
}: {
  label: string
  loading: boolean
  onRefresh: () => void
  className?: string
}) {
  return (
    <TooltipProvider delayDuration={80}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn("size-9", className)}
            aria-label={label}
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn(loading && "motion-safe:animate-spin")} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
