"use client"

import { useCallback, useEffect, useState } from "react"
import { KeyRound, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { AdminPageHeader } from "@/components/admin-page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changeAdminPassword, createAdmin, deleteAdmin, editAdmin, getAdmins } from "@/lib/api/admins"
import type { Admin } from "@/lib/api/types"

type CreateFields = { name: string; email: string; password: string }

export function AdminUsers() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [error, setError] = useState<string>()
  const [notice, setNotice] = useState<string>()
  const form = useForm<CreateFields>()
  const load = useCallback(async () => { try { setAdmins(await getAdmins()); setError(undefined) } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "管理员列表加载失败。") } }, [])
  useEffect(() => { void Promise.resolve().then(load) }, [load])

  async function run(action: () => Promise<unknown>, success: string) {
    try { await action(); setNotice(success); setError(undefined); await load() }
    catch (actionError) { setError(actionError instanceof Error ? actionError.message : "操作失败，请稍后重试。"); setNotice(undefined) }
  }

  return <main><AdminPageHeader eyebrow="ADMINS" title="管理员账号" description="创建、修改和删除管理员，并为账号重设密码。" actions={<Button variant="outline" onClick={() => void load()}><RefreshCw />刷新</Button>} />
    <section className="border-b py-7"><h2 className="text-lg font-semibold">添加管理员</h2><form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={form.handleSubmit(async (values) => { await run(() => createAdmin(values.name, values.email, values.password), "管理员已创建。"); form.reset() })}><div><Label htmlFor="admin-name">姓名</Label><Input id="admin-name" className="mt-1" {...form.register("name", { required: true })} /></div><div><Label htmlFor="admin-email">邮箱</Label><Input id="admin-email" className="mt-1" type="email" {...form.register("email", { required: true })} /></div><div><Label htmlFor="admin-password">初始密码</Label><Input id="admin-password" className="mt-1" type="password" minLength={6} {...form.register("password", { required: true })} /></div><Button className="self-end"><Plus />添加账号</Button></form></section>
    {error ? <p className="border-b py-3 text-sm text-red-600">{error}</p> : null}{notice ? <p className="border-b py-3 text-sm text-emerald-700">{notice}</p> : null}
    <div className="divide-y">{admins.map((admin) => <article key={admin.id} className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"><div><p className="font-semibold">{admin.name}</p><p className="mt-1 text-sm text-muted-foreground">{admin.email}</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => { const name = window.prompt("管理员姓名", admin.name); if (!name?.trim()) return; const email = window.prompt("管理员邮箱", admin.email); if (email?.trim()) void run(() => editAdmin(admin.id, name.trim(), email.trim()), "管理员资料已更新。") }}><Pencil />编辑</Button><Button size="sm" variant="outline" onClick={() => { const password = window.prompt("输入至少 6 位的新密码"); if (password && password.length >= 6) void run(() => changeAdminPassword(admin.id, password), "密码已更新。") }}><KeyRound />修改密码</Button><Button size="sm" variant="destructive" onClick={() => { if (window.confirm(`确定删除管理员“${admin.name}”吗？`)) void run(() => deleteAdmin(admin.id), "管理员已删除。") }}><Trash2 />删除</Button></div></article>)}</div>
  </main>
}
