"use client"

import { ArrowUpRight, Building2, SearchX } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

import { EmptyState } from "@/components/layout/data-state"
import { PercentSpan } from "@/components/layout/percent-span"
import { StatusBadge, type StatusTone } from "@/components/layout/status-badge"
import { Button } from "@/components/ui/button"
import { dateToInputValue } from "@/lib/date-time"
import { DAY_END_HOUR, DAY_START_HOUR } from "@/lib/reservations/availability"
import { cn } from "@/lib/utils"

import { reservationSearchHref } from "../reservation/search/search-query"
import { dayWindow, formatDayHour, type RoomDay, type RoomDayStatus } from "./room-day"
import type { Formatters } from "./use-facility-formatters"

const TONE_BY_STATUS: Record<RoomDayStatus, StatusTone> = {
  free: "success",
  "in-use": "info",
  pending: "pending",
  closed: "neutral",
}
const HOURS = [DAY_START_HOUR, 12, 16, 20, DAY_END_HOUR]
const hourPosition = (hour: number) =>
  `${((hour - DAY_START_HOUR) / (DAY_END_HOUR - DAY_START_HOUR)) * 100}%`

export function FacilityRoomBoard({
  days,
  totalRooms,
  now,
  loading,
  error,
  portrait,
  formatters,
  onResetFilters,
}: {
  days: RoomDay[]
  totalRooms: number
  now: Date
  loading: boolean
  error: boolean
  portrait: boolean
  formatters: Formatters
  onResetFilters: () => void
}) {
  const t = useTranslations("dashboard")
  const statusT = useTranslations("status")

  if (totalRooms === 0) {
    if (error || loading) return null
    return (
      <EmptyState icon={Building2} title={t("noRooms")} description={t("noRoomsDescription")} />
    )
  }
  if (days.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={t("noResults")}
        description={t("noResultsDescription")}
        action={
          <Button type="button" variant="outline" onClick={onResetFilters}>
            {t("resetFilters")}
          </Button>
        }
      />
    )
  }

  const { start, end } = dayWindow(now)
  const nowMs = now.getTime()
  const nowPct = Math.min(100, Math.max(0, ((nowMs - start) / Math.max(1, end - start)) * 100))
  const showNow = nowMs >= start && nowMs <= end
  const today = dateToInputValue(now)
  const groups = new Map<number, RoomDay[]>()
  for (const day of days) {
    const group = groups.get(day.room.campus)
    if (group) group.push(day)
    else groups.set(day.room.campus, [day])
  }

  return (
    <div className="flex min-w-0 flex-col gap-9">
      {Array.from(groups, ([campusId, campusDays]) => (
        <section key={campusId} aria-labelledby={`campus-${campusId}`} className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 pb-4">
            <span aria-hidden className="h-6 w-1.5 rounded-full bg-primary" />
            <h2 id={`campus-${campusId}`} className="min-w-0 text-xl font-semibold tracking-tight">
              {campusDays[0].campusName || t("otherCampus")}
            </h2>
            <span className="text-sm text-muted-foreground">
              {t("campusRooms", { count: campusDays.length })}
            </span>
          </div>
          <div className="rounded-2xl border bg-card">
            <div
              aria-hidden
              className={cn(
                "sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-20 hidden grid-cols-[minmax(12rem,0.8fr)_minmax(0,2fr)_2.75rem] items-center gap-6 rounded-t-2xl border-b bg-muted px-6 py-4 lg:grid",
                portrait && "lg:grid-cols-[minmax(12rem,0.8fr)_minmax(0,2fr)]",
              )}
            >
              <span className="text-xs text-muted-foreground">{t("roomColumn")}</span>
              <TimeRuler />
            </div>
            <ul className="divide-y">
              {campusDays.map((day) => {
                const upcoming = day.bookings
                  .filter((item) => Date.parse(item.endTime) > nowMs)
                  .slice(0, 3)
                const fallback = t("purposeFallback")
                const headline = day.current
                  ? t("endsAt", { time: formatters.time(day.current.endTime) })
                  : day.status === "closed"
                    ? t("closedToday")
                    : day.next
                      ? t("freeUntil", { time: formatters.time(day.next.startTime) })
                      : day.bookings.length
                        ? t("noMoreBookings")
                        : t("noBookingsToday")
                const dayHref = reservationSearchHref(
                  {
                    keyword: "",
                    campusIds: [],
                    roomId: day.room.id,
                    status: undefined,
                    startDate: today,
                    endDate: today,
                    page: 0,
                    sort: "time",
                  },
                  0,
                )
                const timelineLabel = [
                  t("timelineLabel", {
                    start: formatDayHour(DAY_START_HOUR),
                    end: formatDayHour(DAY_END_HOUR),
                  }),
                  ...day.bookings.map(
                    (item) =>
                      `${formatters.time(item.startTime)}–${formatters.time(item.endTime)} ${statusT(item.status)}`,
                  ),
                ].join("; ")

                return (
                  <li
                    key={day.room.id}
                    className={cn(
                      "t-lift grid min-w-0 gap-x-6 gap-y-4 px-4 py-5 hover:bg-accent/40 sm:px-6 lg:grid-cols-[minmax(12rem,0.8fr)_minmax(0,2fr)_2.75rem] lg:items-start lg:py-6",
                      portrait && "lg:grid-cols-[minmax(12rem,0.8fr)_minmax(0,2fr)]",
                    )}
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3 lg:block">
                      <div className="min-w-0">
                        <h3 className="text-lg leading-snug font-semibold tracking-tight break-words sm:text-xl">
                          {day.room.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("bookingsCount", { count: day.bookings.length })}
                        </p>
                      </div>
                      <StatusBadge
                        tone={TONE_BY_STATUS[day.status]}
                        dot
                        className="shrink-0 lg:mt-3"
                      >
                        {t(`status_${day.status}`)}
                      </StatusBadge>
                    </div>
                    <div className="min-w-0">
                      <div className="mb-2 lg:hidden">
                        <TimeRuler />
                      </div>
                      <div
                        // A timeline is a single graphic with a text equivalent for every booking.
                        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
                        role="img"
                        aria-label={timelineLabel}
                        className={cn(
                          "relative h-9 overflow-hidden rounded-md bg-muted",
                          day.status === "closed" && "opacity-60",
                        )}
                      >
                        {HOURS.map((hour) => (
                          <PercentSpan
                            key={hour}
                            aria-hidden
                            left={hourPosition(hour)}
                            className="inset-y-0 w-px bg-border"
                          />
                        ))}
                        {day.segments.map((segment) => (
                          <PercentSpan
                            key={segment.id}
                            aria-hidden
                            left={`${segment.left}%`}
                            width={`${segment.width}%`}
                            className={cn(
                              "inset-y-1 rounded-sm",
                              segment.status === "approved"
                                ? "bg-info"
                                : "border border-dashed border-warning bg-warning/20",
                            )}
                          />
                        ))}
                        {showNow ? (
                          <PercentSpan
                            aria-hidden
                            left={`${nowPct}%`}
                            className="inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-primary"
                          />
                        ) : null}
                      </div>
                      <p className="mt-2.5 text-sm text-muted-foreground">{headline}</p>
                      {upcoming.length ? (
                        <ul className="mt-2 flex min-w-0 flex-col gap-1.5">
                          {upcoming.map((item) => (
                            <li
                              key={item.id}
                              className="flex min-w-0 flex-wrap items-baseline gap-x-2 text-sm"
                            >
                              <time
                                dateTime={item.startTime}
                                className="shrink-0 text-xs text-muted-foreground tabular-nums"
                              >
                                {formatters.time(item.startTime)}–{formatters.time(item.endTime)}
                              </time>
                              <span className="min-w-0 break-words">{item.reason || fallback}</span>
                              <span
                                className={cn(
                                  "text-xs",
                                  item.status === "pending" ? "text-warning" : "text-info",
                                )}
                              >
                                {day.current?.id === item.id
                                  ? `${statusT(item.status)} / ${t("nowBadge")}`
                                  : statusT(item.status)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    {portrait ? null : (
                      <Button
                        asChild
                        variant="ghost"
                        className="h-11 w-fit justify-self-end rounded-full px-3 lg:size-11 lg:p-0"
                      >
                        <Link
                          href={dayHref}
                          prefetch={false}
                          aria-label={t("viewRoomDay", { room: day.room.name })}
                        >
                          <span className="lg:hidden">{t("viewDay")}</span>
                          <ArrowUpRight aria-hidden className="size-4" />
                        </Link>
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ))}
    </div>
  )
}

function TimeRuler() {
  return (
    <div aria-hidden className="relative h-4 text-xs text-muted-foreground tabular-nums">
      {HOURS.map((hour, index) => (
        <PercentSpan
          key={hour}
          left={hourPosition(hour)}
          className={cn(
            "whitespace-nowrap",
            index === HOURS.length - 1 ? "-translate-x-full" : index > 0 && "-translate-x-1/2",
            hour === 20 && "hidden sm:block",
          )}
        >
          {formatDayHour(hour)}
        </PercentSpan>
      ))}
    </div>
  )
}
