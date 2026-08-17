"use client"

import { RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

import { AdminPageHeader, AdminSection } from "@/app/admin/admin-shell"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useAdminMutation, useAdminResource } from "@/lib/api/admin-hooks"
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
  })
  const { mutate, working } = useAdminMutation({
    reload: facilityResource.reload,
  })
  const { campuses, classes, rooms, admins } = facilityResource.data
  const editorActions = { mutate, working }
  const loadingSections = [
    t("campuses"),
    t("classes"),
    t("rooms"),
    t("approvers"),
    t("roomPolicies"),
  ]

  return (
    <main className="space-y-6">
      <AdminPageHeader
        title={t("facilitiesTitle")}
        description={t("facilitiesDescription")}
        actions={
          <Button
            variant="outline"
            onClick={facilityResource.reload}
            disabled={facilityResource.loading}
          >
            <RefreshCw />
            {common("refresh")}
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {facilityResource.loading && !rooms.length ? (
          loadingSections.map((title, index) => (
            <AdminSection
              key={title}
              title={title}
              className={
                index === loadingSections.length - 1
                  ? "xl:col-span-2"
                  : undefined
              }
            >
              <div className="flex min-h-32 items-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                {t("facilitiesLoading")}
              </div>
            </AdminSection>
          ))
        ) : (
          <>
            <CampusEditor campuses={campuses} {...editorActions} />
            <ClassEditor
              classes={classes}
              campuses={campuses}
              {...editorActions}
            />
            <RoomEditor rooms={rooms} campuses={campuses} {...editorActions} />
            <ApproverEditor rooms={rooms} admins={admins} {...editorActions} />
            <PolicyEditor rooms={rooms} {...editorActions} />
          </>
        )}
      </div>
    </main>
  )
}
