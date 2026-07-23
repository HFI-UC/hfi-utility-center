"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"
import { AdminPageHeader } from "@/components/admin-page-header"
import { Button } from "@/components/ui/button"
import { getAdmins } from "@/lib/api/admins"
import { getCampuses, getClasses, getRooms } from "@/lib/api/catalog"
import type { Admin, Campus, Room, SchoolClass } from "@/lib/api/types"
import { CampusEditor, ClassEditor, RoomEditor } from "./catalog-editor"
import { ApproverEditor, PolicyEditor } from "./policy-editor"

export default function AdminFacilitiesPage() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const load = useCallback(async () => {
    try {
      const [nextCampuses, nextClasses, nextRooms, nextAdmins] =
        await Promise.all([
          getCampuses(),
          getClasses(),
          getRooms(),
          getAdmins(),
        ])
      setCampuses(nextCampuses)
      setClasses(nextClasses)
      setRooms(nextRooms)
      setAdmins(nextAdmins)
      setError(undefined)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : t("facilitiesLoadError")
      )
    } finally {
      setLoading(false)
    }
  }, [t])
  useEffect(() => {
    // Data updates occur after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])
  return (
    <main>
      <AdminPageHeader
        title={t("facilitiesTitle")}
        description={t("facilitiesDescription")}
        actions={
          <Button
            variant="outline"
            onClick={() => {
              setLoading(true)
              void load()
            }}
          >
            <RefreshCw />
            {common("refresh")}
          </Button>
        }
      />
      {error ? (
        <p className="mt-5 border-y py-3 text-sm text-destructive">{error}</p>
      ) : null}
      {loading ? (
        <p className="py-12 text-sm text-muted-foreground">
          {t("facilitiesLoading")}
        </p>
      ) : (
        <div className="mt-7 grid gap-x-8 gap-y-10 xl:grid-cols-2">
          <CampusEditor campuses={campuses} reload={load} report={setError} />
          <ClassEditor
            classes={classes}
            campuses={campuses}
            reload={load}
            report={setError}
          />
          <RoomEditor
            rooms={rooms}
            campuses={campuses}
            reload={load}
            report={setError}
          />
          <PolicyEditor
            rooms={rooms}
            admins={admins}
            reload={load}
            report={setError}
          />
          <ApproverEditor
            rooms={rooms}
            admins={admins}
            reload={load}
            report={setError}
          />
        </div>
      )}
    </main>
  )
}
