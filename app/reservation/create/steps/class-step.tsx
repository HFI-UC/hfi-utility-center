import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { useController, useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { ChoiceGrid } from "../choice-grid"
import { StepLayout } from "../step-layout"
import type { ReservationFormValues } from "../form"
import type { BootstrapData } from "@/lib/api/types"

export function ClassStep({ catalog }: { catalog: BootstrapData }) {
  const t = useTranslations("booking")
  const [query, setQuery] = useState("")
  const { control, setValue } = useFormContext<ReservationFormValues>()
  const { field: classField, fieldState: classFieldState } = useController({
    control,
    name: "classId",
  })
  const value = classField.value
  const selectedClass = catalog.classes.find((item) => item.id === value)
  const [campusId, setCampusId] = useState(
    selectedClass?.campus ?? catalog.campuses[0]?.id ?? 0
  )
  const campus = catalog.campuses.find((item) => item.id === campusId)
  const classes = useMemo(
    () =>
      catalog.classes.filter(
        (item) =>
          item.campus === campusId &&
          item.name.toLowerCase().includes(query.toLowerCase())
      ),
    [catalog, campusId, query]
  )

  function selectCampus(nextCampusId: number) {
    setCampusId(nextCampusId)
    setQuery("")
    if (selectedClass?.campus !== nextCampusId) {
      setValue("classId", 0, { shouldValidate: false })
    }
  }

  return (
    <StepLayout
      step={1}
      title={t("classTitle")}
      error={classFieldState.error?.message}
    >
      <Input
        className="mb-7 max-w-md"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("classSearch")}
        aria-label={t("classSearch")}
      />
      <div className="grid gap-7 xl:grid-cols-[13rem_1fr]">
        <section>
          <h2 className="mb-3 text-xs font-bold">{t("campus")}</h2>
          <div className="grid gap-2">
            {catalog.campuses.map((item) => {
              const selected = item.id === campusId
              return (
                <Button
                  key={item.id}
                  type="button"
                  variant={selected ? "default" : "outline"}
                  aria-pressed={selected}
                  onClick={() => selectCampus(item.id)}
                  className="w-full justify-between"
                >
                  <span>{item.name}</span>
                  {selected ? <Check /> : null}
                </Button>
              )
            })}
          </div>
        </section>
        <section>
          <h2 className="mb-3 text-xs font-bold">
            {campus?.name ?? t("classTitle")}
          </h2>
          <ChoiceGrid
            name={classField.name}
            label={t("classTitle")}
            value={value}
            invalid={classFieldState.invalid}
            items={classes.map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            onChange={classField.onChange}
            onBlur={classField.onBlur}
            emptyText={t("classEmpty")}
          />
        </section>
      </div>
    </StepLayout>
  )
}
