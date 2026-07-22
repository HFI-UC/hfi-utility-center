import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { ChoiceGrid } from "@/features/reservation-create/choice-grid"
import { StepLayout } from "@/features/reservation-create/step-layout"
import type { ReservationFormValues } from "@/features/reservation-create/schema"
import type { BootstrapData } from "@/lib/api/types"

export function ClassStep({ catalog }: { catalog: BootstrapData }) {
  const t = useTranslations("booking")
  const [query, setQuery] = useState("")
  const { setValue, watch, formState } = useFormContext<ReservationFormValues>()
  const value = watch("classId")
  const groups = useMemo(() => catalog.campuses.map((campus) => ({
    campus,
    classes: catalog.classes.filter((item) => item.campus === campus.id && item.name.toLowerCase().includes(query.toLowerCase())),
  })).filter((group) => group.classes.length), [catalog, query])
  return <StepLayout eyebrow="01 / 05" title={t("classTitle")} description={t("classDescription")} error={formState.errors.classId?.message}>
    <Input className="mb-7 max-w-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("classSearch")} aria-label={t("classSearch")} />
    <div className="space-y-8">
      {groups.map(({ campus, classes }) => <section key={campus.id}>
        <h2 className="mb-3 text-sm font-semibold">{campus.name}</h2>
        <ChoiceGrid value={value} items={classes.map((item) => ({ value: item.id, label: item.name }))} onChange={(classId) => setValue("classId", classId, { shouldValidate: true })} />
      </section>)}
      {!groups.length ? <p className="border-y py-8 text-sm text-muted-foreground">{t("classEmpty")}</p> : null}
    </div>
  </StepLayout>
}
