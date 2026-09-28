import { Check, DoorOpen } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useFormContext, useWatch } from "react-hook-form"

import { FieldError, FieldSet } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { CatalogData } from "@/lib/api/types"

import type { ReservationFormValues } from "../form"
import { StepLayout } from "../step-layout"
import { DateTimeStep } from "./date-time-step"

export function LocationStep({
  catalog,
  privileged = false,
}: {
  catalog: CatalogData
  privileged?: boolean
}) {
  const t = useTranslations("booking")
  const { control, setValue, clearErrors } = useFormContext<ReservationFormValues>()
  const [campusId, roomId] = useWatch({ control, name: ["bookingCampusId", "room"] })
  const campuses = catalog.campuses
  const rooms = catalog.rooms.filter(
    (room) => room.campus === campusId && (privileged || room.enabled),
  )
  const campus = campuses.find((item) => item.id === campusId)

  function clearSelectedTime() {
    clearErrors(["bookingCampusId", "room", "startTime", "endTime"])
    setValue("startTime", 0)
    setValue("endTime", 0)
  }

  return (
    <StepLayout title={t("locationTitle")} description={t("locationDescription")}>
      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <Controller
            control={control}
            name="bookingCampusId"
            render={({ field, fieldState }) => (
              <FieldSet className="min-w-0 gap-3" data-invalid={fieldState.invalid}>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  spacing={0}
                  aria-label={t("campus")}
                  value={String(campusId)}
                  onValueChange={(value) => {
                    if (!value) return
                    field.onChange(Number(value))
                    setValue("room", 0)
                    clearSelectedTime()
                  }}
                  className="w-full [&>[data-state=on]]:bg-primary [&>[data-state=on]]:text-primary-foreground"
                >
                  {campuses.map((item) => (
                    <ToggleGroupItem
                      type="button"
                      key={item.id}
                      value={String(item.id)}
                      className="h-10 min-w-0 flex-1 px-3"
                    >
                      <span className="truncate">{item.name}</span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <FieldError errors={[fieldState.error]} />
              </FieldSet>
            )}
          />

          {campusId ? (
            <Controller
              control={control}
              name="room"
              render={({ field, fieldState }) => (
                <FieldSet className="min-w-0 gap-3" data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-medium">{campus?.name}</p>
                    <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {t("availableRooms", { count: rooms.length })}
                    </p>
                  </div>
                  {rooms.length ? (
                    <ToggleGroup
                      type="single"
                      value={String(field.value)}
                      onValueChange={(value) => {
                        if (!value) return
                        field.onChange(Number(value))
                        clearSelectedTime()
                      }}
                      aria-label={t("rooms")}
                      className="flex w-full flex-col items-stretch"
                    >
                      {rooms.map((room) => {
                        const selected = field.value === room.id
                        return (
                          <ToggleGroupItem
                            key={room.id}
                            value={String(room.id)}
                            className="h-11 w-full justify-between rounded-none border-0 border-b bg-transparent px-1 font-normal hover:bg-transparent data-[state=on]:bg-transparent data-[state=on]:text-primary"
                          >
                            <span className="min-w-0 truncate text-left">{room.name}</span>
                            {selected ? <Check aria-hidden className="size-4" /> : null}
                          </ToggleGroupItem>
                        )
                      })}
                    </ToggleGroup>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("roomEmpty")}</p>
                  )}
                  <FieldError errors={[fieldState.error]} />
                </FieldSet>
              )}
            />
          ) : null}
        </div>
        <div className="min-w-0 border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          {roomId ? (
            <DateTimeStep
              key={`${roomId}-${privileged}`}
              rooms={catalog.rooms}
              privileged={privileged}
            />
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl bg-muted/50 px-6 text-center text-sm text-muted-foreground">
              <DoorOpen aria-hidden className="size-6" />
              {t("chooseRoomFirst")}
            </div>
          )}
        </div>
      </div>
    </StepLayout>
  )
}
