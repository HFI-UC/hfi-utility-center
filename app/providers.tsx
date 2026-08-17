"use client"

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
} from "react"
import { NextIntlClientProvider } from "next-intl"
import { ThemeProvider } from "next-themes"

import { Toaster } from "@/components/ui/sonner"
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
  return localStorage.getItem("locale") === "en-US" ? "en-US" : "zh-CN"
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

  function setLocale(nextLocale: AppLocale) {
    localStorage.setItem("locale", nextLocale)
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
