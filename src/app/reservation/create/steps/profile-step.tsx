import { useTranslations } from "next-intl"
import { Controller, useFormContext } from "react-hook-form"

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

import type { ReservationFormValues } from "../form"
import { ReservationTermsDialog } from "./reservation-terms-dialog"

const PURPOSES = ["personal", "class", "club"] as const

export function ProfileStep({ adminMode = false }: { adminMode?: boolean }) {
  const t = useTranslations("booking")
  const { control } = useFormContext<ReservationFormValues>()

  return (
    <FieldGroup className="min-w-0">
      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
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
                placeholder={t("emailPlaceholder")}
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
          name="purposeType"
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
              <FieldLegend variant="label">{t("purpose")}</FieldLegend>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2"
              >
                {PURPOSES.map((purpose) => (
                  <Field key={purpose} orientation="horizontal" className="min-h-11 w-auto">
                    <RadioGroupItem value={purpose} id={`purpose-${purpose}`} />
                    <FieldLabel htmlFor={`purpose-${purpose}`} className="w-auto font-normal">
                      {t(`purposeOptions.${purpose}`)}
                    </FieldLabel>
                  </Field>
                ))}
              </RadioGroup>
              <FieldError errors={[fieldState.error]} />
            </FieldSet>
          )}
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
