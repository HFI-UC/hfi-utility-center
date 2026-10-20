"use client"

import { useMemo } from "react"

import { formatApiTimestamp } from "@/lib/date-time"
import { useAppLocale } from "@/lib/locale"

export type Formatters = {
  time: (value: Date | string) => string
  headerDate: (value: Date) => string
}

export function useFacilityFormatters(): Formatters {
  const { locale } = useAppLocale()

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [locale],
  )
  const headerDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        day: "numeric",
        weekday: "long",
      }),
    [locale],
  )

  return useMemo(
    () => ({
      time: (value: Date | string) => formatApiTimestamp(timeFormatter, value),
      headerDate: (value: Date) => headerDateFormatter.format(value),
    }),
    [headerDateFormatter, timeFormatter],
  )
}
