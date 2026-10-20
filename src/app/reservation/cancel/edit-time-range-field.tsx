"use client"

import { RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import type { AvailabilityData } from "@/lib/api/types"

import type { TimeOption } from "../create/steps/time-options"
import { TimeSlotPicker } from "./time-slot-picker"

export function EditTimeRangeField({
  startTime,
  endTime,
  availability,
  options,
  loading,
  formatTime,
  onReload,
  onSelect,
}: {
  startTime: number
  endTime: number
  availability?: AvailabilityData
  options: TimeOption[]
  loading: boolean
  formatTime: (value: number) => string
  onReload: () => void
  onSelect: (option: TimeOption) => void
}) {
  const bookingT = useTranslations("booking")

  return (
    <FieldSet className="min-w-0">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <FieldLegend variant="label">{bookingT("timeRange")}</FieldLegend>
          <FieldDescription>
            {startTime && endTime
              ? bookingT("selectedRange", {
                  start: formatTime(startTime),
                  end: formatTime(endTime),
                })
              : startTime
                ? bookingT("selectEndHint")
                : bookingT("selectStartHint")}
          </FieldDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={bookingT("refresh")}
          disabled={loading}
          onClick={onReload}
          className="size-11 shrink-0 sm:size-8"
        >
          {loading ? <Spinner /> : <RefreshCw aria-hidden />}
        </Button>
      </div>

      {loading ? (
        <div
          className="flex min-h-20 items-center gap-2 text-sm text-muted-foreground"
          aria-live="polite"
        >
          <Spinner />
          {bookingT("checking")}
        </div>
      ) : null}

      {availability && !loading ? (
        <TimeSlotPicker
          availability={availability}
          options={options}
          startTime={startTime}
          endTime={endTime}
          formatTime={formatTime}
          onSelect={onSelect}
        />
      ) : null}
    </FieldSet>
  )
}
