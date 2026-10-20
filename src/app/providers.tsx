"use client"

import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "next-themes"
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react"

import { defaultLocale, LocaleContext, type AppLocale } from "@/lib/locale"
import enMessages from "@/messages/en-US.json"
import zhMessages from "@/messages/zh-CN.json"

const subscribe = () => () => {}

const messages = {
  "zh-CN": zhMessages,
  "en-US": enMessages,
}

function storedLocale(): AppLocale {
  const cookieLocale = document.cookie
    .split("; ")
    .find((item) => item.startsWith("locale="))
    ?.split("=")[1]
  return localStorage.getItem("locale") === "en-US" || cookieLocale === "en-US" ? "en-US" : "zh-CN"
}

export function Providers({ children }: { children: React.ReactNode }) {
  const savedLocale = useSyncExternalStore(subscribe, storedLocale, () => defaultLocale)
  const [selectedLocale, setSelectedLocale] = useState<AppLocale>()
  const locale = selectedLocale ?? savedLocale

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((nextLocale: AppLocale) => {
    localStorage.setItem("locale", nextLocale)
    document.cookie = `locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`
    setSelectedLocale(nextLocale)
  }, [])
  const localeContext = useMemo(() => ({ locale, setLocale }), [locale, setLocale])

  return (
    <LocaleContext.Provider value={localeContext}>
      <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="Asia/Hong_Kong">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}
