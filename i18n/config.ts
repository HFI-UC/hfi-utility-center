export const locales = ["zh-CN", "en-US"] as const
export type AppLocale = (typeof locales)[number]
export const defaultLocale: AppLocale = "zh-CN"

export function isAppLocale(value: string): value is AppLocale {
  return value === "zh-CN" || value === "en-US"
}
