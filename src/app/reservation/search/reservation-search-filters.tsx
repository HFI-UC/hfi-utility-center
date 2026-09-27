"use client"

import { format } from "date-fns"
import { enUS, zhCN } from "date-fns/locale"
import { CalendarDays, RotateCcw, Search } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import { Controller, useForm, useWatch, type SubmitHandler } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CatalogData, ReservationStatus } from "@/lib/api/types"
import { inputValueToDate } from "@/lib/date-time"

import { reservationSearchHref, type ReservationSearchFilters } from "./search-query"

const ALL = "all"

const STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const satisfies ReadonlyArray<ReservationStatus>

const CONTROL = "w-full min-h-11 sm:min-h-8"

type SearchFormValues = {
  keyword: string
  campuses: string[]
  room: string
  dateRange?: DateRange
  sort: "time" | "sequence"
  status: ReservationStatus | typeof ALL
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
  const statusT = useTranslations("status")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const dateLocale = useLocale() === "zh-CN" ? zhCN : enUS
  const { control, handleSubmit, getValues, reset } = useForm<SearchFormValues>({
    defaultValues: {
      keyword: filters.keyword,
      campuses: filters.campusIds.map(String),
      room: filters.roomId ? String(filters.roomId) : ALL,
      dateRange: {
        from: inputValueToDate(filters.startDate),
        to: inputValueToDate(filters.endDate),
      },
      sort: filters.sort,
      status: filters.status ?? ALL,
    },
  })
  const keyword = useWatch({ control, name: "keyword" })
  const selectedCampuses = useWatch({ control, name: "campuses" })
  const visibleRooms = useMemo(
    () =>
      catalog?.rooms.filter(
        (room) => !selectedCampuses?.length || selectedCampuses.includes(String(room.campus)),
      ) ?? [],
    [selectedCampuses, catalog],
  )
  const campuses = useMemo(
    () =>
      catalog?.campuses
        .filter((campus) => !campus.isPrivileged)
        .map((campus) => ({
          value: String(campus.id),
          label:
            campus.name === "Shipai Campus"
              ? t("shipaiCampus")
              : campus.name === "Knowledge City Campus"
                ? t("knowledgeCityCampus")
                : campus.name,
        })) ?? [],
    [catalog, t],
  )

  const applyFilters = useCallback(
    (values: SearchFormValues) => {
      const startDate = values.dateRange?.from ? format(values.dateRange.from, "yyyy-MM-dd") : ""
      const endDate = values.dateRange?.to ? format(values.dateRange.to, "yyyy-MM-dd") : ""

      // Auto-applied filters replace history in place: live updates must not
      // flood the back stack, and results refresh without scrolling away.
      router.replace(
        reservationSearchHref(
          {
            keyword: values.keyword.trim(),
            campusIds: values.campuses.map(Number),
            roomId: values.room === ALL ? 0 : Number(values.room),
            status: values.status === ALL ? undefined : values.status,
            startDate,
            endDate,
            page: 0,
            sort: values.sort,
          },
          0,
        ),
        { scroll: false },
      )
    },
    [router],
  )

  const onSubmit: SubmitHandler<SearchFormValues> = applyFilters

  const applyStatus = (status: ReservationStatus | typeof ALL) => {
    applyFilters({ ...getValues(), status })
  }

  // The URL is the source of truth: navigation (pagination, reset) must be
  // reflected back into the form so the sidebar never drifts from the results.
  useEffect(() => {
    reset({
      keyword: filters.keyword,
      campuses: filters.campusIds.map(String),
      room: filters.roomId ? String(filters.roomId) : ALL,
      dateRange: {
        from: inputValueToDate(filters.startDate),
        to: inputValueToDate(filters.endDate),
      },
      sort: filters.sort,
      status: filters.status ?? ALL,
    })
  }, [filters, reset])

  // Everything but the keyword applies on change; typing settles first so a
  // request fires once per pause instead of once per keystroke.
  useEffect(() => {
    if (keyword === undefined || keyword === filters.keyword) return
    const timer = setTimeout(() => applyFilters({ ...getValues(), keyword }), 400)
    return () => clearTimeout(timer)
  }, [keyword, filters, getValues, applyFilters])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="search-keyword">{t("keywordLabel")}</FieldLabel>
          <Controller
            control={control}
            name="keyword"
            render={({ field }) => (
              <InputGroup className="[&_[data-slot=input-group]]:h-11 sm:[&_[data-slot=input-group]]:h-8">
                <InputGroupAddon>
                  <Search aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                  {...field}
                  id="search-keyword"
                  type="search"
                  autoComplete="off"
                  maxLength={100}
                  placeholder={t("keyword")}
                />
              </InputGroup>
            )}
          />
        </Field>

        <FieldSet>
          <FieldLegend variant="label">{t("campusFilter")}</FieldLegend>
          <Controller
            control={control}
            name="campuses"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                {campuses.map((campus) => (
                  <Field
                    key={campus.value}
                    orientation="horizontal"
                    className="min-h-11 sm:min-h-8"
                  >
                    <Checkbox
                      id={`search-campus-${campus.value}`}
                      checked={field.value.includes(campus.value)}
                      onCheckedChange={(checked) => {
                        const nextCampuses = checked
                          ? [...field.value, campus.value]
                          : field.value.filter((value) => value !== campus.value)
                        field.onChange(nextCampuses)
                        applyFilters({ ...getValues(), campuses: nextCampuses })
                      }}
                    />
                    <FieldLabel htmlFor={`search-campus-${campus.value}`} className="font-normal">
                      {campus.label}
                    </FieldLabel>
                  </Field>
                ))}
              </div>
            )}
          />
        </FieldSet>

        <Field>
          <FieldLabel htmlFor="search-date-range">{t("dateFilter")}</FieldLabel>
          <Controller
            control={control}
            name="dateRange"
            render={({ field }) => (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="search-date-range"
                    type="button"
                    variant="outline"
                    className={`${CONTROL} justify-start font-normal`}
                    aria-expanded={calendarOpen}
                  >
                    <CalendarDays aria-hidden />
                    <DateRangeLabel
                      range={field.value}
                      locale={dateLocale}
                      placeholder={t("dateRange")}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={field.value}
                    onSelect={(range) => {
                      field.onChange(range)
                      applyFilters({ ...getValues(), dateRange: range })
                    }}
                    locale={dateLocale}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="search-sort-time">{t("sortFilter")}</FieldLabel>
          <Controller
            control={control}
            name="sort"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                  applyFilters({ ...getValues(), sort: value as SearchFormValues["sort"] })
                }}
                className="gap-1.5"
              >
                <Field orientation="horizontal" className="min-h-11 sm:min-h-8">
                  <RadioGroupItem value="time" id="search-sort-time" />
                  <FieldLabel htmlFor="search-sort-time" className="font-normal">
                    {t("sortByReservation")}
                  </FieldLabel>
                </Field>
                <Field orientation="horizontal" className="min-h-11 sm:min-h-8">
                  <RadioGroupItem value="sequence" id="search-sort-sequence" />
                  <FieldLabel htmlFor="search-sort-sequence" className="font-normal">
                    {t("sortBySequence")}
                  </FieldLabel>
                </Field>
              </RadioGroup>
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="search-room">{t("roomFilter")}</FieldLabel>
          <Controller
            control={control}
            name="room"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                  applyFilters({ ...getValues(), room: value })
                }}
              >
                <SelectTrigger id="search-room" className={CONTROL} aria-label={t("roomFilter")}>
                  <SelectValue placeholder={t("allRooms")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("allRooms")}</SelectItem>
                  {visibleRooms.map((room) => (
                    <SelectItem key={room.id} value={String(room.id)}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <FieldSet>
          <FieldLegend variant="label">{t("statusFilter")}</FieldLegend>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <Field orientation="horizontal" className="min-h-11 sm:min-h-8">
                  <Checkbox
                    id="search-status-all"
                    checked={field.value === ALL}
                    onCheckedChange={(checked) => {
                      if (checked) applyStatus(ALL)
                    }}
                  />
                  <FieldLabel htmlFor="search-status-all" className="font-normal">
                    {t("allStatuses")}
                  </FieldLabel>
                </Field>
                {STATUSES.map((status) => (
                  <Field key={status} orientation="horizontal" className="min-h-11 sm:min-h-8">
                    <Checkbox
                      id={`search-status-${status}`}
                      checked={field.value === status}
                      onCheckedChange={(checked) => applyStatus(checked ? status : ALL)}
                    />
                    <FieldLabel htmlFor={`search-status-${status}`} className="font-normal">
                      {statusT(status)}
                    </FieldLabel>
                  </Field>
                ))}
              </div>
            )}
          />
        </FieldSet>

        <Button
          type="button"
          variant="outline"
          className={`${CONTROL} justify-center`}
          onClick={() => router.push("/reservation/search")}
        >
          <RotateCcw aria-hidden />
          {t("reset")}
        </Button>
      </FieldGroup>
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
  if (!range?.from) {
    return <span className="min-w-0 truncate text-muted-foreground">{placeholder}</span>
  }
  const start = format(range.from, "PP", { locale })
  if (!range.to) return start
  return `${start} - ${format(range.to, "PP", { locale })}`
}
