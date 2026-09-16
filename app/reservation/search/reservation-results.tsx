"use client"

import { CheckCircle2, Clock3, Search } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { StatusBadge, Surface, type Tone } from "@/components/neo/shared"
import type { Reservation, ReservationStatus } from "@/lib/api/types"

const statusTone: Record<ReservationStatus, Tone> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  cancelled: "info",
}

export function ReservationResults({
  reservations,
  sort,
}: {
  reservations: Reservation[]
  sort: "time" | "sequence"
}) {
  const locale = useLocale()
  const statusT = useTranslations("status")
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  })
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const grouped = reservations.reduce<Record<string, Reservation[]>>(
    (groups, reservation) => {
      const label =
        sort === "sequence"
          ? ""
          : dateFormatter.format(new Date(reservation.startTime))
      groups[label] = [...(groups[label] ?? []), reservation]
      return groups
    },
    {}
  )

  if (!reservations.length) {
    return (
      <Surface className="empty-state">
        <Search size={22} />
        <strong>没有匹配的预约</strong>
        <span>试试其他筛选条件或搜索词</span>
      </Surface>
    )
  }

  return (
    <div className="booking-groups">
      {Object.entries(grouped).map(([label, items]) => (
        <section className="booking-day-group" key={label}>
          {label ? <h2>{label}</h2> : null}
          {items.map((reservation) => (
            <article
              className={`booking-list-card booking-list-card--${reservation.status}`}
              key={reservation.id}
            >
              <div className="booking-list-card__main">
                <div className="booking-list-card__title-row">
                  <strong>{reservation.roomName || "教室"}</strong>
                  <span
                    className="booking-course-tag"
                    title={reservation.reason}
                  >
                    {reservation.reason}
                  </span>
                </div>
                <div className="booking-list-card__meta">
                  <span>
                    <CheckCircle2 size={14} /> {reservation.studentName}
                  </span>
                  <span>· {reservation.className || "HFI"}</span>
                  {reservation.purposeType ? (
                    <span>
                      ·{" "}
                      {
                        { personal: "个人", class: "班级", club: "社团" }[
                          reservation.purposeType
                        ]
                      }
                    </span>
                  ) : null}
                  {reservation.needsMultimedia ? (
                    <span>· 多媒体设备</span>
                  ) : null}
                </div>
              </div>
              <div className="booking-list-card__right">
                <span className="booking-time">
                  <Clock3 size={15} />{" "}
                  {sort === "sequence"
                    ? `${dateFormatter.format(new Date(reservation.startTime))} · `
                    : null}
                  {timeFormatter.format(new Date(reservation.startTime))} -{" "}
                  {timeFormatter.format(new Date(reservation.endTime))}
                </span>
                <StatusBadge tone={statusTone[reservation.status]}>
                  {statusT(reservation.status)}
                </StatusBadge>
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  )
}
