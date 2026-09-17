"use client"

import { CalendarDays, DoorOpen, RefreshCw } from "lucide-react"
import Link from "next/link"
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { getReservations } from "@/lib/api/reservations"
import type { Reservation } from "@/lib/api/types"

import { BrandLogo, StatusBadge, type Tone } from "./shared"

const fallbackRooms = [
  "iStudy RM 1",
  "Meeting RM 2",
  "Study Room A",
  "Study Room B",
  "Meeting RM 3",
]

function dateKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
}

function hourValue(value: Date) {
  return value.getHours() + value.getMinutes() / 60
}

function toneFor(reservation: Reservation): Tone {
  if (reservation.status === "approved") return "success"
  if (reservation.status === "pending") return "warning"
  if (reservation.status === "rejected") return "danger"
  return "info"
}

function statusLabel(reservation: Reservation) {
  return {
    approved: "已确认",
    pending: "待审批",
    rejected: "已拒绝",
    cancelled: "已取消",
  }[reservation.status]
}

function DashboardLegend({ portrait = false }: { portrait?: boolean }) {
  return (
    <div className="dashboard-legend">
      <span>
        <i className="legend-dot legend-dot--blue" />
        使用中 Active
      </span>
      <span>
        <i className="legend-dot legend-dot--green" />
        已确认 Confirmed
      </span>
      <span>
        <i className="legend-dot legend-dot--amber" />
        {portrait ? "待确认 Pending" : "待审核 Pending"}
      </span>
      <span>
        <i className="legend-dot legend-dot--red" />
        {portrait ? "已拒绝 Rejected" : "已取消 Cancelled"}
      </span>
    </div>
  )
}

function DashboardHeader({ portrait, now }: { portrait?: boolean; now: Date }) {
  const clock = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now)
  const date = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now)
  return (
    <header
      className={`dashboard-header ${portrait ? "dashboard-header--portrait" : ""}`}
    >
      <Link className="dashboard-brand" href="/">
        <BrandLogo dark />
        <span>
          {portrait ? "Facility Status (Shipai Campus)" : "HFI Utility Center"}
          <small>{!portrait && "FACILITY STATUS DASHBOARD"}</small>
        </span>
      </Link>
      <div className="dashboard-header__right">
        {!portrait && <DashboardLegend />}
        <div className="dashboard-clock">
          <strong>{clock}</strong>
          <span>{date}</span>
        </div>
      </div>
    </header>
  )
}

