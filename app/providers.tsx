"use client"

import { useEffect, useSyncExternalStore } from "react"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "next-themes"

import enMessages from "@/messages/en-US.json"
import zhMessages from "@/messages/zh-CN.json"

type AppLocale = "zh-CN" | "en-US"
type LocaleMessages = Record<AppLocale, Record<string, unknown>>
const defaultLocale: AppLocale = "zh-CN"

const messages = {
  "zh-CN": zhMessages,
  "en-US": enMessages,
} satisfies LocaleMessages

function subscribeToLocale(onLocaleChange: () => void) {
  window.addEventListener("hfiuc-locale-change", onLocaleChange)
  return () => window.removeEventListener("hfiuc-locale-change", onLocaleChange)
}

function storedLocale(): AppLocale {
  const saved = window.localStorage.getItem("hfiuc-locale")
  if (saved === "zh-CN" || saved === "en-US") return saved
  return window.navigator.language.toLowerCase().startsWith("zh")
    ? "zh-CN"
    : "en-US"
}

export function Providers({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    storedLocale,
    () => defaultLocale
  )

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
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
