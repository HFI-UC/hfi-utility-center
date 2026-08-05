"use client"

import { format } from "date-fns"
import { enUS, zhCN } from "date-fns/locale"
import { CalendarDays, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"
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
import type { CatalogData, ReservationStatus } from "@/lib/api/types"
import { inputValueToDate } from "@/lib/date-time"

import {
  reservationSearchHref,
  type ReservationSearchFilters,
} from "./search-query"

type SearchFormValues = {
  keyword: string
  room: string
  status: ReservationStatus | "all"
  dateRange?: DateRange
}

export function ReservationSearchFilterForm({
  catalog,
  filters,
}: {
  catalog?: CatalogData
  filters: ReservationSearchFilters
}) {
  const router = useRouter()
  const t = useTranslations("searchPage")
  const common = useTranslations("common")
  const statusT = useTranslations("status")
  const dateLocale = useLocale() === "zh-CN" ? zhCN : enUS
  const form = useForm<SearchFormValues>({
    defaultValues: {
      keyword: filters.keyword,
      room: filters.roomId ? String(filters.roomId) : "all",
      status: filters.status ?? "all",
      dateRange: {
        from: inputValueToDate(filters.startDate),
        to: inputValueToDate(filters.endDate),
      },
    },
  })

  function search(values: SearchFormValues) {
    const startDate = values.dateRange?.from
      ? format(values.dateRange.from, "yyyy-MM-dd")
      : ""
    const endDate = values.dateRange?.to
      ? format(values.dateRange.to, "yyyy-MM-dd")
      : ""

    router.push(
      reservationSearchHref(
        {
          keyword: values.keyword.trim(),
          roomId: values.room === "all" ? 0 : Number(values.room),
          status: values.status === "all" ? undefined : values.status,
          startDate,
          endDate,
          page: 0,
        },
        0
      )
    )
  }

  return (
    <form
      className="grid gap-3 border-b py-5 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,2fr)_1fr_1fr_1.5fr_auto]"
      onSubmit={form.handleSubmit(search)}
    >
      <label className="relative">
        <span className="sr-only">{t("keyword")}</span>
        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
        <Input
          {...form.register("keyword")}
          className="pl-9"
          placeholder={t("keyword")}
        />
      </label>

      <Controller
        control={form.control}
        name="room"
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger ref={field.ref} className="w-full">
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
        )}
      />

      <Controller
        control={form.control}
        name="status"
        render={({ field }) => (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger ref={field.ref} className="w-full">
              <SelectValue placeholder={t("allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStatuses")}</SelectItem>
              {(["pending", "approved", "rejected"] as const).map((status) => (
                <SelectItem key={status} value={status}>
                  {statusT(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      <Controller
        control={form.control}
        name="dateRange"
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <CalendarDays />
                <DateRangeLabel
                  range={field.value}
                  locale={dateLocale}
                  placeholder={t("dateRange")}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-auto p-0" align="start">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={field.value}
                onSelect={field.onChange}
                locale={dateLocale}
              />
            </PopoverContent>
          </Popover>
        )}
      />

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
  return `${start} - ${format(range.to, "PP", { locale })}`
}
