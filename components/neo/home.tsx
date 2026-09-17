"use client"

import {
  BarChart3,
  CalendarDays,
  Clock3,
  DoorOpen,
  MapPin,
  Megaphone,
  UserRound,
  X,
} from "lucide-react"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"

import { MarkdownContent } from "@/components/markdown-content"
import { getCatalog } from "@/lib/api/catalog"
import { getCurrentAnnouncement } from "@/lib/api/announcements"
import { getReservations } from "@/lib/api/reservations"
import type { Announcement, Reservation } from "@/lib/api/types"

import {
  ActionButton,
  NeoFooter,
  NeoHeader,
  StatusBadge,
  type Tone,
} from "./shared"

type HomeStat = {
  label: string
  value: number
  status: string
  tone: Tone
  icon: "campus" | "door" | "chart"
}

function reservationTone(status: Reservation["status"]): Tone {
  if (status === "approved") return "success"
  if (status === "pending") return "warning"
  if (status === "rejected") return "danger"
  return "info"
}

function StatCard({ stat }: { stat: HomeStat }) {
  const Icon =
    stat.icon === "campus"
      ? MapPin
      : stat.icon === "door"
        ? DoorOpen
        : BarChart3
  return (
    <div className="home-stat-card">
      <div className="home-stat-card__head">
        <span>{stat.label}</span>
        <span
          className={`home-stat-card__icon home-stat-card__icon--${stat.tone}`}
        >
          <Icon size={17} strokeWidth={2.2} />
        </span>
      </div>
      <div className="home-stat-card__value-row">
        <strong>{stat.value}</strong>
        <StatusBadge tone={stat.tone}>{stat.status}</StatusBadge>
      </div>
    </div>
  )
}

export function NeoHome() {
  const t = useTranslations("neo.home")
  const locale = useLocale()
  const [rooms, setRooms] = useState(0)
  const [campuses, setCampuses] = useState(0)
  const [reservationTotal, setReservationTotal] = useState(0)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [announcementOpen, setAnnouncementOpen] = useState(false)

  useEffect(() => {
    Promise.all([getCatalog(), getReservations({ page: 0 })])
      .then(([catalog, page]) => {
        setCampuses(
          catalog.campuses.filter((campus) => !campus.isPrivileged).length
        )
        setRooms(catalog.rooms.filter((room) => room.enabled).length)
        setReservationTotal(page.total)
        setReservations(page.reservations.slice(0, 3))
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem("hfiuc-announcement-dismissed") === "true") {
      return
    }
    getCurrentAnnouncement()
      .then((value) => {
        if (!value) return
        setAnnouncement(value)
        setAnnouncementOpen(true)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!announcementOpen) return
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAnnouncementOpen(false)
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [announcementOpen])

  const stats = useMemo<HomeStat[]>(
    () => [
      {
        label: t("openCampuses"),
        value: campuses,
        status: t("connected"),
        tone: "success",
        icon: "campus",
      },
      {
        label: t("bookableRooms"),
        value: rooms,
        status: t("open"),
        tone: "warning",
        icon: "door",
      },
      {
        label: t("reservationTotal"),
        value: reservationTotal,
        status: t("cumulative"),
        tone: "info",
        icon: "chart",
      },
    ],
    [campuses, reservationTotal, rooms, t]
  )
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
      }),
    [locale]
  )
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [locale]
  )

  return (
    <div className="home-page">
      <section className="home-hero">
        <Image
          src="https://api.hfiuc.org/assets/hfi-campus-hero-v2.webp"
          alt="HFI 校园"
          fill
          sizes="100vw"
          className="home-hero__image"
          priority
          unoptimized
        />
        <div className="home-hero__overlay" />
        <NeoHeader home />
        <div className="home-hero__content">
          <div className="home-hero__title-stack">
            <h1>HFI Utility Center</h1>
            <p>{t("subtitle")}</p>
          </div>
          <div className="home-hero__actions">
            <ActionButton size="lg" href="/reservation/create">
              {t("book")}
            </ActionButton>
            <ActionButton
              size="lg"
              variant="secondary"
              className="hero-outline-button"
              href="/reservation/search"
            >
              {t("reservations")}
            </ActionButton>
          </div>
        </div>
      </section>
      <main className="home-main">
        <section className="stats-row" aria-label="今日概览">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </section>
        <section className="quick-access-section">
          <h2 className="section-title">{t("recent")}</h2>
          <div className="recent-booking-list">
            {reservations.map((item) => (
              <div className="recent-booking-row" key={item.id}>
                <div className="recent-booking-row__head">
                  <span className="recent-booking-row__room-icon">
                    <DoorOpen size={18} />
                  </span>
                  <div>
                    <strong>{item.roomName || t("roomFallback")}</strong>
                    <span>Reservation #{item.id}</span>
                  </div>
                  <StatusBadge tone={reservationTone(item.status)}>
                    {t(item.status)}
                  </StatusBadge>
                </div>
                <div className="recent-booking-row__schedule">
                  <span>
                    <CalendarDays size={15} />
                    {dateFormatter.format(new Date(item.startTime))}
                  </span>
                  <span>
                    <Clock3 size={15} />
                    {timeFormatter.format(new Date(item.startTime))}–
                    {timeFormatter.format(new Date(item.endTime))}
                  </span>
                </div>
                <div className="recent-booking-row__reason">
                  <span>{t("reason")}</span>
                  <p>{item.reason || t("reasonFallback")}</p>
                </div>
                <div className="recent-booking-row__person">
                  <UserRound size={15} />
                  <span>
                    {item.studentName} · {item.className || t("classFallback")}
                  </span>
                </div>
              </div>
            ))}
            {!reservations.length && (
              <div className="recent-booking-row">
                <div className="recent-booking-row__copy">
                  <i aria-hidden="true" />
                  <div>
                    <strong>{t("empty")}</strong>
                    <span>{t("emptyDescription")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <NeoFooter />
      {announcement && announcementOpen ? (
        <div
          className="announcement-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAnnouncementOpen(false)
          }}
        >
          <section
            className="announcement-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-title"
          >
            <button
              type="button"
              className="announcement-dialog__close"
              aria-label={t("announcementClose")}
              onClick={() => setAnnouncementOpen(false)}
            >
              <X />
            </button>
            <span className="announcement-dialog__icon">
              <Megaphone />
            </span>
            <h2 id="announcement-title">
              {announcement.title || t("announcementFallbackTitle")}
            </h2>
            <MarkdownContent
              content={announcement.content}
              className="announcement-dialog__content"
            />
            <ActionButton
              onClick={() => {
                sessionStorage.setItem("hfiuc-announcement-dismissed", "true")
                setAnnouncementOpen(false)
              }}
            >
              {t("announcementConfirm")}
            </ActionButton>
          </section>
        </div>
      ) : null}
    </div>
  )
}
