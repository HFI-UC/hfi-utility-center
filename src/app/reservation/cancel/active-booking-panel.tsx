"use client"

import { AlertTriangle, CheckCircle2, MapPin } from "lucide-react"
import { useTranslations } from "next-intl"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { CancellationPreview } from "@/lib/api/reservations"
import type { AvailabilityData, CatalogData, Room } from "@/lib/api/types"
import { cn } from "@/lib/utils"

import type { TimeOption } from "../create/steps/time-options"
import { CancelDetails } from "./cancel-details"
import { EditFlow } from "./edit-flow"
import type { EditDraft, EditStep } from "./use-cancellation"

const STATUS_DOT = {
  approved: "bg-success",
  pending: "bg-warning",
  ai_reviewing: "bg-info",
  rejected: "bg-danger",
  cancelled: "bg-muted-foreground/40",
} as const

export function ActiveBookingPanel({
  preview,
  catalog,
  draft,
  result,
  error,
  working,
  mode,
  editStep,
  slideKey,
  slideDirection,
  hasSlid,
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
  onStartEdit,
  onCancel,
  onCampusChange,
  onRoomChange,
  onCalendarOpenChange,
  onDateSelect,
  onReloadAvailability,
  onSelectTime,
  onExitEdit,
  onNextStep,
  onPreviousStep,
  onSave,
}: {
  preview: CancellationPreview
  catalog: CatalogData
  draft: EditDraft
  result?: "modified" | "cancelled"
  error?: string
  working: boolean
  mode: "details" | "edit"
  editStep: EditStep
  slideKey: string
  slideDirection: "forward" | "back"
  hasSlid: boolean
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
  onStartEdit: () => void
  onCancel: () => void
  onCampusChange: (campus: number) => void
  onRoomChange: (room: number) => void
  onCalendarOpenChange: (open: boolean) => void
  onDateSelect: (date: string) => void
  onReloadAvailability: () => void
  onSelectTime: (option: TimeOption) => void
  onExitEdit: () => void
  onNextStep: () => void
  onPreviousStep: () => void
  onSave: () => void
}) {
  const t = useTranslations("neo.management")
  const statusT = useTranslations("status")

  return (
    <div className="motion-safe:animate-content-reveal">
      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <h2 className="flex min-w-0 items-center gap-2 text-base font-medium break-words">
            <MapPin aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            {preview.roomName}
          </h2>
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
            <span aria-hidden className={`size-1.5 rounded-full ${STATUS_DOT[preview.status]}`} />
            {statusT(preview.status)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground tabular-nums">
          {t("remainingEdits", { count: preview.remainingEdits })}
        </p>

        {result === "modified" ? (
          <Alert>
            <CheckCircle2 aria-hidden />
            <AlertTitle className="break-words">{t("modifiedTitle")}</AlertTitle>
            <AlertDescription className="break-words">{t("modifiedDescription")}</AlertDescription>
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle aria-hidden />
            <AlertDescription className="break-words">{error}</AlertDescription>
          </Alert>
        ) : null}

        <div
          key={slideKey}
          className={cn(
            "flex min-w-0 flex-col gap-4",
            hasSlid && "motion-safe:animate-page-slide",
            hasSlid &&
              (slideDirection === "back"
                ? "[--page-from-x:calc(var(--distance-small)*-1)]"
                : "[--page-from-x:var(--distance-small)]"),
          )}
        >
          {mode === "details" ? (
            <CancelDetails
              preview={preview}
              dateFormatter={dateFormatter}
              working={working}
              onEdit={onStartEdit}
              onCancel={onCancel}
            />
          ) : (
            <EditFlow
              step={editStep}
              catalog={catalog}
              draft={draft}
              availability={availability}
              availabilityError={availabilityError}
              loadingAvailability={loadingAvailability}
              selectedRoom={selectedRoom}
              roomsForCampus={roomsForCampus}
              visibleTimeOptions={visibleTimeOptions}
              today={today}
              maximumDate={maximumDate}
              dateFormatter={dateFormatter}
              formatTime={formatTime}
              calendarOpen={calendarOpen}
              working={working}
              onCampusChange={onCampusChange}
              onRoomChange={onRoomChange}
              onCalendarOpenChange={onCalendarOpenChange}
              onDateSelect={onDateSelect}
              onReloadAvailability={onReloadAvailability}
              onSelectTime={onSelectTime}
              onExit={onExitEdit}
              onNext={onNextStep}
              onPrevious={onPreviousStep}
              onSave={onSave}
            />
          )}
        </div>
      </section>
    </div>
  )
}
