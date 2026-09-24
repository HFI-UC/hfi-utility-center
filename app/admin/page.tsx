"use client"

import { useMemo } from "react"
import {
  Building2,
  CalendarCheck2,
  CalendarClock,
  DoorOpen,
  RefreshCw,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"

import { AdminPageHeader, AdminSection } from "@/app/admin/admin-shell"
import { Badge, Button, Spinner } from "@/components/astryx"
import { getAdmins } from "@/lib/api/admins"
import { getAnalyticsOverview, getWeeklyAnalytics } from "@/lib/api/analytics"
import { getCampuses, getRooms } from "@/lib/api/catalog"
import { useAdminResource } from "@/lib/api/admin-hooks"
import { getFutureReservations } from "@/lib/api/reservations"
import type { Reservation } from "@/lib/api/types"

async function loadDashboard() {
  const [overview, weekly, rooms, campuses, admins, reservations] =
    await Promise.all([
      getAnalyticsOverview(),
      getWeeklyAnalytics(),
      getRooms(),
      getCampuses(),
      getAdmins(),
      getFutureReservations(),
    ])

  return { overview, weekly, rooms, campuses, admins, reservations }
}

type DashboardData = Awaited<ReturnType<typeof loadDashboard>>

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

export default function AdminPage() {
  const t = useTranslations("admin")
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
        .filter((reservation) => reservation.status === "pending")
        .slice(0, 6),
    [data.reservations]
  )
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [locale]
  )

  const stats = [
    {
      label: t("pendingReservations"),
      value: data.overview.pending,
      icon: CalendarClock,
      tone: "warning",
    },
    {
      label: t("todayReservations"),
      value: data.overview.today.reservations,
      icon: CalendarCheck2,
      tone: "primary",
    },
    {
      label: t("openRooms"),
      value: data.rooms.filter((room) => room.enabled).length,
      icon: DoorOpen,
      tone: "success",
    },
    {
      label: t("adminAccounts"),
      value: data.admins.length,
      icon: Users,
      tone: "info",
    },
  ]

  return (
    <main className="admin-page space-y-6">
      <AdminPageHeader
        title={t("overviewTitle")}
        description={t("overviewDescription")}
        actions={
          <Button
            variant="outline"
            onClick={() => void resource.reload().catch(() => undefined)}
            disabled={resource.loading}
          >
            <RefreshCw />
            {common("refresh")}
          </Button>
        }
      />

      <section className="admin-stat-grid" aria-label={t("overviewTitle")}>
        {stats.map((stat) => (
          <article className="admin-stat-card" key={stat.label}>
            <span
              className={`admin-stat-card__icon admin-stat-card__icon--${stat.tone}`}
            >
              <stat.icon />
            </span>
            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          </article>
        ))}
      </section>

      {resource.loading ? (
        <div className="admin-dashboard-loading">
          <Spinner />
          {t("overviewLoading")}
        </div>
      ) : null}

      {resource.error && !resource.loading ? (
        <div className="admin-error-state" role="alert">
          <p>{common("unknown")}</p>
          <Button
            variant="outline"
            onClick={() => void resource.reload().catch(() => undefined)}
          >
            <RefreshCw />
            {common("retry")}
          </Button>
        </div>
      ) : null}

      <div className="admin-dashboard-grid">
        <AdminSection
          title={t("pendingQueue")}
          action={
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/reservation">{t("viewAll")}</Link>
            </Button>
          }
        >
          <div className="admin-pending-list">
            {pendingReservations.length ? (
              pendingReservations.map((reservation) => (
                <PendingReservation
                  key={reservation.id}
                  reservation={reservation}
                  dateFormatter={dateFormatter}
                />
              ))
            ) : (
              <p className="admin-empty-copy">{t("reservationsEmpty")}</p>
            )}
          </div>
        </AdminSection>

        <AdminSection title={t("systemSnapshot")}>
          <dl className="admin-snapshot-list">
            <SnapshotRow
              icon={Building2}
              label={t("campuses")}
              value={data.campuses.length}
            />
            <SnapshotRow
              icon={DoorOpen}
              label={t("rooms")}
              value={data.rooms.length}
            />
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
        </AdminSection>
      </div>
    </main>
  )
}

function PendingReservation({
  reservation,
  dateFormatter,
}: {
  reservation: Reservation
  dateFormatter: Intl.DateTimeFormat
}) {
  return (
    <Link
      href="/admin/reservation"
      className="admin-pending-item"
      aria-label={`Reservation ${reservation.id}`}
    >
      <span className="admin-pending-item__number">#{reservation.id}</span>
      <span className="admin-pending-item__body">
        <strong>{reservation.roomName || "—"}</strong>
        <small>
          {reservation.studentName} · {reservation.reason}
        </small>
      </span>
      <span className="admin-pending-item__time">
        {dateFormatter.format(new Date(reservation.startTime))}
      </span>
      <Badge className="admin-pending-item__badge">Pending</Badge>
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
    <div className="admin-snapshot-row">
      <dt>
        <Icon />
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  )
}
