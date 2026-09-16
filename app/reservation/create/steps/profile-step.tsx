import { useTranslations } from "next-intl"
import { Controller, useFormContext } from "react-hook-form"

import { Checkbox } from "@/components/astryx"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/astryx"
import { Input } from "@/components/astryx"
import { Textarea } from "@/components/astryx"

import type { ReservationFormValues } from "../form"
import { StepLayout } from "../step-layout"
import { ReservationTermsDialog } from "./reservation-terms-dialog"

export function ProfileStep() {
  const t = useTranslations("booking")
  const { control } = useFormContext<ReservationFormValues>()

  return (
    <StepLayout title={t("profileTitle")}>
      <div className="surface form-card profile-card">
        <div className="form-card__header">
          <p>{t("profileDescription")}</p>
        </div>
        <FieldGroup className="profile-form">
          <div className="form-grid profile-identity-grid">
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
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>{t("nameDescription")}</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

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
                    placeholder="GJ00000000"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    {t("studentIdDescription")}
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

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
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>{t("emailDescription")}</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="reason"
              render={({ field, fieldState }) => (
                <Field
                  className="profile-reason-field"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel htmlFor={field.name}>{t("reason")}</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    rows={4}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>{t("reasonDescription")}</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>

          <div className="profile-options-grid">
            <Controller
              control={control}
              name="purposeType"
              render={({ field, fieldState }) => (
                <Field
                  className="profile-option-panel"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel>{t("purpose")}</FieldLabel>
                  <div className="profile-purpose-options">
                    {(["personal", "class", "club"] as const).map((purpose) => (
                      <button
                        key={purpose}
                        type="button"
                        aria-pressed={field.value === purpose}
                        onClick={() => field.onChange(purpose)}
                        className={`purpose-option ${field.value === purpose ? "purpose-option--selected" : ""}`}
                      >
                        <span className="font-medium">
                          {t(`purposeOptions.${purpose}`)}
                        </span>
                      </button>
                    ))}
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="needsMultimedia"
              render={({ field }) => (
                <Field className="multimedia-option profile-option-panel">
                  <Checkbox
                    id="needsMultimedia"
                    name="needsMultimedia"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label={t("multimedia")}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="needsMultimedia">
                      {t("multimedia")}
                    </FieldLabel>
                    <FieldDescription>
                      {t("multimediaDescription")}
                    </FieldDescription>
                  </FieldContent>
                </Field>
              )}
            />
          </div>

          <Controller
            control={control}
            name="isAgreed"
            render={({ field, fieldState }) => (
              <Field
                className="profile-agreement text-sm"
                orientation="horizontal"
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
                    <FieldLabel htmlFor={field.name}>
                      {t("agreementPrefix")}
                    </FieldLabel>
                    <ReservationTermsDialog />
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </FieldContent>
              </Field>
            )}
          />
        </FieldGroup>
      </div>
    </StepLayout>
  )
}
