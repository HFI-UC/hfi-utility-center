"use client"

import { Megaphone, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

import { MarkdownContent } from "@/components/markdown-content"
import { getCurrentAnnouncement } from "@/lib/api/announcements"
import type { Announcement } from "@/lib/api/types"

import { ActionButton, NeoFooter, NeoHeader } from "./shared"

export function NeoHome() {
  const t = useTranslations("neo.home")
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [announcementOpen, setAnnouncementOpen] = useState(false)

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

  return (
    <div className="home-page">
      <section className="home-hero">
        <NeoHeader home />
        <div className="home-hero__content">
          <div className="home-hero__title-stack">
            <h1>HFI Utility Center</h1>
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
