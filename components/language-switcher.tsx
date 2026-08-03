"use client"

import { Languages } from "lucide-react"
import { useLocale } from "next-intl"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useTranslations("nav")
  const nextLocale = locale === "zh-CN" ? "en-US" : "zh-CN"
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        window.localStorage.setItem("hfiuc-locale", nextLocale)
        window.dispatchEvent(
          new CustomEvent("hfiuc-locale-change", { detail: nextLocale })
        )
      }}
      title={t("switchLanguage")}
    >
      <Languages />
      <span className="hidden sm:inline">{t("languageShort")}</span>
    </Button>
  )
}
