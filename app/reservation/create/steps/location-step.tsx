import { useTranslations } from "next-intl"
import { useController, useFormContext } from "react-hook-form"
import { ChoiceGrid } from "../choice-grid"
import { StepLayout } from "../step-layout"
import type { ReservationFormValues } from "../form"
import type { CatalogData } from "@/lib/api/types"

export function LocationStep({ catalog }: { catalog: CatalogData }) {
  const t = useTranslations("booking")
  const { control, setValue } = useFormContext<ReservationFormValues>()
  const { field: campusField, fieldState: campusFieldState } = useController({
    control,
    name: "bookingCampusId",
  })
  const { field: roomField, fieldState: roomFieldState } = useController({
    control,
    name: "room",
  })
  const campusId = campusField.value
  const roomId = roomField.value
  const rooms = catalog.rooms.filter((room) => room.campus === campusId)

  function clearSelectedTime() {
    setValue("startTime", 0)
    setValue("endTime", 0)
  }

  function selectCampus(campusId: number) {
    campusField.onChange(campusId)
    roomField.onChange(0)
    clearSelectedTime()
  }

  function selectRoom(roomId: number) {
    roomField.onChange(roomId)
    clearSelectedTime()
  }

  return (
    <StepLayout
      step={2}
      title={t("locationTitle")}
      error={campusFieldState.error?.message ?? roomFieldState.error?.message}
    >
      <h2 className="mb-3 text-sm font-semibold">{t("campus")}</h2>
      <ChoiceGrid
        name={campusField.name}
        label={t("campus")}
        value={campusId}
        invalid={campusFieldState.invalid}
        items={catalog.campuses
          .filter((campus) => !campus.isPrivileged)
          .map((campus) => ({ value: campus.id, label: campus.name }))}
        onChange={selectCampus}
        onBlur={campusField.onBlur}
        emptyText={t("roomEmpty")}
      />
      {campusId ? (
        <>
          <h2 className="mt-8 mb-3 text-sm font-semibold">{t("rooms")}</h2>
          <ChoiceGrid
            name={roomField.name}
            label={t("rooms")}
            value={roomId}
            invalid={roomFieldState.invalid}
            items={rooms.map((room) => ({
              value: room.id,
              label: room.name,
              disabled: !room.enabled,
            }))}
            onChange={selectRoom}
            onBlur={roomField.onBlur}
            emptyText={t("roomEmpty")}
          />
        </>
      ) : null}
    </StepLayout>
  )
}
