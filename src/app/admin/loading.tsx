"use client"

import { LoadingState } from "@/components/layout/data-state"

export default function Loading() {
  return (
    <div className="flex min-w-0 flex-col">
      <LoadingState rows={4} />
    </div>
  )
}