function DashboardStat({
  value,
  label,
  tone,
}: {
  value: number
  label: string
  tone: Tone
}) {
  return (
    <div className={`dashboard-stat dashboard-stat--${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function DashboardStats({
  reservations,
  now,
  portrait = false,
}: {
  reservations: Reservation[]
  now: Date
  portrait?: boolean
}) {
  const today = dateKey(now)
  const todayItems = reservations.filter(
    (item) => dateKey(new Date(item.startTime)) === today
  )
  const active = todayItems.filter(
    (item) =>
      item.status === "approved" &&
      new Date(item.startTime) <= now &&
      new Date(item.endTime) >= now
  ).length
  return (
    <div className="dashboard-stats">
      <DashboardStat
        value={todayItems.length}
        label={portrait ? "今日预约总数" : "今日总预约"}
        tone="info"
      />
      <DashboardStat
        value={todayItems.filter((item) => item.status === "approved").length}
        label="已确认"
        tone="success"
      />
      <DashboardStat
        value={todayItems.filter((item) => item.status === "pending").length}
        label={portrait ? "待确认" : "待审批"}
        tone="warning"
      />
      <DashboardStat
        value={active}
        label={portrait ? "使用中 Active" : "正在使用"}
        tone="danger"
      />
    </div>
  )
}

function DashboardSectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string
  action?: ReactNode
}) {
  return (
    <div className="dashboard-section-heading">
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
      {action}
    </div>
  )
}

function LandscapeTimeline({
  reservations,
  now,
}: {
  reservations: Reservation[]
  now: Date
}) {
  const today = dateKey(now)
  const events = reservations
    .filter(
      (item) =>
        dateKey(new Date(item.startTime)) === today &&
        item.status !== "cancelled"
    )
    .slice(0, 4)
  const timeToPercent = (time: number) =>
    Math.max(0, Math.min(100, ((time - 7) / 15) * 100))
  return (
    <div className="landscape-timeline">
      <div className="landscape-timeline__scale">
        {[
          "07:00",
          "09:00",
          "11:00",
          "13:00",
          "15:00",
          "17:00",
          "19:00",
          "21:00",
          "22:00",
        ].map((time) => (
          <span key={time}>{time}</span>
        ))}
      </div>
      <div className="landscape-timeline__canvas">
        <span
          className="dashboard-now-line"
          style={{ left: `${timeToPercent(hourValue(now))}%` }}
        >
          <b>NOW</b>
        </span>
        {events.map((event, index) => {
          const start = new Date(event.startTime)
          const end = new Date(event.endTime)
          const tone =
            event.status === "approved"
              ? "green"
              : event.status === "pending"
                ? "amber"
                : "blue"
          return (
            <div
              className={`dashboard-event dashboard-event--${tone}`}
              key={event.id}
              style={{
                left: `${timeToPercent(hourValue(start))}%`,
                width: `${Math.max(8, timeToPercent(hourValue(end)) - timeToPercent(hourValue(start)))}%`,
                top: `${24 + index * 76}px`,
              }}
            >
              <strong>{event.roomName}</strong>
              <span>
                {event.studentName} ({event.className || "HFI"})
              </span>
              <small>{formatTimeRange(event)}</small>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatTimeRange(reservation: Reservation) {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  return `${formatter.format(new Date(reservation.startTime))} - ${formatter.format(new Date(reservation.endTime))}`
}

function groupedUpcoming(reservations: Reservation[], now: Date) {
  const groups = new Map<string, Reservation[]>()
  reservations
    .filter(
      (item) => item.status !== "cancelled" && new Date(item.endTime) >= now
    )
    .forEach((item) => {
      const key = dateKey(new Date(item.startTime))
      groups.set(key, [...(groups.get(key) ?? []), item])
    })
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 2)
}

function UpcomingCard({ reservation }: { reservation: Reservation }) {
  const tone = toneFor(reservation)
  return (
    <div className={`upcoming-card upcoming-card--${tone}`}>
      <div className="upcoming-card__top">
        <span className="upcoming-card__room">
          <DoorOpen size={15} />
          {reservation.roomName}
        </span>
        <StatusBadge tone={tone}>{statusLabel(reservation)}</StatusBadge>
      </div>
      <div className="upcoming-card__bottom">
        <strong>{formatTimeRange(reservation)}</strong>
        <span>{reservation.reason}</span>
      </div>
    </div>
  )
}

function DashboardDayGroup({
  date,
  items,
  now,
}: {
  date: string
  items: Reservation[]
  now: Date
}) {
  const value = new Date(`${date}T12:00:00`)
  const label = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(value)
  const difference = Math.round(
    (new Date(date).getTime() - new Date(dateKey(now)).getTime()) / 86400000
  )
  const note =
    difference === 0
      ? "今天 (Today)"
      : difference === 1
        ? "明天 (Tomorrow)"
        : difference === 2
          ? "后天 (Day After Tomorrow)"
          : "Upcoming"
  return (
    <section className="dashboard-day-group">
      <div className="dashboard-date-bar">
        <CalendarDays size={16} />
        <strong>{label}</strong>
        <span>| {note}</span>
      </div>
      <div className="upcoming-grid">
        {items.slice(0, 4).map((item) => (
          <UpcomingCard reservation={item} key={item.id} />
        ))}
      </div>
    </section>
  )
}

function DashboardFooter({
  reservations,
  now,
  portrait = false,
}: {
  reservations: Reservation[]
  now: Date
  portrait?: boolean
}) {
  const rooms = [
    ...new Set(reservations.map((item) => item.roomName).filter(Boolean)),
  ].slice(0, portrait ? 5 : 6)
  const names = rooms.length ? rooms : fallbackRooms
  return (
    <footer
      className={`dashboard-room-footer ${portrait ? "dashboard-room-footer--portrait" : ""}`}
    >
      <span className="dashboard-room-footer__title">
        {portrait ? "当前空闲状态" : "实时教室状态"}{" "}
        <small>
          {portrait ? "Live Room Availability" : "Live Room Status"}
        </small>
      </span>
      <div className="room-status-list">
        {names.map((name) => {
          const occupied = reservations.some(
            (item) =>
              item.roomName === name &&
              item.status === "approved" &&
              new Date(item.startTime) <= now &&
              new Date(item.endTime) >= now
          )
          return (
            <span key={name}>
              <i
                className={`legend-dot legend-dot--${occupied ? "blue" : "green"}`}
              />
              <b>{name}</b>
              <em>{occupied ? "Occupied" : "Available"}</em>
            </span>
          )
        })}
      </div>
      {!portrait && (
        <span className="dashboard-copyright">
          HFI Utility Center © 2026 MAKERs’ Club
        </span>
      )}
    </footer>
  )
}

function DashboardLandscape({
  reservations,
  now,
  refresh,
}: {
  reservations: Reservation[]
  now: Date
  refresh: () => void
}) {
  const upcoming = groupedUpcoming(reservations, now)
  return (
    <div className="dashboard-page dashboard-page--landscape">
      <DashboardHeader now={now} />
      <main className="dashboard-main">
        <section className="dashboard-overview">
          <DashboardSectionHeading
            title="今日看板"
            subtitle="Today's Overview"
          />
          <DashboardStats reservations={reservations} now={now} />
          <div className="dashboard-timeline-card">
            <DashboardSectionHeading
              title="实时日程"
              subtitle="Timeline (07:00 - 22:00)"
            />
            <LandscapeTimeline reservations={reservations} now={now} />
          </div>
        </section>
        <section className="dashboard-upcoming">
          <DashboardSectionHeading
            title="后续预约列表"
            subtitle="Upcoming Bookings"
            action={
              <button className="dashboard-refresh" onClick={refresh}>
                <RefreshCw size={14} /> 刷新间隔: 30s
              </button>
            }
          />
          {upcoming.map(([date, items]) => (
            <DashboardDayGroup date={date} items={items} now={now} key={date} />
          ))}
          <div className="dashboard-autoscroll">
            <span>
              ▼ 自动更新中 · 显示未来预约 (Auto-refreshing · Upcoming bookings)
            </span>
            <i>
              <b />
            </i>
          </div>
        </section>
      </main>
      <DashboardFooter reservations={reservations} now={now} />
    </div>
  )
}

function PortraitTimeline({
  reservations,
  now,
}: {
  reservations: Reservation[]
  now: Date
}) {
  const hours = Array.from({ length: 16 }, (_, index) => 7 + index)
  const today = dateKey(now)
  const todayItems = reservations.filter(
    (item) =>
      dateKey(new Date(item.startTime)) === today && item.status !== "cancelled"
  )
  const liveRooms = [
    ...new Set(todayItems.map((item) => item.roomName).filter(Boolean)),
  ].slice(0, 5)
  const rooms = [
    ...liveRooms,
    ...fallbackRooms.filter((item) => !liveRooms.includes(item)),
  ].slice(0, 5)
  return (
    <div className="portrait-timeline">
      <div className="portrait-timeline__head">
        <span />
        <div>
          {rooms.map((room) => (
            <strong key={room}>{room}</strong>
          ))}
        </div>
      </div>
      <div className="portrait-timeline__body">
        <div className="portrait-timeline__hours">
          {hours.map((hour) => (
            <span key={hour}>{String(hour).padStart(2, "0")}:00</span>
          ))}
        </div>
        <div className="portrait-timeline__canvas">
          {todayItems.slice(0, 10).map((event) => {
            const room = Math.max(0, rooms.indexOf(event.roomName || ""))
            const start = hourValue(new Date(event.startTime))
            const end = hourValue(new Date(event.endTime))
            const tone =
              event.status === "approved"
                ? "green"
                : event.status === "pending"
                  ? "amber"
                  : "blue"
            return (
              <div
                className={`portrait-event portrait-event--${tone}`}
                key={event.id}
                style={{
                  left: `calc(${room} * ((100% - 64px) / 5 + 16px) + 5px)`,
                  width: "calc((100% - 64px) / 5 - 10px)",
                  top: `${Math.max(0, start - 7) * 82}px`,
                  height: `${Math.max(0.5, end - start) * 82}px`,
                }}
              >
                <strong>{event.studentName}</strong>
                <small>{formatTimeRange(event)}</small>
              </div>
            )
          })}
          <span
            className="portrait-now-line"
            style={{ top: `${Math.max(0, hourValue(now) - 7) * 82}px` }}
          >
            <b>NOW</b>
          </span>
        </div>
      </div>
    </div>
  )
}

function DashboardPortrait({
  reservations,
  now,
}: {
  reservations: Reservation[]
  now: Date
}) {
  return (
    <div className="dashboard-page dashboard-page--portrait">
      <DashboardHeader portrait now={now} />
      <main className="portrait-main">
        <div className="portrait-legend-panel">
          <strong>
            今日实时看板 <span>Today&apos;s Overview</span>
          </strong>
          <DashboardLegend portrait />
        </div>
        <DashboardStats portrait reservations={reservations} now={now} />
        <PortraitTimeline reservations={reservations} now={now} />
      </main>
      <DashboardFooter portrait reservations={reservations} now={now} />
    </div>
  )
}

export function FacilityDashboard({
  portrait = false,
}: {
  portrait?: boolean
}) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [now, setNow] = useState(() => new Date())
  const refresh = useCallback(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(end.getDate() + 14)
    void getReservations({
      startTime: Math.floor(start.getTime() / 1000),
      endTime: Math.floor(end.getTime() / 1000),
      page: 0,
    })
      .then((page) => setReservations(page.reservations))
      .catch(() => undefined)
  }, [])
  useEffect(() => {
    refresh()
    const clock = window.setInterval(() => setNow(new Date()), 1000)
    const data = window.setInterval(refresh, 30000)
    return () => {
      window.clearInterval(clock)
      window.clearInterval(data)
    }
  }, [refresh])
  return useMemo(
    () =>
      portrait ? (
        <DashboardPortrait reservations={reservations} now={now} />
      ) : (
        <DashboardLandscape
          reservations={reservations}
          now={now}
          refresh={refresh}
        />
      ),
    [now, portrait, refresh, reservations]
  )
}
