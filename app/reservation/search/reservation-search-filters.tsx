"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { enUS, zhCN } from "date-fns/locale"
import {
  CalendarDays,
  Clock3,
  DoorOpen,
  Filter,
  MapPin,
  Search,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Controller, useForm, type SubmitHandler } from "react-hook-form"
import type { DateRange } from "react-day-picker"

import { Calendar } from "@/components/astryx"
import { Field, FieldLabel } from "@/components/astryx"
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
  sort: "time" | "sequence"
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
  const [campusId, setCampusId] = useState("all")
  const [calendarOpen, setCalendarOpen] = useState(false)
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
      sort: filters.sort,
    },
  })
  const visibleRooms = useMemo(
    () =>
      catalog?.rooms.filter(
        (room) => campusId === "all" || room.campus === Number(campusId)
      ) ?? [],
    [campusId, catalog]
  )

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
          sort: values.sort,
        },
        0
      )
    )
  }

  return (
    <form className="neo-filter-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="filter-group">
        <div className="filter-heading">
          <Search size={15} />
          <span>{t("keywordLabel")}</span>
        </div>
        <Controller
          control={control}
          name="keyword"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="sr-only" htmlFor={field.name}>
                {t("keyword")}
              </FieldLabel>
              <label className="sidebar-search-control">
                <Search size={15} aria-hidden="true" />
                <input
                  {...field}
                  id={field.name}
                  placeholder={t("keyword")}
                  aria-invalid={fieldState.invalid}
                />
              </label>
            </Field>
          )}
        />
      </div>

      <div className="filter-group">
        <div className="filter-heading">
          <MapPin size={15} />
          <span>{t("campusFilter")}</span>
        </div>
        <select
          value={campusId}
          onChange={(event) => setCampusId(event.target.value)}
          className="filter-native-select"
        >
          <option value="all">{t("allCampuses")}</option>
          {catalog?.campuses
            .filter((campus) => !campus.isPrivileged)
            .map((campus) => (
              <option key={campus.id} value={String(campus.id)}>
                {campus.name}
              </option>
            ))}
        </select>
      </div>

      <div className="filter-group">
        <div className="filter-heading">
          <CalendarDays size={15} />
          <span>{t("dateFilter")}</span>
        </div>
        <Controller
          control={control}
          name="dateRange"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="sr-only" htmlFor={field.name}>
                {t("dateRange")}
              </FieldLabel>
              <button
                id={field.name}
                name={field.name}
                ref={field.ref}
                type="button"
                className="neo-filter-control"
                onBlur={field.onBlur}
                onClick={() => setCalendarOpen((open) => !open)}
                aria-expanded={calendarOpen}
              >
                <CalendarDays />
                <DateRangeLabel
                  range={field.value}
                  locale={dateLocale}
                  placeholder={t("dateRange")}
                />
              </button>
              {calendarOpen ? (
                <div className="sidebar-date-calendar">
                  <Calendar
                    className="booking-calendar"
                    classNames={{
                      month: "booking-calendar__month",
                      month_caption: "booking-calendar__caption",
                      caption_label: "booking-calendar__caption-label",
                      nav: "booking-calendar__nav",
                      button_previous: "booking-calendar__previous",
                      button_next: "booking-calendar__next",
                      month_grid: "booking-calendar__grid",
                      weekdays: "booking-calendar__weekdays",
                      weekday: "booking-calendar__weekday",
                      week: "booking-calendar__week",
                      day: "booking-calendar__day",
                      day_button: "booking-calendar__day-button",
                      selected: "booking-calendar__selected",
                      range_start: "booking-calendar__range-start",
                      range_middle: "booking-calendar__range-middle",
                      range_end: "booking-calendar__range-end",
                      outside: "booking-calendar__outside",
                      disabled: "booking-calendar__disabled",
                      today: "booking-calendar__today",
                    }}
                    mode="range"
                    selected={field.value}
                    onSelect={field.onChange}
                    locale={dateLocale}
                  />
                </div>
              ) : null}
            </Field>
          )}
        />
        <span className="filter-help">{t("dateHelp")}</span>
      </div>

      <div className="filter-group">
        <div className="filter-heading">
          <Clock3 size={15} />
          <span>{t("sortFilter")}</span>
        </div>
        <Controller
          control={control}
          name="sort"
          render={({ field }) => (
            <div className="filter-status-list">
              <button
                type="button"
                className={`filter-button ${field.value === "time" ? "filter-button--active" : ""}`}
                onClick={() => {
                  field.onChange("time")
                  void handleSubmit((values) =>
                    onSubmit({ ...values, sort: "time" })
                  )()
                }}
              >
                {t("sortByReservation")}
              </button>
              <button
                type="button"
                className={`filter-button ${field.value === "sequence" ? "filter-button--active" : ""}`}
                onClick={() => {
                  field.onChange("sequence")
                  void handleSubmit((values) =>
                    onSubmit({ ...values, sort: "sequence" })
                  )()
                }}
              >
                {t("sortBySequence")}
              </button>
            </div>
          )}
        />
      </div>

      <div className="filter-group">
        <div className="filter-heading">
          <DoorOpen size={15} />
          <span>{t("roomFilter")}</span>
        </div>
        <Controller
          control={control}
          name="room"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="sr-only" htmlFor={field.name}>
                {t("allRooms")}
              </FieldLabel>
              <select
                id={field.name}
                name={field.name}
                value={field.value}
                onChange={(event) => field.onChange(event.target.value)}
                aria-invalid={fieldState.invalid}
                className="filter-native-select"
              >
                <option value="all">{t("allRooms")}</option>
                {visibleRooms.map((room) => (
                  <option key={room.id} value={String(room.id)}>
                    {room.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
        />
      </div>

      <div className="filter-group">
        <div className="filter-heading">
          <Filter size={15} />
          <span>{t("statusFilter")}</span>
        </div>
        <Controller
          control={control}
          name="status"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="filter-status-list">
                {(["all", "approved", "pending", "rejected"] as const).map(
                  (status) => (
                    <button
                      type="button"
                      key={status}
                      className={`filter-button ${field.value === status ? "filter-button--active" : ""}`}
                      onClick={() => field.onChange(status)}
                    >
                      {status === "all" ? t("allStatuses") : statusT(status)}
                    </button>
                  )
                )}
              </div>
            </Field>
          )}
        />
      </div>

      <button type="submit" className="neo-filter-submit">
        <Search size={15} aria-hidden="true" />
        <span>{common("search")}</span>
      </button>
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
    return <span className="text-muted-foreground">{placeholder}</span>
  }
  const start = format(range.from, "PP", { locale })
  if (!range.to) return start
  return `${start} - ${format(range.to, "PP", { locale })}`
}
