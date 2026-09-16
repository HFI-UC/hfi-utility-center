"use client"

import { Eye, Megaphone, Save } from "lucide-react"
import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"

import { AdminPageHeader, AdminSection } from "@/app/admin/admin-shell"
import { Button, Input, Spinner, Textarea } from "@/components/astryx"
import { MarkdownContent } from "@/components/markdown-content"
import { useAdminMutation, useAdminResource } from "@/lib/api/admin-hooks"
import {
  getAdminAnnouncement,
  updateAnnouncement,
} from "@/lib/api/announcements"
import type { Announcement } from "@/lib/api/types"

const emptyAnnouncement: Announcement = {
  title: "",
  content: "",
  enabled: false,
  updatedAt: null,
}

export default function AdminAnnouncementPage() {
  const t = useTranslations("admin")
  const resource = useAdminResource({
    loadResource: getAdminAnnouncement,
    initialData: emptyAnnouncement,
  })
  return (
    <main className="admin-page space-y-6">
      <AdminPageHeader
        title={t("announcementTitle")}
        description={t("announcementDescription")}
      />
      {resource.loading ? (
        <AdminSection title={t("announcementEditor")}>
          <div className="admin-dashboard-loading">
            <Spinner />
            {t("announcementLoading")}
          </div>
        </AdminSection>
      ) : (
        <AnnouncementForm
          key={resource.data.updatedAt || "empty"}
          announcement={resource.data}
          reload={resource.reload}
        />
      )}
    </main>
  )
}

function AnnouncementForm({
  announcement,
  reload,
}: {
  announcement: Announcement
  reload: () => Promise<void>
}) {
  const t = useTranslations("admin")
  const locale = useLocale()
  const { mutate, working } = useAdminMutation({ reload })
  const [title, setTitle] = useState(announcement.title)
  const [content, setContent] = useState(announcement.content)
  const [enabled, setEnabled] = useState(announcement.enabled)
  const updatedAt = announcement.updatedAt
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(announcement.updatedAt))
    : t("announcementNeverUpdated")

  async function save(event: React.FormEvent) {
    event.preventDefault()
    await mutate(
      () => updateAnnouncement(title.trim(), content.trim(), enabled),
      t("announcementSaved")
    )
  }

  return (
    <div className="admin-announcement-layout">
      <AdminSection
        title={t("announcementEditor")}
        className="admin-announcement-editor"
      >
        <form className="admin-announcement-form" onSubmit={save}>
          <div className="admin-announcement-publish-row">
            <span className="admin-announcement-publish-icon">
              <Megaphone />
            </span>
            <span className="admin-announcement-publish-copy">
              <strong>{t("announcementPublishStatus")}</strong>
              <small>
                {enabled
                  ? t("announcementPublishedDescription")
                  : t("announcementDraftDescription")}
              </small>
            </span>
            <label className="admin-announcement-switch">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
              />
              <span aria-hidden="true" />
              <em>
                {enabled ? t("announcementPublished") : t("announcementDraft")}
              </em>
            </label>
          </div>
          <label className="admin-announcement-field">
            <span>{t("announcementHeading")}</span>
            <Input
              value={title}
              maxLength={120}
              placeholder={t("announcementHeadingPlaceholder")}
              onChange={(event) => setTitle(event.target.value)}
            />
            <small>{title.length}/120</small>
          </label>
          <label className="admin-announcement-field">
            <span>{t("announcementContent")}</span>
            <Textarea
              value={content}
              maxLength={4000}
              placeholder={t("announcementContentPlaceholder")}
              onChange={(event) => setContent(event.target.value)}
            />
            <em>{t("announcementMarkdownHint")}</em>
            <small>{content.length}/4000</small>
          </label>
          <div className="admin-announcement-actions">
            <Button
              type="submit"
              icon={working ? <Spinner /> : <Save />}
              className="admin-action-button admin-announcement-save"
              disabled={working || (enabled && !content.trim())}
            >
              {t("saveAnnouncement")}
            </Button>
            <span>
              {t("announcementLastUpdated")}: {updatedAt}
            </span>
          </div>
        </form>
      </AdminSection>
      <section className="admin-announcement-preview-panel">
        <header>
          <span>
            <Eye />
            {t("announcementPreview")}
          </span>
          <i className={enabled ? "is-published" : ""}>
            {enabled ? t("announcementPublished") : t("announcementDraft")}
          </i>
        </header>
        <div className="admin-announcement-preview-stage">
          <article className="admin-announcement-preview-card">
            <span className="admin-announcement-preview-icon">
              <Megaphone />
            </span>
            <small>HFI UTILITY CENTER</small>
            <h2>{title.trim() || t("announcementPreviewFallbackTitle")}</h2>
            <MarkdownContent
              content={
                content.trim() || t("announcementPreviewFallbackContent")
              }
              className="admin-announcement-preview-content"
            />
            <span className="admin-announcement-preview-button">
              {t("announcementPreviewConfirm")}
            </span>
          </article>
        </div>
      </section>
    </div>
  )
}
