"use client"

import { CalendarPlus, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useMemo, useState } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { ErrorState, LoadingState } from "@/components/layout/data-state"
import { MotionNumber } from "@/components/layout/motion-number"
import { RefreshButton } from "@/components/layout/refresh-button"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

import { FacilityRoomBoard } from "./facility-room-board"
import { relativeSince } from "./relative-time"
import { buildRoomDays, isRoomOpenToday, type RoomDayStatus } from "./room-day"
import { useFacilityFormatters } from "./use-facility-formatters"
import { useFacilitySchedule } from "./use-facility-schedule"

type StatusFilter = "all" | RoomDayStatus
const STATUS_FILTERS: readonly StatusFilter[] = ["all", "free", "in-use", "pending", "closed"]
const ALL_CAMPUSES = "all"

export function FacilityDashboard({ portrait = false }: { portrait?: boolean }) {
  const t = useTranslations("dashboard")
  const statusT = useTranslations("status")
  const { rooms, campuses, reservations, now, error, loading, updated, refresh } =
    useFacilitySchedule()
  const formatters = useFacilityFormatters()
  const [query, setQuery] = useState("")
  const [campus, setCampus] = useState(ALL_CAMPUSES)
  const [status, setStatus] = useState<StatusFilter>("all")
  const days = useMemo(
    () => buildRoomDays(rooms, reservations, campuses, now),
    [rooms, reservations, campuses, now],
  )
  const openTodayCount = rooms.filter((room) => isRoomOpenToday(room, now.getDay())).length
  const activeCount = days.filter((day) => day.status === "in-use").length
  const bookingsToday = reservations.filter(
    (item) =>
      item.status === "approved" || item.status === "pending" || item.status === "ai_reviewing",
  ).length
  const pending = reservations.filter(
    (item) => item.status === "pending" || item.status === "ai_reviewing",
  ).length
  const campusDays = days.filter(
    (day) => campus === ALL_CAMPUSES || String(day.room.campus) === campus,
  )
  const searchedDays = campusDays.filter((day) =>
    day.room.name.toLowerCase().includes(query.trim().toLowerCase()),
  )
  const visibleDays = searchedDays.filter((day) => status === "all" || day.status === status)
  const relative = relativeSince(updated, now, (key, values) => t(key, values), t("justNow"))
  const statusLabel = updated && !error ? t("lastUpdated", { time: relative }) : t("refreshEvery")
  const summary = [
    { label: "openToday", value: openTodayCount },
    { label: "roomsInUse", value: activeCount },
    { label: "bookingsToday", value: bookingsToday },
    { label: "pendingApproval", value: pending },
  ] as const

  function resetFilters() {
    setQuery("")
    setCampus(ALL_CAMPUSES)
    setStatus("all")
  }

  return (
    <AppShell width={portrait ? "full" : "wide"}>
      <div className={cn("min-w-0", portrait && "px-4 py-5 sm:px-6 lg:px-8")}>
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 pt-3 pb-7 sm:pt-6 sm:pb-8">
          <div className="min-w-0">
            <p className="mb-3 text-sm text-muted-foreground">{formatters.headerDate(now)}</p>
            <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
              {t("title")}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-muted-foreground sm:text-sm">{statusLabel}</p>
            <RefreshButton
              className="size-11 rounded-full"
              label={t("refresh")}
              loading={loading}
              onRefresh={() => void refresh()}
            />
            {portrait ? null : (
              <Button asChild className="h-11 rounded-full px-5">
                <Link href="/reservation/create" prefetch={false}>
                  <CalendarPlus aria-hidden />
                  {t("newBooking")}
                </Link>
              </Button>
            )}
          </div>
        </header>

        {error ? (
          <ErrorState
            title={t("errorTitle")}
            description={t("errorDescription")}
            retryLabel={t("refresh")}
            onRetry={() => void refresh()}
          />
        ) : null}
        {loading && rooms.length === 0 ? (
          <LoadingState rows={6} />
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 border-y py-4 sm:grid-cols-4 sm:py-5">
              {summary.map((item) => (
                <div
                  key={item.label}
                  className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1"
                >
                  <dt className="text-sm text-muted-foreground">{t(item.label)}</dt>
                  <dd className="text-2xl font-semibold tracking-tight tabular-nums">
                    {updated ? <MotionNumber value={String(item.value)} /> : "—"}
                  </dd>
                </div>
              ))}
            </dl>

            <section
              aria-label={t("filterRooms")}
              className="flex min-w-0 flex-col gap-5 pt-5 pb-6 sm:pt-7"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p aria-live="polite" className="text-sm text-muted-foreground">
                  {t("showingRooms", { count: visibleDays.length, total: rooms.length })}
                </p>
                <div className="grid min-w-0 grid-cols-2 gap-3 sm:flex">
                  <InputGroup className="h-11 min-w-0 bg-card sm:w-60">
                    <InputGroupInput
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={t("searchPlaceholder")}
                      aria-label={t("searchPlaceholder")}
                      type="search"
                      autoComplete="off"
                      maxLength={100}
                    />
                    <InputGroupAddon>
                      <Search aria-hidden />
                    </InputGroupAddon>
                  </InputGroup>
                  <Select value={campus} onValueChange={setCampus}>
                    <SelectTrigger
                      aria-label={t("campusFilter")}
                      className="w-full bg-card data-[size=default]:h-11 sm:w-56"
                    >
                      <SelectValue placeholder={t("allCampuses")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_CAMPUSES}>{t("allCampuses")}</SelectItem>
                      {campuses.map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <ToggleGroup
                  type="single"
                  value={status}
                  onValueChange={(value) => {
                    if (value) setStatus(value as StatusFilter)
                  }}
                  aria-label={t("statusFilter")}
                  className="flex-wrap justify-start gap-2"
                >
                  {STATUS_FILTERS.map((value) => (
                    <ToggleGroupItem
                      key={value}
                      value={value}
                      className="h-11 gap-2 rounded-full border border-transparent px-4 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                    >
                      {value === "all" ? t("allStatuses") : t(`status_${value}`)}
                      <span className="text-xs tabular-nums opacity-75">
                        {value === "all"
                          ? searchedDays.length
                          : searchedDays.filter((day) => day.status === value).length}
                      </span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <ul
                  aria-label={t("timelineLegend")}
                  className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground"
                >
                  <li className="flex items-center gap-1.5">
                    <span aria-hidden className="h-2.5 w-4 rounded-sm bg-info" />
                    {statusT("approved")}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span
                      aria-hidden
                      className="h-2.5 w-4 rounded-sm border border-dashed border-warning bg-warning/20"
                    />
                    {statusT("pending")}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span aria-hidden className="h-3 w-0.5 bg-primary" />
                    {t("currentTime")}
                  </li>
                </ul>
              </div>
            </section>

            <FacilityRoomBoard
              days={visibleDays}
              totalRooms={rooms.length}
              now={now}
              loading={loading}
              error={error}
              portrait={portrait}
              formatters={formatters}
              onResetFilters={resetFilters}
            />
          </>
        )}
      </div>
    </AppShell>
  )
}
