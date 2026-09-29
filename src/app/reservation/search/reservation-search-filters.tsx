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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { CatalogData, ReservationStatus } from "@/lib/api/types"
import { inputValueToDate } from "@/lib/date-time"

import { isBookableCampus } from "../create/bookable-campus"
import { reservationSearchHref, type ReservationSearchFilters } from "./search-query"

const ALL = "all"

const STATUSES = ["pending", "approved", "rejected", "cancelled"] as const satisfies ReadonlyArray<
  Exclude<ReservationStatus, "ai_reviewing">
>

const CONTROL = "w-full min-h-11 sm:min-h-8"

type SearchFormValues = {
  keyword: string
  campus: string
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
  const common = useTranslations("common")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const dateLocale = useLocale() === "zh-CN" ? zhCN : enUS
  const { control, handleSubmit, getValues, reset, setValue } = useForm<SearchFormValues>({
    defaultValues: {
      keyword: filters.keyword,
      campus: filters.campusId ? String(filters.campusId) : ALL,
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
  const campusId = useWatch({ control, name: "campus" })
  const visibleRooms = useMemo(() => {
    const officeIds = new Set(
      catalog?.campuses.filter((campus) => !isBookableCampus(campus)).map((campus) => campus.id),
    )
    return (
      catalog?.rooms.filter(
        (room) =>
          !officeIds.has(room.campus ?? -1) &&
          (campusId === ALL || room.campus === Number(campusId)),
      ) ?? []
    )
  }, [campusId, catalog])
  const campuses = useMemo(
    () => [
      { value: ALL, label: t("allCampuses") },
      ...(catalog?.campuses
        .filter((campus) => !campus.deletedAt && isBookableCampus(campus))
        .map((campus) => ({
          value: String(campus.id),
          label:
            campus.name === "Shipai Campus"
              ? t("shipaiCampus")
              : campus.name === "Knowledge City Campus"
                ? t("knowledgeCityCampus")
                : campus.name,
        })) ?? []),
    ],
    [catalog, t],
  )
  const roomGroups = useMemo(
    () =>
      campuses
        .filter((campus) => campus.value !== ALL)
        .map((campus) => ({
          value: campus.value,
          label: campus.label,
          rooms: visibleRooms.filter((room) => String(room.campus ?? "") === campus.value),
        }))
        .filter((group) => group.rooms.length > 0),
    [campuses, visibleRooms],
  )

  const applyFilters = useCallback(
    (values: SearchFormValues, history: "push" | "replace" = "push") => {
      const startDate = values.dateRange?.from ? format(values.dateRange.from, "yyyy-MM-dd") : ""
      const endDate = values.dateRange?.to ? format(values.dateRange.to, "yyyy-MM-dd") : ""
      const href = reservationSearchHref(
        {
          keyword: values.keyword.trim(),
          campusId: values.campus === ALL ? 0 : Number(values.campus),
          roomId: values.room === ALL ? 0 : Number(values.room),
          status: values.status === ALL ? undefined : values.status,
          startDate,
          endDate,
          page: 0,
          sort: values.sort,
        },
        0,
      )
      const target = new URL(href, window.location.origin)
      const currentPath = window.location.pathname.replace(/\/$/, "")
      const targetPath = target.pathname.replace(/\/$/, "")
      if (currentPath === targetPath && window.location.search === target.search) return
      router[history](href, { scroll: false })
    },
    [router],
  )

  const onSubmit: SubmitHandler<SearchFormValues> = (values) => applyFilters(values)

  const applyStatus = (status: ReservationStatus | typeof ALL) => {
    setValue("status", status)
    applyFilters({ ...getValues(), status })
  }

  useEffect(() => {
    reset({
      keyword: filters.keyword,
      campus: filters.campusId ? String(filters.campusId) : ALL,
      room: filters.roomId ? String(filters.roomId) : ALL,
      dateRange: {
        from: inputValueToDate(filters.startDate),
        to: inputValueToDate(filters.endDate),
      },
      sort: filters.sort,
      status: filters.status ?? ALL,
    })
  }, [filters, reset])

  useEffect(() => {
    if (keyword === undefined || keyword.trim() === filters.keyword) return
    const timer = setTimeout(() => applyFilters({ ...getValues(), keyword }, "replace"), 400)
    return () => clearTimeout(timer)
  }, [keyword, filters.keyword, getValues, applyFilters])

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
            name="campus"
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
                      checked={field.value === campus.value}
                      onCheckedChange={(checked) => {
                        const nextCampus = checked ? campus.value : ALL
                        const values = getValues()
                        const room =
                          nextCampus === ALL ||
                          catalog?.rooms.some(
                            (item) =>
                              item.id === Number(values.room) && item.campus === Number(nextCampus),
                          )
                            ? values.room
                            : ALL
                        field.onChange(nextCampus)
                        setValue("room", room)
                        applyFilters({ ...values, campus: nextCampus, room })
                      }}
                    />
                    <FieldLabel htmlFor={`search-campus-${campus.value}`}>
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
                    className={`${CONTROL} justify-start`}
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
                {/* oxlint-disable-next-line shadcn/no-restyle -- calendar popover padding */}
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
              >
                <Field orientation="horizontal" className="min-h-11 sm:min-h-8">
                  <RadioGroupItem value="time" id="search-sort-time" />
                  <FieldLabel htmlFor="search-sort-time">{t("sortByReservation")}</FieldLabel>
                </Field>
                <Field orientation="horizontal" className="min-h-11 sm:min-h-8">
                  <RadioGroupItem value="sequence" id="search-sort-sequence" />
                  <FieldLabel htmlFor="search-sort-sequence">{t("sortBySequence")}</FieldLabel>
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
                  {roomGroups.map((group) => (
                    <SelectGroup key={group.value}>
                      <SelectSeparator />
                      <SelectLabel>{group.label}</SelectLabel>
                      {group.rooms.map((room) => (
                        <SelectItem key={room.id} value={String(room.id)}>
                          {room.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
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
                  <FieldLabel htmlFor="search-status-all">{t("allStatuses")}</FieldLabel>
                </Field>
                {STATUSES.map((status) => (
                  <Field key={status} orientation="horizontal" className="min-h-11 sm:min-h-8">
                    <Checkbox
                      id={`search-status-${status}`}
                      checked={field.value === status}
                      onCheckedChange={(checked) => applyStatus(checked ? status : ALL)}
                    />
                    <FieldLabel htmlFor={`search-status-${status}`}>{statusT(status)}</FieldLabel>
                  </Field>
                ))}
              </div>
            )}
          />
        </FieldSet>

        <div className="flex items-center gap-2">
          <Button type="submit" className="min-h-11 flex-1 sm:min-h-8">
            <Search aria-hidden />
            {common("search")}
          </Button>
          <TooltipProvider delayDuration={80}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t("reset")}
                  className="size-11 shrink-0 sm:size-8"
                  onClick={() => router.push("/reservation/search")}
                >
                  <RotateCcw aria-hidden />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("reset")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
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
