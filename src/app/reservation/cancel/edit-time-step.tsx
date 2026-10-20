"use client"

import { AlertTriangle, ArrowLeft, Save } from "lucide-react"
import { useTranslations } from "next-intl"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { AvailabilityData, Room } from "@/lib/api/types"

import type { TimeOption } from "../create/steps/time-options"
import { EditDateField } from "./edit-date-field"
import { EditTimeRangeField } from "./edit-time-range-field"
import type { EditDraft } from "./use-cancellation"

export function EditTimeStep({
  draft,
  availability,
  availabilityError,
  loadingAvailability,
  selectedRoom,
  visibleTimeOptions,
  today,
  maximumDate,
  dateFormatter,
  formatTime,
  calendarOpen,
  working,
  onCalendarOpenChange,
  onDateSelect,
  onReload,
  onSelectTime,
  onPrevious,
  onSave,
}: {
  draft: EditDraft
  availability?: AvailabilityData
  availabilityError?: string
  loadingAvailability: boolean
  selectedRoom?: Room
  visibleTimeOptions: TimeOption[]
  today: Date
  maximumDate: Date
  dateFormatter: Intl.DateTimeFormat
  formatTime: (value: number) => string
  calendarOpen: boolean
  working: boolean
  onCalendarOpenChange: (open: boolean) => void
  onDateSelect: (date: string) => void
  onReload: () => void
  onSelectTime: (option: TimeOption) => void
  onPrevious: () => void
  onSave: () => void
}) {
  const t = useTranslations("neo.management")

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {availabilityError ? (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden />
          <AlertDescription className="break-words">{availabilityError}</AlertDescription>
        </Alert>
      ) : null}

      <EditDateField
        date={draft.date}
        today={today}
        maximumDate={maximumDate}
        dateFormatter={dateFormatter}
        selectedRoom={selectedRoom}
        open={calendarOpen}
        onOpenChange={onCalendarOpenChange}
        onSelect={onDateSelect}
      />

      <EditTimeRangeField
        startTime={draft.startTime}
        endTime={draft.endTime}
        availability={availability}
        options={visibleTimeOptions}
        loading={loadingAvailability}
        formatTime={formatTime}
        onReload={onReload}
        onSelect={onSelectTime}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          disabled={working}
          onClick={onPrevious}
          className="min-h-11 sm:min-h-8"
        >
          <ArrowLeft aria-hidden />
          {t("previous")}
        </Button>
        <Button
          type="button"
          disabled={working || !draft.startTime || !draft.endTime}
          onClick={onSave}
          className="min-h-11 sm:min-h-8"
        >
          {working ? <Spinner /> : <Save aria-hidden />}
          {t("save")}
        </Button>
      </div>
    </div>
  )
}
