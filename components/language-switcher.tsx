"use client"

import { Languages } from "lucide-react"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const alternateLocale: Record<string, "zh-CN" | "en-US"> = {
  "zh-CN": "en-US",
  "en-US": "zh-CN",
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useTranslations("nav")
  const router = useRouter()
  const next = alternateLocale[locale] ?? "zh-CN"
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        document.cookie = `hfiuc-locale=${next};path=/;max-age=31536000;samesite=lax`
        router.refresh()
      }}
      title={t("switchLanguage")}
    >
      <Languages />
      {t("languageShort")}
    </Button>
  )
}
