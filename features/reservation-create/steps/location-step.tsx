import { useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"
import { ChoiceGrid } from "@/features/reservation-create/choice-grid"
import { StepLayout } from "@/features/reservation-create/step-layout"
import type { ReservationFormValues } from "@/features/reservation-create/schema"
import type { BootstrapData } from "@/lib/api/types"

export function LocationStep({ catalog }: { catalog: BootstrapData }) {
  const t = useTranslations("booking")
  const { setValue, watch, formState } = useFormContext<ReservationFormValues>()
  const campusId = watch("bookingCampusId")
  const roomId = watch("room")
  const rooms = catalog.rooms.filter((room) => room.campus === campusId)
  const resetTime = () => { setValue("startTime", 0); setValue("endTime", 0) }
  return <StepLayout eyebrow="02 / 05" title={t("locationTitle")} error={formState.errors.bookingCampusId?.message ?? formState.errors.room?.message}>
    <h2 className="mb-3 text-sm font-semibold">{t("campus")}</h2>
    <ChoiceGrid value={campusId} items={catalog.campuses.filter((campus) => !campus.isPrivileged).map((campus) => ({ value: campus.id, label: campus.name }))} onChange={(bookingCampusId) => {
      setValue("bookingCampusId", bookingCampusId, { shouldValidate: true }); setValue("room", 0); resetTime()
    }} />
    {campusId ? <><h2 className="mb-3 mt-8 text-sm font-semibold">{t("rooms")}</h2><ChoiceGrid value={roomId} items={rooms.map((room) => ({ value: room.id, label: room.name, description: room.enabled ? t("rules", { count: room.policies.filter((item) => item.enabled).length }) : t("disabled"), disabled: !room.enabled }))} onChange={(room) => {
      setValue("room", room, { shouldValidate: true }); resetTime()
    }} emptyText={t("roomEmpty")} /></> : null}
  </StepLayout>
}
