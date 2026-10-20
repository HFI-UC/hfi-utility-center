"use client"

import { Building2, DoorOpen, GraduationCap, RefreshCw, type LucideIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { LoadingState } from "@/components/layout/data-state"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAdminMutation, useAdminResource } from "@/lib/api/admin-hooks"
import { getCampuses, getClasses, getRooms } from "@/lib/api/catalog"
import type { Campus, Room, SchoolClass } from "@/lib/api/types"

import { CampusEditor } from "./campus-editor"
import { ClassEditor } from "./class-editor"
import { IconHint, iconTouchTarget } from "./facility-editor-actions"
import { RoomEditor } from "./room-editor"

type FacilityData = {
  campuses: Campus[]
  classes: SchoolClass[]
  rooms: Room[]
}

const emptyFacilityData: FacilityData = {
  campuses: [],
  classes: [],
  rooms: [],
}

async function loadFacilityData(): Promise<FacilityData> {
  const [campuses, classes, rooms] = await Promise.all([
    getCampuses(true),
    getClasses(true),
    getRooms(true),
  ])
  return { campuses, classes, rooms }
}

function FacilityCount({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: number
}) {
  return (
    <div className="min-w-0 border-l-2 border-primary pl-3">
      <dt className="flex items-center gap-1.5 text-xs tracking-wide text-muted-foreground uppercase">
        <Icon aria-hidden className="size-3.5 shrink-0" />
        <span className="min-w-0 truncate">{label}</span>
      </dt>
      <dd className="text-2xl font-semibold break-words tabular-nums">{value}</dd>
    </div>
  )
}

export default function AdminFacilitiesPage() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [showArchived, setShowArchived] = useState(false)
  const facilityResource = useAdminResource({
    loadResource: loadFacilityData,
    initialData: emptyFacilityData,
  })
  const { mutate, working } = useAdminMutation({
    reload: facilityResource.reload,
  })
  const { campuses, classes, rooms } = facilityResource.data
  const activeCampuses = campuses.filter((item) => !item.deletedAt)
  const archivedCampusIds = new Set(
    campuses.filter((item) => item.deletedAt).map((item) => item.id),
  )
  const activeClasses = classes.filter(
    (item) => !item.deletedAt && !archivedCampusIds.has(item.campus ?? -1),
  )
  const activeRooms = rooms.filter(
    (item) => !item.deletedAt && !archivedCampusIds.has(item.campus ?? -1),
  )
  const editorActions = { mutate, working }
  const pending = facilityResource.loading && !rooms.length

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title={t("facilitiesTitle")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              aria-pressed={showArchived}
              onClick={() => setShowArchived((value) => !value)}
            >
              {showArchived ? t("hideArchived") : t("showArchived")}
            </Button>
            <IconHint label={common("refresh")}>
              <Button
                variant="outline"
                size="icon"
                aria-label={common("refresh")}
                disabled={facilityResource.loading}
                onClick={() => void facilityResource.reload().catch(() => undefined)}
                className={iconTouchTarget}
              >
                <RefreshCw />
              </Button>
            </IconHint>
          </div>
        }
      />

      <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
        <FacilityCount icon={Building2} label={t("campuses")} value={activeCampuses.length} />
        <FacilityCount icon={GraduationCap} label={t("classes")} value={activeClasses.length} />
        <FacilityCount icon={DoorOpen} label={t("rooms")} value={activeRooms.length} />
      </dl>

      <Separator />

      {pending ? (
        <LoadingState label={t("facilitiesLoading")} />
      ) : (
        <div className="flex min-w-0 flex-col gap-10">
          <RoomEditor
            rooms={showArchived ? rooms : activeRooms}
            campuses={campuses}
            {...editorActions}
          />
          <CampusEditor campuses={showArchived ? campuses : activeCampuses} {...editorActions} />
          <ClassEditor
            classes={showArchived ? classes : activeClasses}
            campuses={campuses}
            {...editorActions}
          />
        </div>
      )}
    </div>
  )
}
