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
import { Field, FieldLabel } from "@/components/ui/field"
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
  const { control, handleSubmit } = useForm<SearchFormValues>({
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
      <Controller
        control={control}
        name="keyword"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="sr-only" htmlFor={field.name}>
              {t("keyword")}
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                {...field}
                id={field.name}
                placeholder={t("keyword")}
                aria-invalid={fieldState.invalid}
              />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
            </InputGroup>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="room"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="sr-only" htmlFor={field.name}>
              {t("allRooms")}
            </FieldLabel>
            <FilterSelect
              id={field.name}
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
              invalid={fieldState.invalid}
              allLabel={t("allRooms")}
            >
              {catalog?.rooms.map((room) => (
                <SelectItem key={room.id} value={String(room.id)}>
                  {room.name}
                </SelectItem>
              ))}
            </FilterSelect>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="status"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="sr-only" htmlFor={field.name}>
              {t("allStatuses")}
            </FieldLabel>
            <FilterSelect
              id={field.name}
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
              invalid={fieldState.invalid}
              allLabel={t("allStatuses")}
            >
              {(["pending", "approved", "rejected"] as const).map((status) => (
                <SelectItem key={status} value={status}>
                  {statusT(status)}
                </SelectItem>
              ))}
            </FilterSelect>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="dateRange"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel className="sr-only" htmlFor={field.name}>
              {t("dateRange")}
            </FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={field.name}
                  name={field.name}
                  ref={field.ref}
                  variant="outline"
                  className="justify-start text-left font-normal"
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                >
                  <CalendarDays />
                  <DateRangeLabel
                    range={field.value}
                    locale={dateLocale}
                    placeholder={t("dateRange")}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-auto p-0"
                align="start"
              >
                <Calendar
                  mode="range"
                  numberOfMonths={2}
                  selected={field.value}
                  onSelect={field.onChange}
                  locale={dateLocale}
                />
              </PopoverContent>
            </Popover>
          </Field>
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
  id,
  name,
  value,
  onValueChange,
  invalid,
  allLabel,
  children,
}: {
  id: string
  name: string
  value: string
  onValueChange: (value: string) => void
  invalid: boolean
  allLabel: string
  children: ReactNode
}) {
  return (
    <Select name={name} value={value} onValueChange={onValueChange}>
      <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
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
