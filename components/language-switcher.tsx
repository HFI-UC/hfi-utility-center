"use client"

import { Languages } from "lucide-react"
import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const next = locale === "zh-CN" ? "en-US" : "zh-CN"
  return <Button variant="ghost" size="sm" onClick={() => {
    document.cookie = `hfiuc-locale=${next};path=/;max-age=31536000;samesite=lax`
    router.refresh()
  }} title={locale === "zh-CN" ? "Switch to English" : "切换到中文"}><Languages />{locale === "zh-CN" ? "EN" : "中文"}</Button>
}
