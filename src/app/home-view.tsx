"use client"

import {
  ArrowUpRight,
  DoorOpen,
  LayoutDashboard,
  ListChecks,
  Maximize2,
  Megaphone,
} from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useEffect, useState } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { MarkdownContent } from "@/components/markdown-content"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getCurrentAnnouncement } from "@/lib/api/announcements"
import type { Announcement } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const SECONDARY = [
  { href: "/reservation/search", labelKey: "searchTitle", hintKey: "searchHint", icon: ListChecks },
  {
    href: "/dashboard",
    labelKey: "dashboardTitle",
    hintKey: "dashboardHint",
    icon: LayoutDashboard,
  },
] as const

const FACTS = [
  { labelKey: "slot", valueKey: "slotDescription" },
  { labelKey: "days", valueKey: "daysDescription" },
  { labelKey: "duration", valueKey: "durationDescription" },
  { labelKey: "validation", valueKey: "validationDescription" },
] as const

export function HomeView() {
  const t = useTranslations("home")
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [announcementOpen, setAnnouncementOpen] = useState(false)

  useEffect(() => {
    let active = true
    getCurrentAnnouncement()
      .then((value) => {
        if (active) setAnnouncement(value?.enabled && value.content?.trim() ? value : null)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  return (
    <AppShell>
      {announcement ? (
        <Alert className="t-route-enter flex items-start gap-3 px-4 py-4">
          <Megaphone aria-hidden className="mt-1 size-4 shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <AlertTitle className="break-words">
              {announcement.title || t("announcementFallbackTitle")}
            </AlertTitle>
            <AlertDescription className="min-w-0 break-words [&>div]:line-clamp-2">
              <MarkdownContent content={announcement.content} />
            </AlertDescription>
          </div>
          <TooltipProvider delayDuration={80}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t("announcementReadMore")}
                  onClick={() => setAnnouncementOpen(true)}
                  className="size-11 shrink-0"
                >
                  <Maximize2 aria-hidden />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("announcementReadMore")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Alert>
      ) : null}

      <section
        aria-labelledby="home-title"
        className={cn(
          "grid min-w-0 gap-x-16 gap-y-8 py-6 sm:py-10 lg:grid-cols-[1.15fr_1fr] lg:gap-y-10 lg:py-14",
          announcement && "mt-4",
        )}
      >
        <div className="min-w-0 self-end">
          <h1
            id="home-title"
            className="t-stagger text-[clamp(2.75rem,6vw,5.25rem)] leading-[1.12] font-semibold tracking-tight"
          >
            <span className="block">{t("headlineFirst")}</span>
            <span className="block">{t("headlineSecond")}</span>
          </h1>
          <p
            className="t-stagger mt-6 max-w-sm text-base leading-relaxed text-muted-foreground sm:text-lg"
            data-stagger="1"
          >
            {t("intro")}
          </p>
        </div>

        <div className="min-w-0 self-center px-1 lg:row-span-2 lg:px-3">
          <Link
            href="/reservation/create"
            prefetch={false}
            aria-labelledby="book-action"
            aria-describedby="book-hint"
            className="t-lift t-arrow-host relative block overflow-hidden rounded-2xl bg-primary text-primary-foreground outline-none hover:bg-primary/95 focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background lg:-rotate-3"
          >
            <div className="flex items-start justify-between gap-6 px-7 pt-7 sm:px-9 sm:pt-9">
              <span className="text-sm font-medium">{t("ticketLabel")}</span>
              <DoorOpen aria-hidden className="size-12 shrink-0 sm:size-16" strokeWidth={1.25} />
            </div>
            <div className="px-7 pt-5 pb-8 sm:px-9 sm:pt-8 sm:pb-10">
              <p className="text-4xl leading-tight font-medium tracking-tight whitespace-pre-line sm:text-5xl">
                {t("ticketTitle")}
              </p>
              <p
                id="book-hint"
                className="mt-4 max-w-64 text-sm leading-relaxed text-primary-foreground/85"
              >
                {t("bookHint")}
              </p>
            </div>
            <div className="relative mx-7 border-t border-dashed border-primary-foreground/40 sm:mx-9">
              <span
                aria-hidden
                className="absolute -top-3 -left-10 size-6 rounded-full bg-background sm:-left-12"
              />
              <span
                aria-hidden
                className="absolute -top-3 -right-10 size-6 rounded-full bg-background sm:-right-12"
              />
            </div>
            <div className="flex items-center justify-between gap-4 px-7 py-6 sm:px-9">
              <span id="book-action" className="text-lg font-medium">
                {t("bookAction")}
              </span>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-primary">
                <ArrowUpRight aria-hidden className="t-arrow size-5" />
              </span>
            </div>
          </Link>
        </div>

        <div className="grid min-w-0 gap-1 self-start lg:col-start-1 lg:row-start-2">
          {SECONDARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="t-lift t-arrow-host flex min-w-0 items-center gap-4 rounded-lg py-4 pr-3 pl-2 outline-none hover:bg-accent/60 focus-visible:ring-3 focus-visible:ring-ring"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-primary">
                <item.icon aria-hidden className="size-4" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-base font-medium break-words">{t(item.labelKey)}</span>
                <span className="text-sm text-muted-foreground">{t(item.hintKey)}</span>
              </span>
              <ArrowUpRight aria-hidden className="t-arrow size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="booking-rules-title"
        className="mt-4 grid min-w-0 gap-6 border-t pt-7 pb-4 lg:grid-cols-[10rem_1fr] lg:gap-8 lg:pt-8"
      >
        <h2 id="booking-rules-title" className="text-base font-medium lg:self-center">
          {t("factsTitle")}
        </h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4">
          {FACTS.map((fact, index) => (
            <div
              key={fact.labelKey}
              className="t-stagger flex min-w-0 flex-col gap-2"
              data-stagger={String(Math.min(index, 3))}
            >
              <dt className="text-sm text-muted-foreground">{t(fact.labelKey)}</dt>
              <dd className="text-base font-medium tracking-tight break-words sm:text-lg">
                {t(fact.valueKey)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="break-words">
              {announcement?.title || t("announcementFallbackTitle")}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {t("announcementDescription")}
            </DialogDescription>
          </DialogHeader>
          <MarkdownContent content={announcement?.content || ""} />
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
