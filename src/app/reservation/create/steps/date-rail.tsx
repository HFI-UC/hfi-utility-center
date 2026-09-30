"use client"

import { enUS, zhCN } from "date-fns/locale"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { dateToInputValue, inputValueToDate } from "@/lib/date-time"

const DAY_MS = 86_400_000

/** Days per page. Paging keeps the whole rail on screen: no scrollbar, no hidden dates. */
const PAGE = 7

/**
 * The booking window as a week at a time, flanked by paging arrows. A
 * horizontal scroll rail hid most of its dates behind a scrollbar and asked
 * for a swipe to reveal them; a page the user drives shows every offered date
 * at once, and the calendar stays the shortcut to any date in the window.
 */
export function DateRail({
  date,
  today,
  maximumDate,
  open,
  onOpenChange,
  onSelect,
  triggerRef,
}: {
  date: string
  today: Date
  maximumDate: Date
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (date: Date) => void
  triggerRef?: (element: HTMLButtonElement | null) => void
}) {
  const locale = useLocale()
  const t = useTranslations("booking")

  const selected = inputValueToDate(date)
  const selectedOffset = selected ? Math.round((selected.getTime() - today.getTime()) / DAY_MS) : -1
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" })
  const shortDate = new Intl.DateTimeFormat(locale, { month: "numeric", day: "numeric" })

  const totalDays = Math.round((maximumDate.getTime() - today.getTime()) / DAY_MS) + 1
  const lastPage = Math.max(0, totalDays - PAGE)
  // The page the user is looking at. Browsing sticks, because the choice is
  // remembered against the selection it was made from; a new selection (the
  // calendar, or a restored booking) no longer matches, so the page holding
  // that date comes back into view.
  const [browsed, setBrowsed] = useState<{ from: number; start: number } | null>(null)
  const selectionPage =
    selectedOffset < 0 ? 0 : Math.min(lastPage, Math.floor(selectedOffset / PAGE) * PAGE)
  const pageStart = browsed?.from === selectedOffset ? browsed.start : selectionPage

  function browseTo(next: number) {
    setBrowsed({ from: selectedOffset, start: Math.min(lastPage, Math.max(0, next)) })
  }

  const days = Array.from({ length: Math.min(PAGE, totalDays - pageStart) }, (_, index) => {
    const day = new Date(today)
    day.setDate(day.getDate() + pageStart + index)
    return day
  })

  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0"
        aria-label={t("previousPage")}
        disabled={pageStart === 0}
        onClick={() => browseTo(pageStart - PAGE)}
      >
        <ChevronLeft aria-hidden />
      </Button>
      <div className="flex min-w-0 flex-1 gap-1.5">
        {days.map((day, index) => {
          const value = dateToInputValue(day)
          const current = value === date
          const offset = pageStart + index
          const label =
            offset === 0 ? t("today") : offset === 1 ? t("tomorrow") : weekday.format(day)
          return (
            <Button
              key={value}
              type="button"
              variant={current ? "default" : "outline"}
              aria-pressed={current}
              aria-current={current ? "date" : undefined}
              onClick={() => onSelect(day)}
              className="h-11 min-w-0 flex-1 flex-col"
            >
              <span className="text-[11px] leading-none opacity-75">{label}</span>
              <span className="text-sm leading-none font-medium tabular-nums">
                {shortDate.format(day)}
              </span>
            </Button>
          )
        })}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0"
        aria-label={t("nextPage")}
        disabled={pageStart >= lastPage}
        onClick={() => browseTo(pageStart + PAGE)}
      >
        <ChevronRight aria-hidden />
      </Button>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0"
            aria-label={t("otherDate")}
          >
            <CalendarDays aria-hidden className="size-4" />
          </Button>
        </PopoverTrigger>
        {/* oxlint-disable-next-line shadcn/no-restyle -- calendar popover padding */}
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected ?? today}
            locale={locale === "zh-CN" ? zhCN : enUS}
            disabled={{ before: today, after: maximumDate }}
            endMonth={maximumDate}
            onSelect={(next) => next && onSelect(next)}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
