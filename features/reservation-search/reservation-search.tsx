"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getBootstrap } from "@/lib/api/catalog"
import { getReservations } from "@/lib/api/reservations"
import type { BootstrapData, ReservationPage, ReservationStatus } from "@/lib/api/types"
import { messages } from "@/lib/messages"
import { useLocale, useTranslations } from "next-intl"

const statusClass: Record<ReservationStatus, string> = {
  pending: "border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300",
  approved: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300",
  rejected: "border-red-300 bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300",
}

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
}

export function ReservationSearch() {
  const t = useTranslations("searchPage")
  const statusT = useTranslations("status")
  const bookingT = useTranslations("booking")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [catalog, setCatalog] = useState<BootstrapData>()
  const [result, setResult] = useState<ReservationPage>({ reservations: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const keyword = searchParams.get("keyword") ?? ""
  const roomId = Number(searchParams.get("room") ?? 0)
  const status = (searchParams.get("status") || undefined) as ReservationStatus | undefined
  const startDate = searchParams.get("start") ?? ""
  const endDate = searchParams.get("end") ?? ""
  const page = Math.max(0, Number(searchParams.get("page") ?? 1) - 1)

  const updateQuery = useCallback((updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key))
    if (!("page" in updates)) next.delete("page")
    router.replace(`${pathname}?${next.toString()}`)
  }, [pathname, router, searchParams])

  useEffect(() => {
    let active = true
    getBootstrap().then((data) => { if (active) setCatalog(data) }).catch(() => undefined)
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => {
      if (active) setLoading(true)
      return getReservations({
        keyword,
        roomId: roomId || undefined,
        status,
        page,
        startTime: startDate ? Math.floor(new Date(`${startDate}T00:00:00`).getTime() / 1000) : undefined,
        endTime: endDate ? Math.floor(new Date(`${endDate}T23:59:59`).getTime() / 1000) : undefined,
      })
    }).then((data) => { if (active) { setResult(data); setError(undefined) } }).catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : messages.common.unknownError) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [keyword, roomId, status, page, startDate, endDate])

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-4 border-b pb-7 sm:flex-row sm:items-end">
        <div><p className="text-xs font-semibold text-red-600">{t("eyebrow")}</p><h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{t("title")}</h1></div>
        <p className="text-sm text-muted-foreground">{t("total", { count: result.total })}</p>
      </div>

      <div className="grid gap-3 border-b py-5 md:grid-cols-6">
        <label className="relative md:col-span-2"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><Input defaultValue={keyword} className="pl-9" placeholder={t("keyword")} onKeyDown={(event) => { if (event.key === "Enter") updateQuery({ keyword: event.currentTarget.value || undefined }) }} /></label>
        <select className="h-10 rounded-md border bg-background px-3 text-sm" value={roomId || ""} onChange={(event) => updateQuery({ room: event.target.value || undefined })}><option value="">{t("allRooms")}</option>{catalog?.rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select>
        <select className="h-10 rounded-md border bg-background px-3 text-sm" value={status ?? ""} onChange={(event) => updateQuery({ status: event.target.value || undefined })}><option value="">{t("allStatuses")}</option><option value="pending">{statusT("pending")}</option><option value="approved">{statusT("approved")}</option><option value="rejected">{statusT("rejected")}</option></select>
        <Input type="date" value={startDate} aria-label={t("startDate")} onChange={(event) => updateQuery({ start: event.target.value || undefined })} />
        <Input type="date" value={endDate} aria-label={t("endDate")} onChange={(event) => updateQuery({ end: event.target.value || undefined })} />
      </div>

      {error ? <div className="border-b py-6 text-sm text-red-600">{error}</div> : null}
      {loading ? <div className="border-b py-12 text-sm text-muted-foreground">{t("loading")}</div> : null}
      {!loading && !result.reservations.length ? <div className="border-b py-16"><p className="font-medium">{t("emptyTitle")}</p><p className="mt-2 text-sm text-muted-foreground">{t("emptyDescription")}</p></div> : null}

      {!loading && result.reservations.length ? (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead><tr className="border-b text-xs text-muted-foreground"><th className="py-3 pr-4">{t("id")}</th><th className="py-3 pr-4">{t("person")}</th><th className="py-3 pr-4">{t("classRoom")}</th><th className="py-3 pr-4">{t("time")}</th><th className="py-3 pr-4">{t("reason")}</th><th className="py-3 pr-4">{t("purpose")}</th><th className="py-3">{t("status")}</th></tr></thead>
              <tbody>{result.reservations.map((item) => <tr key={item.id} className="border-b align-top"><td className="py-4 pr-4 font-mono">#{item.id}</td><td className="py-4 pr-4"><p className="font-medium">{item.studentName}</p><p className="mt-1 text-xs text-muted-foreground">{item.email}</p></td><td className="py-4 pr-4"><p>{item.className}</p><p className="mt-1 text-xs text-muted-foreground">{item.roomName}</p></td><td className="py-4 pr-4 whitespace-nowrap"><p>{formatDateTime(item.startTime, locale)}</p><p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.endTime, locale)}</p></td><td className="max-w-xs py-4 pr-4 leading-6"><p>{item.reason}</p>{item.multimediaRequired ? <p className="mt-1 text-xs text-muted-foreground">{t("multimedia")}: {item.multimediaDetails}</p> : null}</td><td className="py-4 pr-4">{bookingT(item.purposeType === "personal" ? "purposePersonal" : item.purposeType === "class" ? "purposeClass" : "purposeClub")}</td><td className="py-4"><Badge className={statusClass[item.status]}>{statusT(item.status)}</Badge></td></tr>)}</tbody>
            </table>
          </div>
          <div className="divide-y md:hidden">{result.reservations.map((item) => <article key={item.id} className="py-5"><div className="flex items-start justify-between gap-3"><p className="font-mono text-sm">#{item.id}</p><Badge className={statusClass[item.status]}>{statusT(item.status)}</Badge></div><h2 className="mt-3 font-semibold">{item.roomName} · {item.className}</h2><p className="mt-2 text-sm">{formatDateTime(item.startTime, locale)} – {formatDateTime(item.endTime, locale)}</p><p className="mt-3 text-sm">{item.studentName} · {item.email}</p><p className="mt-2 text-sm text-muted-foreground">{item.reason}</p></article>)}</div>
          <div className="flex items-center justify-between border-t pt-4"><Button variant="outline" disabled={page === 0} onClick={() => updateQuery({ page: page > 1 ? String(page) : undefined })}><ChevronLeft />{t("previous")}</Button><span className="text-xs text-muted-foreground">{t("page", { page: page + 1 })}</span><Button variant="outline" disabled={(page + 1) * 20 >= result.total} onClick={() => updateQuery({ page: String(page + 2) })}>{t("next")}<ChevronRight /></Button></div>
        </>
      ) : null}
    </main>
  )
}
