"use client"

import { createContext, useContext } from "react"

export type AppLocale = "zh-CN" | "en-US"

export const defaultLocale: AppLocale = "zh-CN"

type LocaleContextValue = {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
}

const LocaleContext = createContext<LocaleContextValue>(null!)

export const useAppLocale = () => useContext(LocaleContext)

export { LocaleContext }
export type { LocaleContextValue }
