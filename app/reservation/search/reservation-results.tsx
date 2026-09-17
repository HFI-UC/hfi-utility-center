"use client"

import {
  Clock3,
  FileText,
  GraduationCap,
  MapPin,
  Monitor,
  Search,
  UserRound,
} from "lucide-react"
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
  const t = useTranslations("neo.reservations")
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
              <header className="booking-list-card__header">
                <div className="booking-list-card__room">
                  <span className="booking-list-card__room-icon">
                    <MapPin size={18} />
                  </span>
                  <div>
                    <span>{t("location")}</span>
                    <strong>{reservation.roomName || t("roomFallback")}</strong>
                  </div>
                </div>
                <StatusBadge tone={statusTone[reservation.status]}>
                  {statusT(reservation.status)}
                </StatusBadge>
              </header>

              <div className="booking-list-card__reason">
                <span>
                  <FileText size={16} /> {t("reason")}
                </span>
                <p>{reservation.reason || t("reasonFallback")}</p>
              </div>

              <footer className="booking-list-card__footer">
                <div className="booking-list-card__meta">
                  <span>
                    <UserRound size={14} /> {reservation.studentName}
                  </span>
                  <span>
                    <GraduationCap size={14} />
                    {reservation.className || "HFI"}
                  </span>
                  {reservation.purposeType ? (
                    <span>
                      {
                        {
                          personal: t("purposePersonal"),
                          class: t("purposeClass"),
                          club: t("purposeClub"),
                        }[reservation.purposeType]
                      }
                    </span>
                  ) : null}
                  {reservation.needsMultimedia ? (
                    <span>
                      <Monitor size={14} /> {t("multimedia")}
                    </span>
                  ) : null}
                </div>
                <span className="booking-time">
                  <Clock3 size={15} />
                  {sort === "sequence"
                    ? `${dateFormatter.format(new Date(reservation.startTime))} · `
                    : null}
                  {timeFormatter.format(new Date(reservation.startTime))} –{" "}
                  {timeFormatter.format(new Date(reservation.endTime))}
                </span>
              </footer>
            </article>
          ))}
        </section>
      ))}
    </div>
  )
}
