"use client"

import { useState } from "react"
import { format } from "date-fns"
import { enUS, zhCN } from "date-fns/locale"
import { CalendarDays, Search } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { DateRange } from "react-day-picker"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import type {
  BootstrapData,
  ReservationPage,
  ReservationStatus,
} from "@/lib/api/types"

const statusClass: Record<ReservationStatus, string> = {
  pending: "bg-secondary text-secondary-foreground",
  approved: "bg-primary text-primary-foreground",
  rejected: "bg-destructive text-white",
}

type Filters = {
  keyword: string
  roomId: number
  status?: ReservationStatus
  startDate: string
  endDate: string
  page: number
}

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function queryHref(filters: Filters, page: number) {
  const query = new URLSearchParams()
  if (filters.keyword) query.set("keyword", filters.keyword)
  if (filters.roomId) query.set("room", String(filters.roomId))
  if (filters.status) query.set("status", filters.status)
  if (filters.startDate) query.set("start", filters.startDate)
  if (filters.endDate) query.set("end", filters.endDate)
  if (page > 0) query.set("page", String(page + 1))
  const value = query.toString()
  return value ? `/reservation/search?${value}` : "/reservation/search"
}

function visiblePages(current: number, total: number) {
  const values = new Set([0, total - 1, current - 1, current, current + 1])
  return [...values]
    .filter((page) => page >= 0 && page < total)
    .sort((a, b) => a - b)
}

export function ReservationSearch({
  catalog,
  result,
  filters,
  error,
}: {
  catalog?: BootstrapData
  result: ReservationPage
  filters: Filters
  error?: string
}) {
  const t = useTranslations("searchPage")
  const common = useTranslations("common")
  const statusT = useTranslations("status")
  const locale = useLocale()
  const dateLocale = locale === "zh-CN" ? zhCN : enUS
  const [room, setRoom] = useState(
    filters.roomId ? String(filters.roomId) : "all"
  )
  const [status, setStatus] = useState(filters.status ?? "all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: parseDate(filters.startDate),
    to: parseDate(filters.endDate),
  })
  const totalPages = Math.max(1, Math.ceil(result.total / 20))
  const pages = visiblePages(filters.page, totalPages)

  const formatDateTime = (date: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(date))

  return (
    <main className="mx-auto max-w-[96rem] px-4 py-8 sm:px-8 sm:py-10">
      <header className="border-b pb-6">
        <h1 className="text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("total", { count: result.total })}
        </p>
      </header>

      <form
        action="/reservation/search"
        method="get"
        className="grid gap-3 border-b py-5 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,2fr)_1fr_1fr_1.5fr_auto]"
      >
        <label className="relative">
          <span className="sr-only">{t("keyword")}</span>
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            name="keyword"
            defaultValue={filters.keyword}
            className="pl-9"
            placeholder={t("keyword")}
          />
        </label>

        <input type="hidden" name="room" value={room === "all" ? "" : room} />
        <Select value={room} onValueChange={setRoom}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("allRooms")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allRooms")}</SelectItem>
            {catalog?.rooms.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          type="hidden"
          name="status"
          value={status === "all" ? "" : status}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            {(["pending", "approved", "rejected"] as const).map((item) => (
              <SelectItem key={item} value={item}>
                {statusT(item)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          type="hidden"
          name="start"
          value={dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : ""}
        />
        <input
          type="hidden"
          name="end"
          value={dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : ""}
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="justify-start">
              <CalendarDays />
              {dateRange?.from ? (
                dateRange.to ? (
                  <span>
                    {format(dateRange.from, "PP", { locale: dateLocale })} –{" "}
                    {format(dateRange.to, "PP", { locale: dateLocale })}
                  </span>
                ) : (
                  format(dateRange.from, "PP", { locale: dateLocale })
                )
              ) : (
                t("dateRange")
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-auto p-0" align="start">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={dateRange}
              onSelect={setDateRange}
              locale={dateLocale}
            />
          </PopoverContent>
        </Popover>

        <Button type="submit" size="default">
          <Search />
          {common("search")}
        </Button>
      </form>

      {error ? (
        <p className="border-b py-6 text-sm text-destructive">{error}</p>
      ) : null}
      {!result.reservations.length ? (
        <section className="border-b py-16">
          <p className="font-medium">{t("emptyTitle")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("emptyDescription")}
          </p>
        </section>
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("id")}</TableHead>
                  <TableHead>{t("person")}</TableHead>
                  <TableHead>{t("class")}</TableHead>
                  <TableHead>{t("room")}</TableHead>
                  <TableHead>{t("start")}</TableHead>
                  <TableHead>{t("end")}</TableHead>
                  <TableHead>{t("reason")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.reservations.map((item) => (
                  <TableRow key={item.id} className="align-top">
                    <TableCell>#{item.id}</TableCell>
                    <TableCell>
                      <p className="font-medium">{item.studentName}</p>
                      <p className="mt-1 max-w-48 text-sm break-all text-muted-foreground">
                        {item.email}
                      </p>
                    </TableCell>
                    <TableCell>{item.className}</TableCell>
                    <TableCell>{item.roomName}</TableCell>
                    <TableCell>{formatDateTime(item.startTime)}</TableCell>
                    <TableCell>{formatDateTime(item.endTime)}</TableCell>
                    <TableCell className="max-w-xs whitespace-normal">
                      {item.reason}
                    </TableCell>
                    <TableCell>
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
              <article key={item.id} className="py-4">
                <header className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-medium">#{item.id}</h2>
                  <Badge className={statusClass[item.status]}>
                    {statusT(item.status)}
                  </Badge>
                </header>
                <dl className="mt-3 grid grid-cols-[5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">{t("class")}</dt>
                  <dd className="break-words">{item.className}</dd>
                  <dt className="text-muted-foreground">{t("room")}</dt>
                  <dd className="break-words">{item.roomName}</dd>
                  <dt className="text-muted-foreground">{t("start")}</dt>
                  <dd>{formatDateTime(item.startTime)}</dd>
                  <dt className="text-muted-foreground">{t("end")}</dt>
                  <dd>{formatDateTime(item.endTime)}</dd>
                  <dt className="text-muted-foreground">{t("person")}</dt>
                  <dd className="min-w-0 break-all">
                    {item.studentName}
                    <br />
                    <span className="text-muted-foreground">{item.email}</span>
                  </dd>
                  <dt className="text-muted-foreground">{t("reason")}</dt>
                  <dd className="break-words">{item.reason}</dd>
                </dl>
              </article>
            ))}
          </div>
        </>
      )}

      {result.total > 20 ? (
        <Pagination className="border-t pt-5">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={queryHref(filters, Math.max(0, filters.page - 1))}
                text={t("previous")}
                aria-disabled={filters.page === 0}
                className={
                  filters.page === 0
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>
            {pages.map((page, index) => (
              <span key={page} className="contents">
                {index > 0 && page - pages[index - 1] > 1 ? (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : null}
                <PaginationItem>
                  <PaginationLink
                    href={queryHref(filters, page)}
                    isActive={page === filters.page}
                  >
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              </span>
            ))}
            <PaginationItem>
              <PaginationNext
                href={queryHref(
                  filters,
                  Math.min(totalPages - 1, filters.page + 1)
                )}
                text={t("next")}
                aria-disabled={filters.page >= totalPages - 1}
                className={
                  filters.page >= totalPages - 1
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </main>
  )
}
