"use client"

import { useForm } from "react-hook-form"
import { Pencil, Plus, Power, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Campus, Room, SchoolClass } from "@/lib/api/types"
import { createCampus, createClass, createRoom, deleteCampus, deleteClass, deleteRoom, editCampus, editClass, editRoom } from "@/lib/api/catalog"

type Reload = () => Promise<void>

function ConfirmDelete({ label, action, reload }: { label: string; action: () => Promise<unknown>; reload: Reload }) {
  return <Button type="button" size="icon-sm" variant="ghost" title={`删除${label}`} onClick={async () => { if (window.confirm(`确定删除“${label}”吗？`)) { await action(); await reload() } }}><Trash2 /></Button>
}

export function CampusEditor({ campuses, reload, report }: { campuses: Campus[]; reload: Reload; report: (value?: string) => void }) {
  const form = useForm<{ name: string }>()
  return <section><h2 className="border-b pb-3 text-lg font-semibold">校区</h2><form className="flex gap-2 py-4" onSubmit={form.handleSubmit(async ({ name }) => { try { await createCampus(name); form.reset(); await reload() } catch (error) { report(error instanceof Error ? error.message : undefined) } })}><Input {...form.register("name", { required: true })} placeholder="新校区名称" /><Button><Plus />添加</Button></form><div className="divide-y border-t">{campuses.map((campus) => <div key={campus.id} className="flex items-center justify-between gap-3 py-3"><span className="text-sm font-medium">{campus.name}</span><div className="flex"><Button size="icon-sm" variant="ghost" title="重命名校区" onClick={async () => { const name = window.prompt("校区名称", campus.name); if (name?.trim()) { await editCampus(campus.id, name.trim()); await reload() } }}><Pencil /></Button><ConfirmDelete label={campus.name} action={() => deleteCampus(campus.id)} reload={reload} /></div></div>)}</div></section>
}

export function ClassEditor({ classes, campuses, reload, report }: { classes: SchoolClass[]; campuses: Campus[]; reload: Reload; report: (value?: string) => void }) {
  const form = useForm<{ name: string; campus: string }>()
  return <section><h2 className="border-b pb-3 text-lg font-semibold">班级</h2><form className="grid gap-2 py-4 sm:grid-cols-[1fr_10rem_auto]" onSubmit={form.handleSubmit(async ({ name, campus }) => { try { await createClass(name, Number(campus)); form.reset(); await reload() } catch (error) { report(error instanceof Error ? error.message : undefined) } })}><Input {...form.register("name", { required: true })} placeholder="新班级名称" /><select className="h-9 rounded-md border bg-background px-2 text-sm" {...form.register("campus", { required: true })}><option value="">所属校区</option>{campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}</select><Button><Plus />添加</Button></form><div className="divide-y border-t">{classes.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{campuses.find((campus) => campus.id === item.campus)?.name}</p></div><div className="flex"><Button size="icon-sm" variant="ghost" title="编辑班级" onClick={async () => { const name = window.prompt("班级名称", item.name); if (name?.trim()) { await editClass(item.id, name.trim(), item.campus); await reload() } }}><Pencil /></Button><ConfirmDelete label={item.name} action={() => deleteClass(item.id)} reload={reload} /></div></div>)}</div></section>
}

export function RoomEditor({ rooms, campuses, reload, report }: { rooms: Room[]; campuses: Campus[]; reload: Reload; report: (value?: string) => void }) {
  const form = useForm<{ name: string; campus: string }>()
  return <section><h2 className="border-b pb-3 text-lg font-semibold">房间</h2><form className="grid gap-2 py-4 sm:grid-cols-[1fr_10rem_auto]" onSubmit={form.handleSubmit(async ({ name, campus }) => { try { await createRoom(name, Number(campus)); form.reset(); await reload() } catch (error) { report(error instanceof Error ? error.message : undefined) } })}><Input {...form.register("name", { required: true })} placeholder="新房间名称" /><select className="h-9 rounded-md border bg-background px-2 text-sm" {...form.register("campus", { required: true })}><option value="">所属校区</option>{campuses.map((campus) => <option key={campus.id} value={campus.id}>{campus.name}</option>)}</select><Button><Plus />添加</Button></form><div className="divide-y border-t">{rooms.map((room) => <div key={room.id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-sm font-medium">{room.name}</p><p className="text-xs text-muted-foreground">{campuses.find((campus) => campus.id === room.campus)?.name} · {room.enabled ? "开放预约" : "暂停预约"}</p></div><div className="flex"><Button size="icon-sm" variant="ghost" title={room.enabled ? "暂停预约" : "恢复预约"} onClick={async () => { await editRoom(room.id, room.name, room.campus, !room.enabled); await reload() }}><Power /></Button><Button size="icon-sm" variant="ghost" title="重命名房间" onClick={async () => { const name = window.prompt("房间名称", room.name); if (name?.trim()) { await editRoom(room.id, name.trim(), room.campus, room.enabled); await reload() } }}><Pencil /></Button><ConfirmDelete label={room.name} action={() => deleteRoom(room.id)} reload={reload} /></div></div>)}</div></section>
}
