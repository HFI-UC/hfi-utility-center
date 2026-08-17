import { useTranslations } from "next-intl"
import { Controller, useFormContext, useWatch } from "react-hook-form"

import { FieldError, FieldLegend, FieldSet } from "@/components/ui/field"
import type { CatalogData } from "@/lib/api/types"

import { ChoiceGrid } from "../choice-grid"
import type { ReservationFormValues } from "../form"
import { StepLayout } from "../step-layout"

export function LocationStep({ catalog }: { catalog: CatalogData }) {
  const t = useTranslations("booking")
  const { control, setValue } = useFormContext<ReservationFormValues>()
  const campusId = useWatch({ control, name: "bookingCampusId" })
  const rooms = catalog.rooms.filter((room) => room.campus === campusId)

  function clearSelectedTime() {
    setValue("startTime", 0)
    setValue("endTime", 0)
  }

  return (
    <StepLayout title={t("locationTitle")}>
      <Controller
        control={control}
        name="bookingCampusId"
        render={({ field: { onChange, ...field }, fieldState }) => (
          <FieldSet className="gap-3" data-invalid={fieldState.invalid}>
            <FieldLegend variant="label">{t("campus")}</FieldLegend>
            <ChoiceGrid
              {...field}
              label={t("campus")}
              invalid={fieldState.invalid}
              items={catalog.campuses
                .filter((campus) => !campus.isPrivileged)
                .map((campus) => ({ value: campus.id, label: campus.name }))}
              onChange={(nextCampusId) => {
                onChange(nextCampusId)
                setValue("room", 0)
                clearSelectedTime()
              }}
              emptyText={t("roomEmpty")}
            />
            <FieldError errors={[fieldState.error]} />
          </FieldSet>
        )}
      />

      {campusId ? (
        <Controller
          control={control}
          name="room"
          render={({ field: { onChange, ...field }, fieldState }) => (
            <FieldSet className="mt-6 gap-3" data-invalid={fieldState.invalid}>
              <FieldLegend variant="label">{t("rooms")}</FieldLegend>
              <ChoiceGrid
                {...field}
                label={t("rooms")}
                invalid={fieldState.invalid}
                items={rooms.map((room) => ({
                  value: room.id,
                  label: room.name,
                  disabled: !room.enabled,
                }))}
                onChange={(nextRoomId) => {
                  onChange(nextRoomId)
                  clearSelectedTime()
                }}
                emptyText={t("roomEmpty")}
              />
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
        />
      ) : null}
    </StepLayout>
  )
}
