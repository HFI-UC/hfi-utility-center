"use client"

import { Building2, GraduationCap, RefreshCw, School } from "lucide-react"
import { useTranslations } from "next-intl"

import { AdminPageHeader, AdminSection } from "@/app/admin/admin-shell"
import { Spinner } from "@/components/astryx"
import { useAdminMutation, useAdminResource } from "@/lib/api/admin-hooks"
import { getCampuses, getClasses, getRooms } from "@/lib/api/catalog"
import type { Campus, Room, SchoolClass } from "@/lib/api/types"

import { CampusEditor } from "./campus-editor"
import { ClassEditor } from "./class-editor"
import { RoomEditor } from "./room-editor"
import styles from "./facility.module.css"

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
    getCampuses(),
    getClasses(),
    getRooms(),
  ])
  return { campuses, classes, rooms }
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
  const { campuses, classes, rooms } = facilityResource.data
  const editorActions = { mutate, working }
  const loadingSections = [t("rooms"), t("campuses"), t("classes")]

  return (
    <main className={`admin-page ${styles.page}`}>
      <AdminPageHeader
        title={t("facilitiesTitle")}
        description={t("facilitiesDescription")}
        actions={
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() =>
              void facilityResource.reload().catch(() => undefined)
            }
            disabled={facilityResource.loading}
          >
            <RefreshCw />
            {common("refresh")}
          </button>
        }
      />
      <div className={styles.overview}>
        <FacilityMetric
          icon={<School />}
          value={campuses.length}
          label={t("campuses")}
        />
        <FacilityMetric
          icon={<GraduationCap />}
          value={classes.length}
          label={t("classes")}
        />
        <FacilityMetric
          icon={<Building2 />}
          value={rooms.length}
          label={t("rooms")}
        />
      </div>
      <div className={styles.sections}>
        {facilityResource.loading && !rooms.length ? (
          loadingSections.map((title, index) => (
            <AdminSection
              key={title}
              title={title}
              className={index === 0 ? styles.roomSection : undefined}
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                {t("facilitiesLoading")}
              </div>
            </AdminSection>
          ))
        ) : (
          <>
            <RoomEditor rooms={rooms} campuses={campuses} {...editorActions} />
            <CampusEditor campuses={campuses} {...editorActions} />
            <ClassEditor
              classes={classes}
              campuses={campuses}
              {...editorActions}
            />
          </>
        )}
      </div>
    </main>
  )
}

function FacilityMetric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricIcon}>{icon}</span>
      <span>
        <strong className={styles.metricValue}>{value}</strong>
        <span className={styles.metricLabel}>{label}</span>
      </span>
    </div>
  )
}
