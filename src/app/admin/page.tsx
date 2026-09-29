"use client"

import { ArrowRight, Building2, CalendarCheck2, CalendarClock, DoorOpen } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { useMemo } from "react"

import { EmptyState, ErrorState, LoadingState } from "@/components/layout/data-state"
import { PageHeader } from "@/components/layout/page-header"
import { RefreshButton } from "@/components/layout/refresh-button"
import { StatusBadge } from "@/components/layout/status-badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAdminResource } from "@/lib/api/admin-hooks"
import { getAdmins } from "@/lib/api/admins"
import {
  getAnalyticsOverview,
  getWeeklyAnalytics,
  type AnalyticsOverview,
  type WeeklyAnalytics,
} from "@/lib/api/analytics"
import { getCampuses, getRooms } from "@/lib/api/catalog"
import { getFutureReservations } from "@/lib/api/reservations"
import type { Admin, Campus, Reservation, Room } from "@/lib/api/types"
import { formatApiTimestamp } from "@/lib/date-time"

async function loadDashboard() {
  const [overview, weekly, rooms, campuses, admins, reservations] = await Promise.all([
    getAnalyticsOverview(),
    getWeeklyAnalytics(),
    getRooms(),
    getCampuses(),
    getAdmins(),
    getFutureReservations(),
  ])

  return { overview, weekly, rooms, campuses, admins, reservations }
}

interface DashboardData {
  overview: AnalyticsOverview
  weekly: WeeklyAnalytics
  rooms: Room[]
  campuses: Campus[]
  admins: Admin[]
  reservations: Reservation[]
}

const emptyDashboard: DashboardData = {
  overview: {
    today: {
      reservations: 0,
      reservationCreations: 0,
      requests: 0,
      approvals: 0,
      rejections: 0,
    },
    pending: 0,
  },
  weekly: {
    totalReservations: 0,
    totalReservationCreations: 0,
    totalApprovals: 0,
    totalRejections: 0,
    rooms: [],
    dailyReservations: [],
  },
  rooms: [],
  campuses: [],
  admins: [],
  reservations: [],
}

const SNAPSHOT_GRID =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 [&>dd]:justify-self-end"

export default function AdminPage() {
  const t = useTranslations("admin")
  const statusT = useTranslations("status")
  const common = useTranslations("common")
  const locale = useLocale()
  const resource = useAdminResource({
    loadResource: loadDashboard,
    initialData: emptyDashboard,
  })
  const data = resource.data
  const pendingReservations = useMemo(
    () =>
      data.reservations
        .filter(
          (reservation) =>
            reservation.status === "pending" || reservation.status === "ai_reviewing",
        )
        .slice(0, 6),
    [data.reservations],
  )
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale],
  )

  const refresh = () => void resource.reload().catch(() => undefined)

  const stats = [
    { label: t("pendingReservations"), value: data.overview.pending, to: "/admin/reservation" },
    {
      label: t("todayReservations"),
      value: data.overview.today.reservations,
      to: "/admin/reservation",
    },
    {
      label: t("openRooms"),
      value: data.rooms.filter((room) => room.enabled).length,
      to: "/admin/facility",
    },
    { label: t("adminAccounts"), value: data.admins.length, to: "/admin/user" },
  ]

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader
        title={t("overviewTitle")}
        actions={
          <RefreshButton label={common("refresh")} loading={resource.loading} onRefresh={refresh} />
        }
      />

      <section
        className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-4"
        aria-label={t("overviewTitle")}
      >
        {stats.map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </section>

      {resource.loading ? <LoadingState label={t("overviewLoading")} /> : null}

      {resource.error && !resource.loading ? (
        <ErrorState onRetry={refresh} retryLabel={common("retry")} />
      ) : null}

      <Separator />

      <div className="grid min-w-0 gap-10 lg:grid-cols-2">
        <section className="min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium">{t("pendingQueue")}</h2>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={t("viewAll")}
                >
                  <Link href="/admin/reservation" prefetch={false}>
                    <ArrowRight />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("viewAll")}</TooltipContent>
            </Tooltip>
          </div>
          {pendingReservations.length ? (
            <ul className="flex min-w-0 flex-col divide-y divide-border">
              {pendingReservations.map((reservation) => (
                <li key={reservation.id}>
                  <PendingReservation
                    reservation={reservation}
                    dateFormatter={dateFormatter}
                    statusLabel={statusT(reservation.status)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={CalendarCheck2}
              title={t("reservationsEmpty")}
              description={t("reservationsEmptyDescription")}
            />
          )}
        </section>

        <section className="min-w-0 space-y-3">
          <h2 className="text-sm font-medium">{t("systemSnapshot")}</h2>
          <dl className={SNAPSHOT_GRID}>
            <SnapshotRow icon={Building2} label={t("campuses")} value={data.campuses.length} />
            <SnapshotRow icon={DoorOpen} label={t("rooms")} value={data.rooms.length} />
            <SnapshotRow
              icon={CalendarCheck2}
              label={t("weeklyApproved")}
              value={data.weekly.totalApprovals}
            />
            <SnapshotRow
              icon={CalendarClock}
              label={t("weeklyReservations")}
              value={data.weekly.totalReservations}
            />
          </dl>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link
      href={to}
      prefetch={false}
      className="min-w-0 border-l-2 border-primary/40 pl-3 transition-colors hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className="block text-xs tracking-wide text-muted-foreground uppercase">{label}</span>
      <span className="block text-2xl font-semibold break-words tabular-nums">{value}</span>
    </Link>
  )
}

function PendingReservation({
  reservation,
  dateFormatter,
  statusLabel,
}: {
  reservation: Reservation
  dateFormatter: Intl.DateTimeFormat
  statusLabel: string
}) {
  return (
    <Link
      href="/admin/reservation"
      prefetch={false}
      className="flex min-w-0 items-center gap-3 py-3 transition-colors hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <span className="w-12 shrink-0 text-sm font-semibold text-primary tabular-nums">
        #{reservation.id}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium break-words">
          {reservation.roomName || reservation.reason}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {reservation.roomName
            ? `${reservation.studentName} · ${reservation.reason}`
            : reservation.studentName}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatApiTimestamp(dateFormatter, reservation.startTime)}
        </span>
        <StatusBadge tone={reservation.status === "ai_reviewing" ? "info" : "pending"}>
          {statusLabel}
        </StatusBadge>
      </span>
    </Link>
  )
}

function SnapshotRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2
  label: string
  value: number
}) {
  return (
    <>
      <dt className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="text-sm font-semibold tabular-nums">{value}</dd>
    </>
  )
}
