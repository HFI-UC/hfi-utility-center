import { Check, DoorOpen } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useFormContext, useWatch } from "react-hook-form"

import { FieldError, FieldSet } from "@/components/astryx"
import type { CatalogData } from "@/lib/api/types"

import type { ReservationFormValues } from "../form"
import { StepLayout } from "../step-layout"

export function LocationStep({ catalog }: { catalog: CatalogData }) {
  const t = useTranslations("booking")
  const { control, setValue } = useFormContext<ReservationFormValues>()
  const campusId = useWatch({ control, name: "bookingCampusId" })
  const rooms = catalog.rooms.filter(
    (room) => room.campus === campusId && room.enabled
  )

  function clearSelectedTime() {
    setValue("startTime", 0)
    setValue("endTime", 0)
  }

  return (
    <StepLayout title={t("locationTitle")}>
      <Controller
        control={control}
        name="bookingCampusId"
        render={({ field, fieldState }) => (
          <FieldSet className="gap-3" data-invalid={fieldState.invalid}>
            <div className="campus-tabs">
              {catalog.campuses
                .filter((campus) => !campus.isPrivileged)
                .map((campus) => (
                  <button
                    type="button"
                    key={campus.id}
                    className={`campus-tab ${field.value === campus.id ? "campus-tab--active" : ""}`}
                    onClick={() => {
                      field.onChange(campus.id)
                      setValue("room", 0)
                      clearSelectedTime()
                    }}
                  >
                    {campus.name}
                  </button>
                ))}
            </div>
            <FieldError errors={[fieldState.error]} />
          </FieldSet>
        )}
      />

      {campusId ? (
        <Controller
          control={control}
          name="room"
          render={({ field, fieldState }) => (
            <FieldSet className="mt-6 gap-3" data-invalid={fieldState.invalid}>
              <div className="resource-heading">
                <div>
                  <span className="page-overline">Room resources</span>
                  <h2>{t("rooms")}</h2>
                </div>
                <span className="resource-count">
                  {rooms.length} 个可用空间
                </span>
              </div>
              <div className="room-grid">
                {rooms.map((room) => (
                  <button
                    type="button"
                    key={room.id}
                    className={`room-card ${field.value === room.id ? "room-card--selected" : ""}`}
                    onClick={() => {
                      field.onChange(room.id)
                      clearSelectedTime()
                    }}
                  >
                    <span className="room-card__icon">
                      <DoorOpen size={18} />
                    </span>
                    <strong>{room.name}</strong>
                    {field.value === room.id ? (
                      <span className="room-card__check">
                        <Check size={13} />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
              {!rooms.length ? <p>{t("roomEmpty")}</p> : null}
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
        />
      ) : null}
    </StepLayout>
  )
}
