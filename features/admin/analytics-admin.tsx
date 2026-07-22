"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Download, RefreshCw } from "lucide-react"
import { AdminPageHeader } from "@/components/admin-page-header"
import { Button } from "@/components/ui/button"
import { Turnstile } from "@/components/turnstile"
import { analyticsExportUrl, getOverviewAnalytics, getWeeklyAnalytics } from "@/lib/api/analytics"
import type { OverviewAnalytics, WeeklyAnalytics } from "@/lib/api/types"

const weekday = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

function Bars({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values, 1)
  return <div className="space-y-2">{values.map((value, index) => <div key={`${labels[index]}-${index}`} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3 text-xs"><span className="text-muted-foreground">{labels[index]}</span><div className="h-2 bg-muted"><div className="h-full bg-foreground" style={{ width: `${Math.max(value ? 4 : 0, value / max * 100)}%` }} /></div><span className="text-right font-mono">{value}</span></div>)}</div>
}

export function AnalyticsAdmin() {
  const [overview, setOverview] = useState<OverviewAnalytics>()
  const [weekly, setWeekly] = useState<WeeklyAnalytics>()
  const [token, setToken] = useState("")
  const [error, setError] = useState<string>()
  const load = useCallback(async () => { try { const [nextOverview, nextWeekly] = await Promise.all([getOverviewAnalytics(), getWeeklyAnalytics()]); setOverview(nextOverview); setWeekly(nextWeekly); setError(undefined) } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "分析数据加载失败。") } }, [])
  useEffect(() => { void Promise.resolve().then(load) }, [load])
  const monthLabels = useMemo(() => Array.from({ length: 12 }, (_, index) => { const date = new Date(); date.setMonth(date.getMonth() - (11 - index)); return `${date.getMonth() + 1}月` }), [])
  return <main><AdminPageHeader eyebrow="ANALYTICS" title="数据分析" description="查看今日运营概览、近 30 天趋势和上一完整周的房间使用情况。" actions={<Button variant="outline" onClick={() => void load()}><RefreshCw />刷新</Button>} />{error ? <p className="mt-5 border-y py-3 text-sm text-red-600">{error}</p> : null}
    {!overview || !weekly ? <p className="py-12 text-sm text-muted-foreground">正在计算分析数据…</p> : <div className="divide-y">
      <section className="py-7"><h2 className="text-lg font-semibold">今日概览</h2><dl className="mt-5 grid grid-cols-2 gap-px bg-border sm:grid-cols-5">{[["页面请求", overview.today.requests], ["有效预约", overview.today.reservations], ["新增预约", overview.today.reservationCreations], ["批准", overview.today.approvals], ["拒绝", overview.today.rejections]].map(([label, value]) => <div className="bg-background p-4" key={label}><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-2 text-3xl font-semibold">{value}</dd></div>)}</dl></section>
      <section className="grid gap-8 py-7 lg:grid-cols-2"><div><h2 className="mb-5 text-lg font-semibold">近 7 天新增预约</h2><Bars values={overview.weekly.reservationCreations} labels={weekday} /></div><div><h2 className="mb-5 text-lg font-semibold">近 12 个月有效预约</h2><Bars values={overview.monthly.reservations} labels={monthLabels} /></div></section>
      <section className="grid gap-8 py-7 lg:grid-cols-2"><div><h2 className="mb-5 text-lg font-semibold">上一周房间使用</h2><div className="divide-y border-t">{weekly.rooms.map((room) => <div key={room.roomName} className="grid grid-cols-[1fr_auto_auto] gap-5 py-3 text-sm"><span>{room.roomName}</span><span className="text-muted-foreground">新增 {room.reservationCreations}</span><span>使用 {room.reservations}</span></div>)}</div></div><div><h2 className="mb-5 text-lg font-semibold">常见预约原因</h2><div className="flex flex-wrap gap-2">{weekly.reasons.slice(0, 30).map((reason) => <span className="border px-2 py-1 text-xs" key={reason.word}>{reason.word} <b>{reason.count}</b></span>)}</div></div></section>
      <section className="py-7"><h2 className="text-lg font-semibold">导出分析报告</h2><p className="mt-2 text-sm text-muted-foreground">完成安全验证后，可导出概览或周报。报告生成依赖后端浏览器环境。</p><div className="mt-4"><Turnstile onToken={setToken} /></div><div className="mt-4 flex flex-wrap gap-2">{(["overview", "weekly"] as const).flatMap((report) => (["pdf", "png"] as const).map((type) => <Button key={`${report}-${type}`} variant="outline" disabled={!token} asChild={Boolean(token)}>{token ? <a href={analyticsExportUrl(report, type, token)}><Download />{report === "overview" ? "概览" : "周报"} {type.toUpperCase()}</a> : <span><Download />{report === "overview" ? "概览" : "周报"} {type.toUpperCase()}</span>}</Button>))}</div></section>
    </div>}
  </main>
}
