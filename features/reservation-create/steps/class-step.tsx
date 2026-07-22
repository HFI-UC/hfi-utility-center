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
  const selectedClass = catalog.classes.find((item) => item.id === value)
  const [campusId, setCampusId] = useState(selectedClass?.campus ?? catalog.campuses[0]?.id ?? 0)
  const campus = catalog.campuses.find((item) => item.id === campusId)
  const classes = useMemo(() => catalog.classes.filter((item) => item.campus === campusId && item.name.toLowerCase().includes(query.toLowerCase())), [catalog, campusId, query])
  return <StepLayout eyebrow="01 / 05" title={t("classTitle")} error={formState.errors.classId?.message}>
    <Input className="mb-7 max-w-md border-x-0 border-t-0 px-0 text-base" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("classSearch")} aria-label={t("classSearch")} />
    <div className="grid gap-7 xl:grid-cols-[13rem_1fr]">
      <section>
        <h2 className="mb-3 text-xs font-bold">{t("campus")}</h2>
        <div className="grid gap-2">
          {catalog.campuses.map((item, index) => {
            const selected = item.id === campusId
            return <button key={item.id} type="button" aria-pressed={selected} onClick={() => {
              setCampusId(item.id)
              setQuery("")
              if (selectedClass?.campus !== item.id) setValue("classId", 0, { shouldValidate: false })
            }} className={`flex min-h-20 w-full items-center justify-between rounded-lg border p-3 text-left transition-colors ${selected ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-accent"}`}>
              <span><span className="block text-sm font-semibold">{item.name}</span><span className={`mt-1 block font-mono text-[0.625rem] ${selected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{String(index + 1).padStart(2, "0")}</span></span>
              <span className="text-xl" aria-hidden="true">→</span>
            </button>
          })}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-xs font-bold">{campus?.name ?? t("classTitle")}</h2>
        <ChoiceGrid value={value} items={classes.map((item) => ({ value: item.id, label: item.name }))} onChange={(classId) => setValue("classId", classId, { shouldValidate: true })} emptyText={t("classEmpty")} />
      </section>
    </div>
  </StepLayout>
}
