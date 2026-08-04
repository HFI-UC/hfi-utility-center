"use client"

import { useEffect, useSyncExternalStore } from "react"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "next-themes"

import { isAppLocale, type AppLocale } from "@/i18n/config"

type LocaleMessages = Record<AppLocale, Record<string, unknown>>

function subscribeToLocale(onLocaleChange: () => void) {
  window.addEventListener("hfiuc-locale-change", onLocaleChange)
  return () => window.removeEventListener("hfiuc-locale-change", onLocaleChange)
}

function storedLocale(): AppLocale {
  const saved = window.localStorage.getItem("hfiuc-locale")
  if (saved && isAppLocale(saved)) return saved
  return document.documentElement.lang === "en-US" ? "en-US" : "zh-CN"
}

export function Providers({
  initialLocale,
  messages,
  children,
}: {
  initialLocale: AppLocale
  messages: LocaleMessages
  children: React.ReactNode
}) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    storedLocale,
    () => initialLocale
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages[locale]}
      timeZone="Asia/Hong_Kong"
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
