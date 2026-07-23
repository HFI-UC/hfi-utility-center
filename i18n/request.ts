import { headers } from "next/headers"
import { getRequestConfig } from "next-intl/server"

export const locales = ["zh-CN", "en-US"] as const
export type AppLocale = (typeof locales)[number]

export default getRequestConfig(async () => {
  const accepted = (await headers()).get("accept-language") ?? ""
  const locale: AppLocale = accepted.toLowerCase().startsWith("zh")
    ? "zh-CN"
    : "en-US"
  return {
    locale,
    timeZone: "Asia/Hong_Kong",
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
