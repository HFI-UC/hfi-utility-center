import { useMemo, useState } from "react"
import { Check } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useFormContext } from "react-hook-form"

import {
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/astryx"
import type { CatalogData } from "@/lib/api/types"

import type { ReservationFormValues } from "../form"
import { StepLayout } from "../step-layout"

export function ClassStep({ catalog }: { catalog: CatalogData }) {
  const t = useTranslations("booking")
  const [query, setQuery] = useState("")
  const { control, getValues, setValue } =
    useFormContext<ReservationFormValues>()
  const [campusId, setCampusId] = useState(
    () =>
      catalog.classes.find((item) => item.id === getValues("classId"))
        ?.campus ??
      catalog.campuses[0]?.id ??
      0
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
    const selectedClassCampus = catalog.classes.find(
      (item) => item.id === getValues("classId")
    )?.campus
    if (selectedClassCampus !== nextCampusId) {
      setValue("classId", 0, { shouldValidate: false })
    }
  }

  return (
    <StepLayout title={t("classTitle")}>
      <div className="wizard-content-grid wizard-content-grid--step-one">
        <FieldSet className="gap-3">
          <FieldLegend variant="label">所属校区</FieldLegend>
          <FieldGroup className="selection-stack">
            {catalog.campuses.map((item) => {
              const selected = item.id === campusId
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectCampus(item.id)}
                  className={`selection-button ${selected ? "selection-button--selected" : ""}`}
                >
                  <span>{item.name}</span>
                  {selected ? <Check /> : null}
                </button>
              )
            })}
          </FieldGroup>
        </FieldSet>
        <Controller
          control={control}
          name="classId"
          render={({ field, fieldState }) => (
            <FieldSet className="gap-3" data-invalid={fieldState.invalid}>
              <FieldLegend variant="label">
                {campus?.name ?? t("classTitle")}
              </FieldLegend>
              <label className="list-search neo-class-search">
                <input
                  id="class-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("classSearch")}
                />
              </label>
              <div
                className="class-grid"
                role="radiogroup"
                aria-label={t("classTitle")}
              >
                {classes.map((item) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={field.value === item.id}
                    className={`selection-button ${field.value === item.id ? "selection-button--selected" : ""}`}
                    key={item.id}
                    onClick={() => field.onChange(item.id)}
                  >
                    {item.name}
                    {field.value === item.id ? <Check size={14} /> : null}
                  </button>
                ))}
              </div>
              {!classes.length ? <p>{t("classEmpty")}</p> : null}
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
        />
      </div>
    </StepLayout>
  )
}
