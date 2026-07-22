"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { getAIApprovalSetting, updateAIApprovalSetting, type AIApprovalStrength } from "@/lib/api/settings"

const values: AIApprovalStrength[] = ["relaxed", "standard", "strict"]

export function AIApprovalSetting() {
  const t = useTranslations("admin")
  const [value, setValue] = useState<AIApprovalStrength>("strict")
  const [saving, setSaving] = useState(false)
  useEffect(() => { getAIApprovalSetting().then(setValue).catch(() => undefined) }, [])
  return <section className="py-7"><h2 className="text-lg font-semibold">{t("aiStrength")}</h2><div className="mt-4 flex flex-wrap gap-2">{values.map((item) => <Button key={item} type="button" variant={value === item ? "default" : "outline"} disabled={saving} onClick={async () => { setSaving(true); try { setValue(await updateAIApprovalSetting(item)) } finally { setSaving(false) } }}>{t(item)}</Button>)}</div></section>
}
