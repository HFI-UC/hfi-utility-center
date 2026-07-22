"use client"

import { useCallback, useEffect, useState } from "react"
import { LogIn } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Turnstile } from "@/components/turnstile"
import { checkLogin, login } from "@/lib/api/auth"

export function AdminLoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const token = params.get("token")
  const redirect = params.get("redirect") || "/admin/reservations"
  const handleToken = useCallback((value: string) => setTurnstileToken(value), [])

  useEffect(() => {
    let active = true
    if (token) login(null, null, token, null).then(() => { if (active) router.replace(redirect) }).catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : "登录链接无效") })
    else checkLogin().then(() => { if (active) router.replace(redirect) }).catch(() => undefined)
    return () => { active = false }
  }, [redirect, router, token])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!turnstileToken) { setError("请先完成人机验证"); return }
    setSubmitting(true); setError(undefined)
    try { await login(email, password, null, turnstileToken); router.replace(redirect) }
    catch (submitError) { setError(submitError instanceof Error ? submitError.message : "登录失败") }
    finally { setSubmitting(false) }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-7xl px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div className="border-b pb-10 lg:border-r lg:border-b-0 lg:pr-14"><p className="text-xs font-medium text-muted-foreground">ADMIN</p><h1 className="mt-3 text-4xl font-semibold sm:text-6xl">管理员登录</h1><p className="mt-5 max-w-md leading-7 text-muted-foreground">审批预约、维护校区与房间、管理管理员账号并查看使用数据。</p></div>
      <form onSubmit={submit} className="space-y-5 pt-10 lg:pl-14 lg:pt-0">
        <div className="space-y-2"><Label htmlFor="email">邮箱</Label><Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="password">密码</Label><Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
        <Turnstile onToken={handleToken} />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" disabled={submitting || !turnstileToken}><LogIn />{submitting ? "正在登录…" : "登录"}</Button>
      </form>
    </main>
  )
}
