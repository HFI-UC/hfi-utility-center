import { Check, ChevronsUpDown, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import type { CatalogData } from "@/lib/api/types"
import { cn } from "@/lib/utils"

import type { ReservationFormValues } from "../form"
import { ReservationTermsDialog } from "./reservation-terms-dialog"

const PURPOSES = ["personal", "class", "club"] as const

export function ProfileStep({
  catalog,
  privilegedOnly = false,
  adminMode = false,
  onClassSelected,
}: {
  catalog: CatalogData
  privilegedOnly?: boolean
  adminMode?: boolean
  onClassSelected?: () => void
}) {
  const t = useTranslations("booking")
  const { control, setValue, clearErrors } = useFormContext<ReservationFormValues>()
  const privileged = useWatch({ control, name: "isPrivileged" })
  const [classOpen, setClassOpen] = useState(false)
  const [query, setQuery] = useState("")
  const classes = useMemo(() => {
    const visible = privilegedOnly
      ? catalog.classes.filter((item) =>
          catalog.campuses.some((campus) => campus.id === item.campus && campus.isPrivileged),
        )
      : catalog.classes
    const needle = query.trim().toLowerCase()
    const matched = needle
      ? visible.filter((item) => item.name.toLowerCase().includes(needle))
      : visible
    return [...matched].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  }, [catalog.campuses, catalog.classes, privilegedOnly, query])

  return (
    <FieldGroup className="min-w-0">
      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        <Controller
          control={control}
          name="studentName"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t("name")}</FieldLabel>
              <Input
                {...field}
                id={field.name}
                autoComplete="name"
                readOnly={adminMode}
                className="min-h-11"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        {!privileged ? (
          <Controller
            control={control}
            name="studentId"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("studentId")}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  autoComplete="off"
                  autoCapitalize="characters"
                  placeholder={t("studentIdPlaceholder")}
                  onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                  className="min-h-11"
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>{t("studentIdDescription")}</FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        ) : null}

        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t("email")}</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                autoComplete="email"
                readOnly={adminMode}
                className="min-h-11"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>{t("emailDescription")}</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="classId"
          render={({ field, fieldState }) => {
            const selected = catalog.classes.find((item) => item.id === field.value)
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="class-picker">{t("classTitle")}</FieldLabel>
                <Popover
                  open={classOpen}
                  onOpenChange={(open) => {
                    setClassOpen(open)
                    if (!open) setQuery("")
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      id="class-picker"
                      type="button"
                      variant="outline"
                      aria-expanded={classOpen}
                      aria-haspopup="listbox"
                      aria-invalid={fieldState.invalid}
                      className="min-h-11 w-full justify-between font-normal"
                    >
                      <span className={cn("truncate", !selected && "text-muted-foreground")}>
                        {selected?.name ?? t("classSearch")}
                      </span>
                      <ChevronsUpDown aria-hidden className="size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-(--radix-popover-trigger-width) gap-2 p-2"
                  >
                    <InputGroup className="h-11">
                      <InputGroupAddon>
                        <Search aria-hidden />
                      </InputGroupAddon>
                      <InputGroupInput
                        type="search"
                        autoComplete="off"
                        aria-label={t("classSearch")}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={t("classSearch")}
                      />
                    </InputGroup>
                    <div className="max-h-64 overflow-y-auto">
                      {classes.length ? (
                        classes.map((item) => (
                          <Button
                            key={item.id}
                            type="button"
                            variant="ghost"
                            className="h-11 w-full justify-between font-normal"
                            onClick={() => {
                              const campus = catalog.campuses.find(
                                (candidate) => candidate.id === item.campus,
                              )
                              if (item.campus !== selected?.campus) {
                                setValue("bookingCampusId", campus?.isPrivileged ? 0 : item.campus)
                                setValue("room", 0)
                                setValue("startTime", 0)
                                setValue("endTime", 0)
                              }
                              field.onChange(item.id)
                              clearErrors("classId")
                              setValue("isPrivileged", Boolean(campus?.isPrivileged), {
                                shouldValidate: false,
                              })
                              setClassOpen(false)
                              setQuery("")
                              onClassSelected?.()
                            }}
                          >
                            <span className="min-w-0 truncate text-left">{item.name}</span>
                            {field.value === item.id ? (
                              <Check aria-hidden className="size-4 shrink-0" />
                            ) : null}
                          </Button>
                        ))
                      ) : (
                        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                          {t("classEmpty")}
                        </p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )
          }}
        />
      </div>

      <Controller
        control={control}
        name="reason"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{t("reason")}</FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              rows={3}
              placeholder={t("reasonPlaceholder")}
              className="min-h-24"
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        <Controller
          control={control}
          name="purposeType"
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
              <FieldLegend variant="label">{t("purpose")}</FieldLegend>
              <RadioGroup
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                className="gap-1.5"
              >
                {PURPOSES.map((purpose) => (
                  <Field key={purpose} orientation="horizontal" className="min-h-11">
                    <RadioGroupItem value={purpose} id={`purpose-${purpose}`} />
                    <FieldLabel htmlFor={`purpose-${purpose}`} className="font-normal">
                      {t(`purposeOptions.${purpose}`)}
                    </FieldLabel>
                  </Field>
                ))}
              </RadioGroup>
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
        />

        <Controller
          control={control}
          name="needsMultimedia"
          render={({ field }) => (
            <Field orientation="horizontal" className="min-h-11 self-start sm:min-h-0">
              <Checkbox
                id="needsMultimedia"
                name="needsMultimedia"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-label={t("multimedia")}
              />
              <FieldContent>
                <FieldLabel htmlFor="needsMultimedia">{t("multimedia")}</FieldLabel>
                <FieldDescription>{t("multimediaDescription")}</FieldDescription>
              </FieldContent>
            </Field>
          )}
        />
      </div>

      {!adminMode ? (
        <Controller
          control={control}
          name="isAgreed"
          render={({ field, fieldState }) => (
            <Field
              orientation="horizontal"
              className="min-h-11 items-start border-t border-border pt-4 sm:min-h-0"
              data-invalid={fieldState.invalid}
            >
              <Checkbox
                id={field.name}
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldContent>
                <div className="flex flex-wrap items-baseline gap-x-1">
                  <FieldLabel htmlFor={field.name}>{t("agreementPrefix")}</FieldLabel>
                  <ReservationTermsDialog />
                </div>
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      ) : null}
    </FieldGroup>
  )
}
