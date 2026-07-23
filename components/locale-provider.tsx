"use client"

import { useEffect, useSyncExternalStore } from "react"
import { NextIntlClientProvider } from "next-intl"

import type { AppLocale } from "@/i18n/request"

type LocaleMessages = Record<AppLocale, Record<string, unknown>>

function subscribe(onStoreChange: () => void) {
  window.addEventListener("hfiuc-locale-change", onStoreChange)
  return () => window.removeEventListener("hfiuc-locale-change", onStoreChange)
}

function getStoredLocale(): AppLocale {
  const saved = window.localStorage.getItem("hfiuc-locale")
  if (saved === "zh-CN" || saved === "en-US") return saved
  return document.documentElement.lang === "en-US" ? "en-US" : "zh-CN"
}

export function LocaleProvider({
  initialLocale,
  messages,
  children,
}: {
  initialLocale: AppLocale
  messages: LocaleMessages
  children: React.ReactNode
}) {
  const locale = useSyncExternalStore(
    subscribe,
    getStoredLocale,
    () => initialLocale
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  )
}
