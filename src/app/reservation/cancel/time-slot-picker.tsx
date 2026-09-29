"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import type { AvailabilityData } from "@/lib/api/types"

import { timeCanBeSelected, timeIsSelected, type TimeOption } from "../create/steps/time-options"

export function TimeSlotPicker({
  availability,
  options,
  startTime,
  endTime,
  formatTime,
  onSelect,
}: {
  availability: AvailabilityData
  options: TimeOption[]
  startTime: number
  endTime: number
  formatTime: (value: number) => string
  onSelect: (option: TimeOption) => void
}) {
  const bookingT = useTranslations("booking")

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-success" />
          {bookingT("available")}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-muted-foreground/40" />
          {bookingT("occupied")}
        </span>
      </div>
      <div className="grid min-w-0 grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {options.map((option) => {
          const selected = timeIsSelected(option.timestamp, startTime, endTime)
          const selectable = timeCanBeSelected({
            option,
            slots: availability.slots,
            startTime,
            endTime,
          })
          const occupied = option.status === "occupied" && !selectable
          return (
            <Button
              type="button"
              key={option.timestamp}
              disabled={!selectable && !selected}
              aria-pressed={selected}
              variant={selected ? "default" : occupied ? "ghost" : "outline"}
              className="min-h-11 sm:min-h-8"
              onClick={() => onSelect(option)}
            >
              {formatTime(option.timestamp)}
            </Button>
          )
        })}
      </div>
    </>
  )
}
