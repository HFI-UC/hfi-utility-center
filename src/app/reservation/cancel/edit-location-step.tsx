"use client"

import { ArrowRight, DoorOpen } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { FieldDescription, FieldLegend, FieldSet } from "@/components/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { CatalogData, Room } from "@/lib/api/types"

import type { EditDraft } from "./use-cancellation"

export function EditLocationStep({
  catalog,
  draft,
  roomsForCampus,
  onCampusChange,
  onRoomChange,
  onExit,
  onNext,
}: {
  catalog: CatalogData
  draft: EditDraft
  roomsForCampus: Room[]
  onCampusChange: (campus: number) => void
  onRoomChange: (room: number) => void
  onExit: () => void
  onNext: () => void
}) {
  const t = useTranslations("neo.management")
  const bookingT = useTranslations("booking")

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <FieldSet className="min-w-0">
        <FieldLegend variant="label">{t("selectLocation")}</FieldLegend>
        <FieldDescription>{t("locationHint")}</FieldDescription>
        <ToggleGroup
          type="single"
          variant="outline"
          value={String(draft.campus)}
          onValueChange={(value) => {
            if (value) onCampusChange(Number(value))
          }}
          className="flex w-full flex-wrap items-stretch"
        >
          {catalog.campuses
            .filter((campus) => !campus.deletedAt)
            .map((campus) => (
              <ToggleGroupItem
                key={campus.id}
                value={String(campus.id)}
                className="min-h-11 flex-1 sm:min-h-8"
              >
                {campus.name}
              </ToggleGroupItem>
            ))}
        </ToggleGroup>
      </FieldSet>

      <FieldSet className="min-w-0">
        <FieldLegend variant="label">
          {bookingT("rooms")} · {t("availableSpaces", { count: roomsForCampus.length })}
        </FieldLegend>
        <ToggleGroup
          type="single"
          variant="outline"
          value={String(draft.room)}
          onValueChange={(value) => {
            if (value) onRoomChange(Number(value))
          }}
          aria-label={bookingT("rooms")}
          className="grid w-full grid-cols-1 sm:grid-cols-2"
        >
          {roomsForCampus.map((room) => (
            <ToggleGroupItem
              key={room.id}
              value={String(room.id)}
              className="min-h-11 min-w-0 justify-start sm:min-h-12"
            >
              <DoorOpen aria-hidden className="size-4 shrink-0 opacity-70" />
              <span className="truncate">{room.name}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </FieldSet>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="outline" onClick={onExit} className="min-h-11 sm:min-h-8">
          {t("exitModify")}
        </Button>
        <Button
          type="button"
          disabled={!draft.room}
          onClick={onNext}
          className="min-h-11 sm:min-h-8"
        >
          {t("next")}
          <ArrowRight aria-hidden />
        </Button>
      </div>
    </div>
  )
}
