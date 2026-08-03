"use client"

import { RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

import { AdminPageHeader } from "@/components/admin-page-header"
import { Button } from "@/components/ui/button"
import { useAdminMutation } from "@/features/admin/use-admin-mutation"
import { useAdminResource } from "@/features/admin/use-admin-resource"
import { getAdmins } from "@/lib/api/admins"
import { getCampuses, getClasses, getRooms } from "@/lib/api/catalog"
import type { Admin, Campus, Room, SchoolClass } from "@/lib/api/types"

import { ApproverEditor } from "./approver-editor"
import { CampusEditor } from "./campus-editor"
import { ClassEditor } from "./class-editor"
import { PolicyEditor } from "./room-policy-editor"
import { RoomEditor } from "./room-editor"

type FacilityData = {
  campuses: Campus[]
  classes: SchoolClass[]
  rooms: Room[]
  admins: Admin[]
}

const emptyFacilityData: FacilityData = {
  campuses: [],
  classes: [],
  rooms: [],
  admins: [],
}

async function loadFacilityData(): Promise<FacilityData> {
  const [campuses, classes, rooms, admins] = await Promise.all([
    getCampuses(),
    getClasses(),
    getRooms(),
    getAdmins(),
  ])
  return { campuses, classes, rooms, admins }
}

export default function AdminFacilitiesPage() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const facilityResource = useAdminResource({
    loadResource: loadFacilityData,
    initialData: emptyFacilityData,
    fallbackError: t("facilitiesLoadError"),
  })
  const { runMutation, workingKey } = useAdminMutation({
    reload: facilityResource.reload,
    reportError: facilityResource.reportError,
    fallbackError: common("unknown"),
  })
  const { campuses, classes, rooms, admins } = facilityResource.data
  const editorActions = { mutate: runMutation, workingKey }

  return (
    <main>
      <AdminPageHeader
        title={t("facilitiesTitle")}
        description={t("facilitiesDescription")}
        actions={
          <Button
            variant="outline"
            onClick={() => void facilityResource.reload()}
            disabled={facilityResource.loading}
          >
            <RefreshCw />
            {common("refresh")}
          </Button>
        }
      />
      {facilityResource.error ? (
        <p className="mt-5 border-y py-3 text-sm text-destructive">
          {facilityResource.error}
        </p>
      ) : null}
      {facilityResource.loading && !rooms.length ? (
        <p className="py-12 text-sm text-muted-foreground">
          {t("facilitiesLoading")}
        </p>
      ) : (
        <div className="mt-7 grid gap-x-8 gap-y-10 xl:grid-cols-2">
          <CampusEditor campuses={campuses} {...editorActions} />
          <ClassEditor
            classes={classes}
            campuses={campuses}
            {...editorActions}
          />
          <RoomEditor rooms={rooms} campuses={campuses} {...editorActions} />
          <PolicyEditor rooms={rooms} {...editorActions} />
          <ApproverEditor rooms={rooms} admins={admins} {...editorActions} />
        </div>
      )}
    </main>
  )
}
