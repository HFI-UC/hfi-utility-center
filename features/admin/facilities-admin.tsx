"use client"

import { useCallback, useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { AdminPageHeader } from "@/components/admin-page-header"
import { Button } from "@/components/ui/button"
import { getAdmins } from "@/lib/api/admins"
import { getCampuses, getClasses, getRooms } from "@/lib/api/catalog"
import type { Admin, Campus, Room, SchoolClass } from "@/lib/api/types"
import { CampusEditor, ClassEditor, RoomEditor } from "@/features/admin/catalog-editor"
import { ApproverEditor, PolicyEditor } from "@/features/admin/policy-editor"

export function FacilitiesAdmin() {
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const load = useCallback(async () => { setLoading(true); try { const [nextCampuses, nextClasses, nextRooms, nextAdmins] = await Promise.all([getCampuses(), getClasses(), getRooms(), getAdmins()]); setCampuses(nextCampuses); setClasses(nextClasses); setRooms(nextRooms); setAdmins(nextAdmins); setError(undefined) } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "设施数据加载失败。") } finally { setLoading(false) } }, [])
  useEffect(() => { void Promise.resolve().then(load) }, [load])
  return <main><AdminPageHeader eyebrow="FACILITIES" title="设施管理" description="维护校区、班级、房间、可预约政策，以及每个房间的审批人与通知设置。" actions={<Button variant="outline" onClick={() => void load()}><RefreshCw />刷新</Button>} />{error ? <p className="mt-5 border-y py-3 text-sm text-destructive">{error}</p> : null}{loading ? <p className="py-12 text-sm text-muted-foreground">正在加载设施资料…</p> : <div className="mt-7 grid gap-x-8 gap-y-10 xl:grid-cols-2"><CampusEditor campuses={campuses} reload={load} report={setError} /><ClassEditor classes={classes} campuses={campuses} reload={load} report={setError} /><RoomEditor rooms={rooms} campuses={campuses} reload={load} report={setError} /><PolicyEditor rooms={rooms} admins={admins} reload={load} report={setError} /><ApproverEditor rooms={rooms} admins={admins} reload={load} report={setError} /></div>}</main>
}
