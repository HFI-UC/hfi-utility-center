import { headers } from "next/headers"
import { getRequestConfig } from "next-intl/server"

import type { AppLocale } from "@/i18n/config"

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
