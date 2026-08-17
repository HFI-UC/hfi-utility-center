import { useMemo, useState } from "react"
import { Check, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useFormContext } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import type { CatalogData } from "@/lib/api/types"

import { ChoiceGrid } from "../choice-grid"
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
      <InputGroup className="mb-5 max-w-md">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          id="class-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("classSearch")}
          aria-label={t("classSearch")}
        />
      </InputGroup>
      <div className="grid gap-5 xl:grid-cols-[13rem_1fr]">
        <FieldSet className="gap-3">
          <FieldLegend variant="label">{t("campus")}</FieldLegend>
          <FieldGroup className="gap-2">
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
              <ChoiceGrid
                {...field}
                label={t("classTitle")}
                invalid={fieldState.invalid}
                items={classes.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                emptyText={t("classEmpty")}
              />
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
        />
      </div>
    </StepLayout>
  )
}
