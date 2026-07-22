import { useTranslations } from "next-intl"
import { useController, useFormContext } from "react-hook-form"
import { ChoiceGrid } from "@/features/reservation-create/choice-grid"
import { StepLayout } from "@/features/reservation-create/step-layout"
import type { ReservationFormValues } from "@/features/reservation-create/schema"
import type { BootstrapData } from "@/lib/api/types"

export function LocationStep({ catalog }: { catalog: BootstrapData }) {
  const t = useTranslations("booking")
  const { control, setValue } = useFormContext<ReservationFormValues>()
  const { field: campusField, fieldState: campusFieldState } = useController({ control, name: "bookingCampusId" })
  const { field: roomField, fieldState: roomFieldState } = useController({ control, name: "room" })
  const campusId = campusField.value
  const roomId = roomField.value
  const rooms = catalog.rooms.filter((room) => room.campus === campusId)
  const resetTime = () => { setValue("startTime", 0); setValue("endTime", 0) }
  return <StepLayout eyebrow="02 / 05" title={t("locationTitle")} error={campusFieldState.error?.message ?? roomFieldState.error?.message}>
    <h2 className="mb-3 text-sm font-semibold">{t("campus")}</h2>
    <ChoiceGrid name={campusField.name} label={t("campus")} value={campusId} invalid={campusFieldState.invalid} items={catalog.campuses.filter((campus) => !campus.isPrivileged).map((campus) => ({ value: campus.id, label: campus.name }))} onChange={(bookingCampusId) => {
      campusField.onChange(bookingCampusId); roomField.onChange(0); resetTime()
    }} onBlur={campusField.onBlur} />
    {campusId ? <><h2 className="mb-3 mt-8 text-sm font-semibold">{t("rooms")}</h2><ChoiceGrid name={roomField.name} label={t("rooms")} value={roomId} invalid={roomFieldState.invalid} items={rooms.map((room) => ({ value: room.id, label: room.name, description: room.enabled ? t("rules", { count: room.policies.filter((item) => item.enabled).length }) : t("disabled"), disabled: !room.enabled }))} onChange={(room) => {
      roomField.onChange(room); resetTime()
    }} onBlur={roomField.onBlur} emptyText={t("roomEmpty")} /></> : null}
  </StepLayout>
}
