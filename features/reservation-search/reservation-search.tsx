"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getBootstrap } from "@/lib/api/catalog"
import { getReservations } from "@/lib/api/reservations"
import type {
  BootstrapData,
  ReservationPage,
  ReservationStatus,
} from "@/lib/api/types"
import { useLocale, useTranslations } from "next-intl"

const statusClass: Record<ReservationStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-primary text-primary-foreground",
  rejected: "bg-destructive text-white",
}

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value))
}

function FilterSelect({
  value,
  placeholder,
  options,
  onChange,
}: {
  value?: string
  placeholder: string
  options: { label: string; value: string }[]
  onChange: (value?: string) => void
}) {
  return (
    <Select
      value={value ?? "all"}
      onValueChange={(next) => onChange(next === "all" ? undefined : next)}
    >
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{placeholder}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function ReservationSearch() {
  const t = useTranslations("searchPage")
  const common = useTranslations("common")
  const statusT = useTranslations("status")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [catalog, setCatalog] = useState<BootstrapData>()
  const [result, setResult] = useState<ReservationPage>({
    reservations: [],
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const keyword = searchParams.get("keyword") ?? ""
  const roomId = Number(searchParams.get("room") ?? 0)
  const status = (searchParams.get("status") || undefined) as
    | ReservationStatus
    | undefined
  const startDate = searchParams.get("start") ?? ""
  const endDate = searchParams.get("end") ?? ""
  const page = Math.max(0, Number(searchParams.get("page") ?? 1) - 1)

  const updateQuery = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, value]) =>
        value ? next.set(key, value) : next.delete(key)
      )
      if (!("page" in updates)) next.delete("page")
      router.replace(`${pathname}?${next.toString()}`)
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    let active = true
    getBootstrap()
      .then((data) => {
        if (active) setCatalog(data)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    Promise.resolve()
      .then(() => {
        if (active) setLoading(true)
        return getReservations({
          keyword,
          roomId: roomId || undefined,
          status,
          page,
          startTime: startDate
            ? Math.floor(new Date(`${startDate}T00:00:00`).getTime() / 1000)
            : undefined,
          endTime: endDate
            ? Math.floor(new Date(`${endDate}T23:59:59`).getTime() / 1000)
            : undefined,
        })
      })
      .then((data) => {
        if (active) {
          setResult(data)
          setError(undefined)
        }
      })
      .catch((loadError) => {
        if (active)
          setError(
            loadError instanceof Error ? loadError.message : common("unknown")
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [common, keyword, roomId, status, page, startDate, endDate])

  return (
    <main className="mx-auto max-w-[96rem] px-4 py-10 sm:px-8">
      <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold">{t("title")}</h1>
        </div>
        <p className="rounded-lg border bg-muted/50 px-4 py-3 text-xl font-semibold sm:text-2xl">
          {t("total", { count: result.total })}
        </p>
      </div>

      <div className="grid gap-3 border-y py-5 md:grid-cols-6">
        <label className="relative md:col-span-2">
          <Search className="absolute top-3 left-3 size-4 text-muted-foreground" />
          <Input
            defaultValue={keyword}
            className="pl-9"
            placeholder={t("keyword")}
            onKeyDown={(event) => {
              if (event.key === "Enter")
                updateQuery({ keyword: event.currentTarget.value || undefined })
            }}
          />
        </label>
        <FilterSelect
          value={roomId ? String(roomId) : undefined}
          placeholder={t("allRooms")}
          options={
            catalog?.rooms.map((room) => ({
              value: String(room.id),
              label: room.name,
            })) ?? []
          }
          onChange={(room) => updateQuery({ room })}
        />
        <FilterSelect
          value={status}
          placeholder={t("allStatuses")}
          options={(
            ["pending", "approved", "rejected"] as ReservationStatus[]
          ).map((value) => ({ value, label: statusT(value) }))}
          onChange={(nextStatus) => updateQuery({ status: nextStatus })}
        />
        <Input
          type="date"
          value={startDate}
          aria-label={t("startDate")}
          onChange={(event) =>
            updateQuery({ start: event.target.value || undefined })
          }
        />
        <Input
          type="date"
          value={endDate}
          aria-label={t("endDate")}
          onChange={(event) =>
            updateQuery({ end: event.target.value || undefined })
          }
        />
      </div>

      {error ? (
        <div className="border-b py-6 text-sm text-destructive">{error}</div>
      ) : null}
      {loading ? (
        <div className="border-b py-12 text-sm text-muted-foreground">
          {t("loading")}
        </div>
      ) : null}
      {!loading && !result.reservations.length ? (
        <div className="border-b py-16">
          <p className="font-medium">{t("emptyTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("emptyDescription")}
          </p>
        </div>
      ) : null}

      {!loading && result.reservations.length ? (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-xs text-muted-foreground">
                  <TableHead>{t("id")}</TableHead>
                  <TableHead>{t("person")}</TableHead>
                  <TableHead>{t("classRoom")}</TableHead>
                  <TableHead>{t("time")}</TableHead>
                  <TableHead>{t("reason")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.reservations.map((item) => (
                  <TableRow key={item.id} className="align-top">
                    <TableCell className="py-4 font-mono">#{item.id}</TableCell>
                    <TableCell className="py-4">
                      <p className="font-bold">{item.studentName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.email}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <p>{item.className}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.roomName}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <p>{formatDateTime(item.startTime, locale)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(item.endTime, locale)}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-xs py-4 leading-6 whitespace-normal">
                      {item.reason}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={statusClass[item.status]}>
                        {statusT(item.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="divide-y md:hidden">
            {result.reservations.map((item) => (
              <article key={item.id} className="py-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-sm">#{item.id}</p>
                  <Badge className={statusClass[item.status]}>
                    {statusT(item.status)}
                  </Badge>
                </div>
                <h2 className="mt-3 font-semibold">
                  {item.roomName} · {item.className}
                </h2>
                <p className="mt-2 text-sm">
                  {formatDateTime(item.startTime, locale)} –{" "}
                  {formatDateTime(item.endTime, locale)}
                </p>
                <p className="mt-3 text-sm">
                  {item.studentName} · {item.email}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.reason}
                </p>
              </article>
            ))}
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() =>
                updateQuery({ page: page > 1 ? String(page) : undefined })
              }
            >
              <ChevronLeft />
              {t("previous")}
            </Button>
            <span className="text-xs text-muted-foreground">
              {t("page", { page: page + 1 })}
            </span>
            <Button
              variant="outline"
              disabled={(page + 1) * 20 >= result.total}
              onClick={() => updateQuery({ page: String(page + 2) })}
            >
              {t("next")}
              <ChevronRight />
            </Button>
          </div>
        </>
      ) : null}
    </main>
  )
}
