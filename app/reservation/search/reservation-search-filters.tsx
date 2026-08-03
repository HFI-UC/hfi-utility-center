"use client"

import { useState } from "react"
import { format } from "date-fns"
import { enUS, zhCN } from "date-fns/locale"
import { CalendarDays, Search } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
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
import { inputValueToDate } from "@/lib/date-time"
import type { BootstrapData } from "@/lib/api/types"

import type { ReservationSearchFilters } from "./search-query"

export function ReservationSearchFilterForm({
  catalog,
  filters,
}: {
  catalog?: BootstrapData
  filters: ReservationSearchFilters
}) {
  const t = useTranslations("searchPage")
  const common = useTranslations("common")
  const statusT = useTranslations("status")
  const locale = useLocale()
  const dateLocale = locale === "zh-CN" ? zhCN : enUS
  const [roomId, setRoomId] = useState(
    filters.roomId ? String(filters.roomId) : "all"
  )
  const [status, setStatus] = useState(filters.status ?? "all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: inputValueToDate(filters.startDate),
    to: inputValueToDate(filters.endDate),
  })

  return (
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

      {roomId !== "all" ? (
        <input type="hidden" name="room" value={roomId} />
      ) : null}
      <Select value={roomId} onValueChange={setRoomId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("allRooms")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allRooms")}</SelectItem>
          {catalog?.rooms.map((room) => (
            <SelectItem key={room.id} value={String(room.id)}>
              {room.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {status !== "all" ? (
        <input type="hidden" name="status" value={status} />
      ) : null}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("allStatuses")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("allStatuses")}</SelectItem>
          {(["pending", "approved", "rejected"] as const).map((value) => (
            <SelectItem key={value} value={value}>
              {statusT(value)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {dateRange?.from ? (
        <input
          type="hidden"
          name="start"
          value={format(dateRange.from, "yyyy-MM-dd")}
        />
      ) : null}
      {dateRange?.to ? (
        <input
          type="hidden"
          name="end"
          value={format(dateRange.to, "yyyy-MM-dd")}
        />
      ) : null}
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="justify-start">
            <CalendarDays />
            <DateRangeLabel
              range={dateRange}
              locale={dateLocale}
              placeholder={t("dateRange")}
            />
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

      <Button type="submit">
        <Search />
        {common("search")}
      </Button>
    </form>
  )
}

function DateRangeLabel({
  range,
  locale,
  placeholder,
}: {
  range?: DateRange
  locale: typeof enUS
  placeholder: string
}) {
  if (!range?.from) return placeholder
  const start = format(range.from, "PP", { locale })
  if (!range.to) return start
  return `${start} – ${format(range.to, "PP", { locale })}`
}
