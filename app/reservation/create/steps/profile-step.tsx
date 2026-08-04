import { useTranslations } from "next-intl"
import { Controller, useFormContext } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { StepLayout } from "../step-layout"
import type { ReservationFormValues } from "../form"
import { ReservationTermsDialog } from "./reservation-terms-dialog"

export function ProfileStep() {
  const t = useTranslations("booking")
  const { control, register, formState } =
    useFormContext<ReservationFormValues>()
  const { errors } = formState

  return (
    <StepLayout step={4} title={t("profileTitle")}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.studentName)}>
          <FieldLabel htmlFor="studentName">{t("name")}</FieldLabel>
          <Input
            {...register("studentName")}
            id="studentName"
            autoComplete="name"
            aria-invalid={Boolean(errors.studentName)}
          />
          <FieldError errors={[errors.studentName]} />
        </Field>
        <Field data-invalid={Boolean(errors.studentId)}>
          <FieldLabel htmlFor="studentId">{t("studentId")}</FieldLabel>
          <Input
            {...register("studentId")}
            id="studentId"
            autoComplete="off"
            autoCapitalize="characters"
            placeholder="GJ00000000"
            aria-invalid={Boolean(errors.studentId)}
          />
          <FieldError errors={[errors.studentId]} />
        </Field>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
          <Input
            {...register("email")}
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
          <FieldError errors={[errors.email]} />
        </Field>
      </div>
      <div className="mt-7">
        <Field data-invalid={Boolean(errors.reason)}>
          <FieldLabel htmlFor="reason">{t("reason")}</FieldLabel>
          <Textarea
            {...register("reason")}
            id="reason"
            rows={5}
            aria-invalid={Boolean(errors.reason)}
          />
          <FieldError errors={[errors.reason]} />
        </Field>
      </div>
      <div className="mt-6 border-y py-5 text-sm">
        <Controller
          control={control}
          name="isAgreed"
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <Checkbox
                id={field.name}
                name={field.name}
                className="mt-1"
                checked={field.value}
                onCheckedChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={fieldState.invalid}
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-1">
                  <FieldLabel htmlFor={field.name}>
                    {t("agreementPrefix")}
                  </FieldLabel>
                  <ReservationTermsDialog />
                </div>
                <FieldError errors={[fieldState.error]} />
              </div>
            </Field>
          )}
        />
      </div>
    </StepLayout>
  )
}
