import { cookies, headers } from "next/headers"
import { getRequestConfig } from "next-intl/server"

export const locales = ["zh-CN", "en-US"] as const
export type AppLocale = (typeof locales)[number]

export default getRequestConfig(async () => {
  const cookieLocale = (await cookies()).get("hfiuc-locale")?.value
  const accepted = (await headers()).get("accept-language") ?? ""
  const locale: AppLocale = locales.includes(cookieLocale as AppLocale)
    ? (cookieLocale as AppLocale)
    : accepted.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US"
  return { locale, messages: (await import(`../messages/${locale}.json`)).default }
})
