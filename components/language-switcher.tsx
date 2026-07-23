"use client"

import { Languages } from "lucide-react"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

const alternateLocale: Record<string, "zh-CN" | "en-US"> = {
  "zh-CN": "en-US",
  "en-US": "zh-CN",
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useTranslations("nav")
  const next = alternateLocale[locale] ?? "zh-CN"
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        window.localStorage.setItem("hfiuc-locale", next)
        window.dispatchEvent(
          new CustomEvent("hfiuc-locale-change", { detail: next })
        )
      }}
      title={t("switchLanguage")}
    >
      <Languages />
      <span className="hidden sm:inline">{t("languageShort")}</span>
    </Button>
  )
}
