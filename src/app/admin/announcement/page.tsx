"use client"

import { Eye, Megaphone, Save } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useMemo, useState } from "react"

import { LoadingState } from "@/components/layout/data-state"
import { PageHeader } from "@/components/layout/page-header"
import { SectionCard } from "@/components/layout/section-card"
import { StatusBadge } from "@/components/layout/status-badge"
import { MarkdownContent } from "@/components/markdown-content"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useAdminMutation, useAdminResource } from "@/lib/api/admin-hooks"
import { getAdminAnnouncement, updateAnnouncement } from "@/lib/api/announcements"
import type { Announcement } from "@/lib/api/types"
import { formatApiTimestamp } from "@/lib/date-time"

const emptyAnnouncement: Announcement = {
  title: "",
  content: "",
  enabled: false,
  updatedAt: null,
}

const TITLE_LIMIT = 120
const CONTENT_LIMIT = 4000

export default function AdminAnnouncementPage() {
  const t = useTranslations("admin")
  const resource = useAdminResource({
    loadResource: getAdminAnnouncement,
    initialData: emptyAnnouncement as Announcement | null,
  })
  const announcement = resource.data ?? emptyAnnouncement
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <PageHeader title={t("announcementTitle")} />
      {resource.loading ? (
        <SectionCard title={t("announcementEditor")}>
          <LoadingState label={t("announcementLoading")} />
        </SectionCard>
      ) : (
        <AnnouncementForm
          key={announcement.updatedAt || "empty"}
          announcement={announcement}
          reload={resource.reload}
        />
      )}
    </div>
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
  const layout = useTranslations("layout")
  const locale = useLocale()
  const { mutate, working } = useAdminMutation({ reload })
  const [title, setTitle] = useState(() => announcement.title)
  const [content, setContent] = useState(() => announcement.content)
  const [enabled, setEnabled] = useState(() => announcement.enabled)
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  )
  const updatedAt = formatApiTimestamp(
    dateFormatter,
    announcement.updatedAt,
    t("announcementNeverUpdated"),
  )

  async function save(event: React.FormEvent) {
    event.preventDefault()
    await mutate(
      () => updateAnnouncement(title.trim(), content.trim(), enabled),
      t("announcementSaved"),
    )
  }

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[1.15fr_1fr]">
      <SectionCard title={t("announcementEditor")}>
        <form className="flex min-w-0 flex-col gap-5" onSubmit={save}>
          <Field orientation="horizontal">
            <Megaphone aria-hidden className="size-4 shrink-0 text-muted-foreground" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <FieldLabel htmlFor="announcement-enabled" className="w-full">
                {t("announcementPublishStatus")}
              </FieldLabel>
              <FieldDescription>
                {enabled
                  ? t("announcementPublishedDescription")
                  : t("announcementDraftDescription")}
              </FieldDescription>
            </div>
            <Switch
              id="announcement-enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
              className="self-start"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="announcement-title">{t("announcementHeading")}</FieldLabel>
            <Input
              id="announcement-title"
              value={title}
              maxLength={TITLE_LIMIT}
              placeholder={t("announcementHeadingPlaceholder")}
              onChange={(event) => setTitle(event.target.value)}
            />
            <p className="text-xs text-muted-foreground tabular-nums">
              {title.length}/{TITLE_LIMIT}
            </p>
          </Field>

          <Field>
            <FieldLabel htmlFor="announcement-content">{t("announcementContent")}</FieldLabel>
            <Textarea
              id="announcement-content"
              value={content}
              maxLength={CONTENT_LIMIT}
              placeholder={t("announcementContentPlaceholder")}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-48"
            />
            <FieldDescription>{t("announcementMarkdownHint")}</FieldDescription>
            <p className="text-xs text-muted-foreground tabular-nums">
              {content.length}/{CONTENT_LIMIT}
            </p>
          </Field>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="submit"
              className="h-10 sm:h-8"
              disabled={working || (enabled && !content.trim())}
            >
              {working ? <Spinner /> : <Save />}
              {t("saveAnnouncement")}
            </Button>
            <span className="text-xs text-muted-foreground">
              {t("announcementLastUpdated")}: {updatedAt}
            </span>
          </div>
        </form>
      </SectionCard>

      <section className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center gap-2">
          <Eye aria-hidden className="size-4 shrink-0 text-muted-foreground" />
          <h2 className="text-sm font-medium">{t("announcementPreview")}</h2>
          <StatusBadge tone={enabled ? "approved" : "neutral"} className="ml-auto">
            {enabled ? t("announcementPublished") : t("announcementDraft")}
          </StatusBadge>
        </div>
        <article className="flex min-w-0 flex-col gap-3">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {layout("brand")}
          </span>
          <h3 className="text-lg font-semibold break-words">
            {title.trim() || t("announcementPreviewFallbackTitle")}
          </h3>
          <MarkdownContent
            content={content.trim() || t("announcementPreviewFallbackContent")}
            className="min-w-0 break-words"
          />
        </article>
      </section>
    </div>
  )
}
