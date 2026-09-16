"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "next-themes"

import { Toaster } from "@/components/astryx"
import enMessages from "@/messages/en-US.json"
import zhMessages from "@/messages/zh-CN.json"

type AppLocale = "zh-CN" | "en-US"

const defaultLocale: AppLocale = "zh-CN"
const LocaleContext = createContext<{
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
}>(null!)
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
  return localStorage.getItem("locale") === "en-US" || cookieLocale === "en-US"
    ? "en-US"
    : "zh-CN"
}

export const useAppLocale = () => useContext(LocaleContext)

export function Providers({ children }: { children: React.ReactNode }) {
  const savedLocale = useSyncExternalStore(
    subscribe,
    storedLocale,
    () => defaultLocale
  )
  const [selectedLocale, setSelectedLocale] = useState<AppLocale>()
  const locale = selectedLocale ?? savedLocale

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  function setLocale(nextLocale: AppLocale) {
    localStorage.setItem("locale", nextLocale)
    document.cookie = `locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`
    setSelectedLocale(nextLocale)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages[locale]}
        timeZone="Asia/Hong_Kong"
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  )
}
