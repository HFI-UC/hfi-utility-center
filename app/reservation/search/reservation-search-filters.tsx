"use client"

import type { ReactNode } from "react"
import { format } from "date-fns"
import { enUS, zhCN } from "date-fns/locale"
import { CalendarDays, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
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
  const { control, handleSubmit, register } = useForm<SearchFormValues>({
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

  const onSubmit: SubmitHandler<SearchFormValues> = (values) => {
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
      className="grid gap-3 py-4 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,2fr)_1fr_1fr_1.5fr_auto]"
      onSubmit={handleSubmit(onSubmit)}
    >
      <label>
        <span className="sr-only">{t("keyword")}</span>
        <InputGroup>
          <InputGroupInput
            {...register("keyword")}
            placeholder={t("keyword")}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </label>

      <Controller
        control={control}
        name="room"
        render={({ field }) => (
          <FilterSelect {...field} allLabel={t("allRooms")}>
            {catalog?.rooms.map((room) => (
              <SelectItem key={room.id} value={String(room.id)}>
                {room.name}
              </SelectItem>
            ))}
          </FilterSelect>
        )}
      />

      <Controller
        control={control}
        name="status"
        render={({ field }) => (
          <FilterSelect {...field} allLabel={t("allStatuses")}>
            {(["pending", "approved", "rejected"] as const).map((status) => (
              <SelectItem key={status} value={status}>
                {statusT(status)}
              </SelectItem>
            ))}
          </FilterSelect>
        )}
      />

      <Controller
        control={control}
        name="dateRange"
        render={({ field: { value, onChange, ...field } }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                {...field}
                variant="outline"
                className="justify-start text-left font-normal"
              >
                <CalendarDays />
                <DateRangeLabel
                  range={value}
                  locale={dateLocale}
                  placeholder={t("dateRange")}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-auto p-0" align="start">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={value}
                onSelect={onChange}
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

function FilterSelect({
  name,
  value,
  onChange,
  allLabel,
  children,
}: {
  name: string
  value: string
  onChange: (value: string) => void
  allLabel: string
  children: ReactNode
}) {
  return (
    <Select name={name} value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {children}
      </SelectContent>
    </Select>
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
  if (!range?.from) {
    return <span className="text-muted-foreground">{placeholder}</span>
  }
  const start = format(range.from, "PP", { locale })
  if (!range.to) return start
  return `${start} - ${format(range.to, "PP", { locale })}`
}
