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
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import type { ReservationFormValues } from "../form"
import { StepLayout } from "../step-layout"
import { ReservationTermsDialog } from "./reservation-terms-dialog"

export function ProfileStep() {
  const t = useTranslations("booking")
  const { control } = useFormContext<ReservationFormValues>()

  return (
    <StepLayout title={t("profileTitle")}>
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
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
                <FieldDescription>{t("studentIdDescription")}</FieldDescription>
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
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{t("reason")}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>{t("reasonDescription")}</FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <Controller
          control={control}
          name="isAgreed"
          render={({ field: { value, onChange, ...field }, fieldState }) => (
            <Field
              className="py-5 text-sm"
              orientation="horizontal"
              data-invalid={fieldState.invalid}
            >
              <Checkbox
                {...field}
                id={field.name}
                checked={value}
                onCheckedChange={onChange}
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
    </StepLayout>
  )
}
