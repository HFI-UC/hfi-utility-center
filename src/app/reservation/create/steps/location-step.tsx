import { Check, ChevronLeft, DoorOpen } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRef, useState } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FieldError, FieldSet } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { CatalogData } from "@/lib/api/types"
import { cn } from "@/lib/utils"

import { isBookableCampus } from "../bookable-campus"
import type { ReservationFormValues } from "../form"
import { StepLayout } from "../step-layout"
import { DateTimeStep } from "./date-time-step"

export function LocationStep({
  catalog,
  priority = false,
}: {
  catalog: CatalogData
  priority?: boolean
}) {
  const t = useTranslations("booking")
  const { control, setValue, clearErrors } = useFormContext<ReservationFormValues>()
  const [campusId, roomId] = useWatch({ control, name: ["bookingCampusId", "room"] })
  const [browsing, setBrowsing] = useState(false)
  const [listCampusId, setListCampusId] = useState(campusId)
  const [listOpen, setListOpen] = useState(true)
  const [listHeight, setListHeight] = useState<number>()
  const [incomingHeight, setIncomingHeight] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const campuses = catalog.campuses.filter(isBookableCampus)
  const rooms = catalog.rooms.filter((room) => room.campus === listCampusId && room.enabled)
  const incomingRooms = catalog.rooms.filter((room) => room.campus === campusId && room.enabled)
  const campus = campuses.find((item) => item.id === listCampusId)
  const selectedRoom = rooms.find((room) => room.id === roomId)
  const collapsed = listOpen && Boolean(selectedRoom) && !browsing
  const switchingCampus = listCampusId !== campusId

  if (listOpen && switchingCampus) setListCampusId(campusId)

  function measureList() {
    const content = listRef.current?.firstElementChild
    if (!content) return
    setListHeight(content.getBoundingClientRect().height)
  }

  function measureIncoming() {
    const incoming = document.querySelector<HTMLElement>("[data-room-placeholder]")
    if (!incoming) return
    setIncomingHeight(incoming.getBoundingClientRect().height)
  }

  function clearSelectedTime() {
    clearErrors(["bookingCampusId", "room", "startTime", "endTime"])
    setValue("startTime", 0)
    setValue("endTime", 0)
  }

  function selectCampus(value: string) {
    const nextCampusId = Number(value)
    if (!value || nextCampusId === campusId) return
    setValue("bookingCampusId", nextCampusId)
    setValue("room", 0)
    clearSelectedTime()
    setBrowsing(false)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    setListOpen(false)
  }

  function revealNextCampus(event: React.TransitionEvent<HTMLElement>) {
    if (event.target !== event.currentTarget || event.propertyName !== "opacity") return
    if (!switchingCampus) return
    setListCampusId(campusId)
    setListOpen(true)
  }

  return (
    <StepLayout title={t("locationTitle")} description={t("locationDescription")}>
      <Measure onLayout={measureList} />
      {switchingCampus ? <Measure onLayout={measureIncoming} /> : null}
      <div
        className={cn(
          "grid min-w-0 gap-8 motion-safe:transition-[grid-template-columns] motion-safe:duration-(--duration-medium) motion-safe:ease-(--ease-smooth-out) lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]",
          collapsed && "lg:grid-cols-[minmax(0,0.46fr)_minmax(0,1.54fr)]",
        )}
      >
        <div className="flex min-w-0 flex-col gap-5">
          <Controller
            control={control}
            name="bookingCampusId"
            render={({ fieldState }) => (
              <FieldSet className="min-w-0" data-invalid={fieldState.invalid}>
                <ToggleGroup
                  type="single"
                  variant="outline"
                  spacing={0}
                  aria-label={t("campus")}
                  value={String(campusId)}
                  onValueChange={selectCampus}
                  className="w-full"
                >
                  {campuses.map((item) => (
                    <ToggleGroupItem
                      type="button"
                      key={item.id}
                      value={String(item.id)}
                      className="h-10 min-w-0 flex-1"
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
                <FieldSet className="relative min-w-0" data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between gap-3">
                    {collapsed ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setBrowsing(true)}
                        className="h-8 min-w-0"
                      >
                        <ChevronLeft aria-hidden />
                        {t("allRooms")}
                      </Button>
                    ) : (
                      <p className="min-w-0 truncate text-sm font-medium">{campus?.name}</p>
                    )}
                    <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {t("availableRooms", { count: rooms.length })}
                    </p>
                  </div>
                  {rooms.length ? (
                    <div
                      ref={listRef}
                      className="relative overflow-hidden motion-safe:transition-[height] motion-safe:duration-(--duration-medium) motion-safe:ease-(--ease-smooth-out)"
                      style={{ height: listOpen || !switchingCampus ? listHeight : incomingHeight }}
                    >
                      <div
                        className={cn(
                          "motion-safe:transition-opacity motion-safe:duration-(--duration-quick) motion-safe:ease-(--ease-smooth-out)",
                          listOpen ? "opacity-100" : "opacity-0",
                        )}
                        onTransitionEnd={revealNextCampus}
                      >
                        <ToggleGroup
                          type="single"
                          variant="outline"
                          orientation="vertical"
                          onValueChange={(value) => {
                            if (!value) return
                            field.onChange(Number(value))
                            clearSelectedTime()
                            setBrowsing(false)
                          }}
                          aria-label={t("rooms")}
                          className="w-full flex-col items-stretch"
                        >
                          {(collapsed && selectedRoom ? [selectedRoom] : rooms).map((room) => {
                            const selected = field.value === room.id
                            return (
                              <ToggleGroupItem
                                key={room.id}
                                value={String(room.id)}
                                aria-pressed={selected}
                                className="h-11 w-full justify-between"
                              >
                                <span className="min-w-0 truncate text-left">{room.name}</span>
                                <Check
                                  aria-hidden
                                  className={cn(
                                    "size-4 motion-safe:transition-[opacity,transform] motion-safe:duration-(--duration-quick) motion-safe:ease-(--ease-smooth-out)",
                                    selected ? "scale-100 opacity-100" : "scale-75 opacity-0",
                                  )}
                                />
                              </ToggleGroupItem>
                            )
                          })}
                        </ToggleGroup>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("roomEmpty")}</p>
                  )}
                  {switchingCampus ? (
                    <div
                      aria-hidden
                      className="invisible absolute inset-x-0 top-0 -z-10 flex flex-col gap-1"
                      data-room-placeholder=""
                    >
                      {incomingRooms.map((room) => (
                        <div key={room.id} className="h-11" />
                      ))}
                    </div>
                  ) : null}
                  <FieldError errors={[fieldState.error]} />
                </FieldSet>
              )}
            />
          ) : null}
        </div>
        <div className="min-w-0 border-t pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          {roomId ? (
            <DateTimeStep key={`${roomId}-${priority}`} rooms={catalog.rooms} priority={priority} />
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

// Runs after DOM layout without measuring inside an effect.
function Measure({ onLayout }: { onLayout: () => void }) {
  const callback = useRef(onLayout)

  return (
    <template
      ref={() => {
        callback.current = onLayout
        callback.current()
      }}
    />
  )
}
