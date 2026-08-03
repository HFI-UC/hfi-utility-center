export const locales = ["zh-CN", "en-US"] as const
export type AppLocale = (typeof locales)[number]

export function isAppLocale(value: string): value is AppLocale {
  return value === "zh-CN" || value === "en-US"
}

export function appLocale(value: string, fallback: AppLocale = "zh-CN") {
  return isAppLocale(value) ? value : fallback
}
