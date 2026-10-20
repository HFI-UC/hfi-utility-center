"use client"

import { useTranslations } from "next-intl"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"

import { ActiveBookingPanel } from "./active-booking-panel"
import { CancellationGate } from "./cancellation-gate"
import { initialDraft, useCancellation } from "./use-cancellation"

// Token is passed via server searchParams to preserve SSR without de-opting to client render.
export function CancelReservationFlow({ token }: { token: string }) {
  const t = useTranslations("neo.management")
  const flow = useCancellation(token)
  const { preview, catalog, draft } = flow

  return (
    <AppShell width="narrow">
      <PageHeader title={t("title")} />

      <div className="flex min-w-0 flex-col gap-4">
        <CancellationGate
          hasToken={Boolean(token)}
          loading={flow.loading}
          error={flow.error}
          hasPreview={Boolean(preview)}
          cancelled={flow.result === "cancelled"}
        />

        {preview && catalog && draft && flow.result !== "cancelled" ? (
          <ActiveBookingPanel
            preview={preview}
            catalog={catalog}
            draft={draft}
            result={flow.result}
            error={flow.error}
            working={flow.working}
            mode={flow.mode}
            editStep={flow.editStep}
            slideKey={flow.slideKey}
            slideDirection={flow.slideDirection}
            hasSlid={flow.hasSlid}
            availability={flow.availability}
            availabilityError={flow.availabilityError}
            loadingAvailability={flow.loadingAvailability}
            selectedRoom={flow.selectedRoom}
            roomsForCampus={flow.roomsForCampus}
            visibleTimeOptions={flow.visibleTimeOptions}
            today={flow.today}
            maximumDate={flow.maximumDate}
            dateFormatter={flow.dateFormatter}
            formatTime={flow.formatTime}
            calendarOpen={flow.calendarOpen}
            onStartEdit={() => {
              flow.setError(undefined)
              flow.setResult(undefined)
              flow.navigate("forward")
              flow.setEditStep("location")
              flow.setMode("edit")
            }}
            onCancel={() => void flow.confirmCancellation()}
            onCampusChange={(campus) => {
              flow.setDraft({ ...draft, campus, room: 0, startTime: 0, endTime: 0 })
              flow.clearAvailability()
            }}
            onRoomChange={(room) => {
              flow.setDraft({ ...draft, room, startTime: 0, endTime: 0 })
              flow.clearAvailability()
            }}
            onCalendarOpenChange={flow.setCalendarOpen}
            onDateSelect={flow.resetTimes}
            onReloadAvailability={flow.reloadAvailability}
            onSelectTime={flow.selectTime}
            onExitEdit={() => {
              flow.setDraft(initialDraft(preview, catalog.rooms))
              flow.navigate("back")
              flow.setMode("details")
            }}
            onNextStep={() => {
              flow.navigate("forward")
              flow.setEditStep("time")
            }}
            onPreviousStep={() => flow.setEditStep("location")}
            onSave={() => void flow.saveChanges()}
          />
        ) : null}
      </div>
    </AppShell>
  )
}
