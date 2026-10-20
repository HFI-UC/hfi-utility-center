"use client"

import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

import type { AvailabilityData, CatalogData, Room } from "@/lib/api/types"

import type { TimeOption } from "../create/steps/time-options"
import { EditLocationStep } from "./edit-location-step"
import { EditTimeStep } from "./edit-time-step"
import type { EditDraft, EditStep } from "./use-cancellation"

function EditStepper({ step }: { step: EditStep }) {
  const t = useTranslations("neo.management")

  return (
    <ol className="flex items-center gap-2 text-xs">
      {(["location", "time"] as const).map((value, index) => {
        const active = step === value
        return (
          <li key={value} className="flex items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={
                active
                  ? "flex size-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
                  : "flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
              }
            >
              {index + 1}
            </span>
            <span className={active ? "font-medium" : "text-muted-foreground"}>
              {value === "location" ? t("selectLocation") : t("selectDateTime")}
            </span>
            {index === 0 ? <ArrowRight aria-hidden className="text-muted-foreground" /> : null}
          </li>
        )
      })}
    </ol>
  )
}

export function EditFlow({
  step,
  catalog,
  draft,
  availability,
  availabilityError,
  loadingAvailability,
  selectedRoom,
  roomsForCampus,
  visibleTimeOptions,
  today,
  maximumDate,
  dateFormatter,
  formatTime,
  calendarOpen,
  working,
  onCampusChange,
  onRoomChange,
  onCalendarOpenChange,
  onDateSelect,
  onReloadAvailability,
  onSelectTime,
  onExit,
  onNext,
  onPrevious,
  onSave,
}: {
  step: EditStep
  catalog: CatalogData
  draft: EditDraft
  availability?: AvailabilityData
  availabilityError?: string
  loadingAvailability: boolean
  selectedRoom?: Room
  roomsForCampus: Room[]
  visibleTimeOptions: TimeOption[]
  today: Date
  maximumDate: Date
  dateFormatter: Intl.DateTimeFormat
  formatTime: (value: number) => string
  calendarOpen: boolean
  working: boolean
  onCampusChange: (campus: number) => void
  onRoomChange: (room: number) => void
  onCalendarOpenChange: (open: boolean) => void
  onDateSelect: (date: string) => void
  onReloadAvailability: () => void
  onSelectTime: (option: TimeOption) => void
  onExit: () => void
  onNext: () => void
  onPrevious: () => void
  onSave: () => void
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <EditStepper step={step} />

      {step === "location" ? (
        <EditLocationStep
          catalog={catalog}
          draft={draft}
          roomsForCampus={roomsForCampus}
          onCampusChange={onCampusChange}
          onRoomChange={onRoomChange}
          onExit={onExit}
          onNext={onNext}
        />
      ) : (
        <EditTimeStep
          draft={draft}
          availability={availability}
          availabilityError={availabilityError}
          loadingAvailability={loadingAvailability}
          selectedRoom={selectedRoom}
          visibleTimeOptions={visibleTimeOptions}
          today={today}
          maximumDate={maximumDate}
          dateFormatter={dateFormatter}
          formatTime={formatTime}
          calendarOpen={calendarOpen}
          working={working}
          onCalendarOpenChange={onCalendarOpenChange}
          onDateSelect={(date) => {
            onDateSelect(date)
            onCalendarOpenChange(false)
          }}
          onReload={onReloadAvailability}
          onSelectTime={onSelectTime}
          onPrevious={onPrevious}
          onSave={onSave}
        />
      )}
    </div>
  )
}
