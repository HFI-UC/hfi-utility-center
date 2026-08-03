"use client"

import { useMemo, useState } from "react"
import { Download, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"
import { AdminPageHeader } from "@/components/admin-page-header"
import { Button } from "@/components/ui/button"
import { Turnstile } from "@/components/turnstile"
import { useAdminResource } from "@/features/admin/use-admin-resource"
import {
  analyticsExportUrl,
  getOverviewAnalytics,
  getWeeklyAnalytics,
} from "@/lib/api/analytics"
import type { OverviewAnalytics, WeeklyAnalytics } from "@/lib/api/types"

type AnalyticsData = {
  overview?: OverviewAnalytics
  weekly?: WeeklyAnalytics
}

async function loadAnalyticsData(): Promise<AnalyticsData> {
  const [overview, weekly] = await Promise.all([
    getOverviewAnalytics(),
    getWeeklyAnalytics(),
  ])
  return { overview, weekly }
}

function Bars({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values, 1)
  return (
    <div className="space-y-2">
      {values.map((value, index) => (
        <div
          key={`${labels[index]}-${index}`}
          className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3 text-xs"
        >
          <span className="text-muted-foreground">{labels[index]}</span>
          <div className="h-2 bg-muted">
            <div
              className="h-full bg-foreground"
              style={{
                width: `${Math.max(value ? 4 : 0, (value / max) * 100)}%`,
              }}
            />
          </div>
          <span className="text-right tabular-nums">{value}</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const weekdays = t("weekdays").split(",")
  const [token, setToken] = useState("")
  const analyticsResource = useAdminResource({
    loadResource: loadAnalyticsData,
    initialData: { overview: undefined, weekly: undefined },
    fallbackError: t("analyticsLoadError"),
  })
  const { overview, weekly } = analyticsResource.data
  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const date = new Date()
        date.setMonth(date.getMonth() - (11 - index))
        return t("month", { month: date.getMonth() + 1 })
      }),
    [t]
  )
  const reportLabels = { overview: t("overview"), weekly: t("weekly") }
  return (
    <main>
      <AdminPageHeader
        title={t("analyticsTitle")}
        description={t("analyticsDescription")}
        actions={
          <Button
            variant="outline"
            onClick={() => void analyticsResource.reload()}
            disabled={analyticsResource.loading}
          >
            <RefreshCw />
            {common("refresh")}
          </Button>
        }
      />
      {analyticsResource.error ? (
        <p className="mt-5 border-y py-3 text-sm text-destructive">
          {analyticsResource.error}
        </p>
      ) : null}
      {!overview || !weekly ? (
        <p className="py-12 text-sm text-muted-foreground">
          {t("analyticsLoading")}
        </p>
      ) : (
        <div className="divide-y">
          <section className="py-7">
            <h2 className="text-lg font-semibold">{t("todayOverview")}</h2>
            <dl className="mt-5 grid grid-cols-2 gap-px bg-border sm:grid-cols-5">
              {[
                [t("pageRequests"), overview.today.requests],
                [t("validReservations"), overview.today.reservations],
                [t("newReservations"), overview.today.reservationCreations],
                [t("approve"), overview.today.approvals],
                [t("reject"), overview.today.rejections],
              ].map(([label, value]) => (
                <div className="bg-background p-4" key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-2 text-3xl font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="grid gap-8 py-7 lg:grid-cols-2">
            <div>
              <h2 className="mb-5 text-lg font-semibold">
                {t("lastSevenDays")}
              </h2>
              <Bars
                values={overview.weekly.reservationCreations}
                labels={weekdays}
              />
            </div>
            <div>
              <h2 className="mb-5 text-lg font-semibold">
                {t("lastTwelveMonths")}
              </h2>
              <Bars
                values={overview.monthly.reservations}
                labels={monthLabels}
              />
            </div>
          </section>
          <section className="grid gap-8 py-7 lg:grid-cols-2">
            <div>
              <h2 className="mb-5 text-lg font-semibold">
                {t("lastWeekRooms")}
              </h2>
              <div className="divide-y border-t">
                {weekly.rooms.map((room) => (
                  <div
                    key={room.roomName}
                    className="grid grid-cols-[1fr_auto_auto] gap-5 py-3 text-sm"
                  >
                    <span>{room.roomName}</span>
                    <span className="text-muted-foreground">
                      {t("roomCreated", { count: room.reservationCreations })}
                    </span>
                    <span>{t("roomUsed", { count: room.reservations })}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-5 text-lg font-semibold">
                {t("commonReasons")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {weekly.reasons.slice(0, 30).map((reason) => (
                  <span className="border px-2 py-1 text-xs" key={reason.word}>
                    {reason.word} <b>{reason.count}</b>
                  </span>
                ))}
              </div>
            </div>
          </section>
          <section className="py-7">
            <h2 className="text-lg font-semibold">{t("exportReports")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("exportDescription")}
            </p>
            <div className="mt-4">
              <Turnstile onToken={setToken} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["overview", "weekly"] as const).flatMap((report) =>
                (["pdf", "png"] as const).map((type) => (
                  <Button
                    key={`${report}-${type}`}
                    variant="outline"
                    disabled={!token}
                    asChild={Boolean(token)}
                  >
                    {token ? (
                      <a href={analyticsExportUrl(report, type, token)}>
                        <Download />
                        {reportLabels[report]} {type.toUpperCase()}
                      </a>
                    ) : (
                      <span>
                        <Download />
                        {reportLabels[report]} {type.toUpperCase()}
                      </span>
                    )}
                  </Button>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
