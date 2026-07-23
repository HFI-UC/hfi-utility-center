import { useTranslations } from "next-intl"
import { Controller, useFormContext } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { StepLayout } from "../step-layout"
import type { ReservationFormValues } from "../form"

export function ProfileStep() {
  const t = useTranslations("booking")
  const { control } = useFormContext<ReservationFormValues>()
  const fields = [
    { name: "studentName" as const, label: t("name"), autoComplete: "name" },
    {
      name: "studentId" as const,
      label: t("studentId"),
      autoComplete: "off",
      placeholder: "GJ00000000",
    },
    { name: "email" as const, label: t("email"), autoComplete: "email" },
  ]
  return (
    <StepLayout step={4} title={t("profileTitle")}>
      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((item) => (
          <Controller
            key={item.name}
            control={control}
            name={item.name}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>{item.label}</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type={field.name === "email" ? "email" : "text"}
                  autoComplete={item.autoComplete}
                  autoCapitalize={
                    field.name === "studentId" ? "characters" : undefined
                  }
                  placeholder={item.placeholder}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        ))}
      </div>
      <div className="mt-7">
        <Controller
          control={control}
          name="reason"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>{t("reason")}</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                rows={5}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
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
              <div>
                <FieldLabel htmlFor={field.name}>{t("agree")}</FieldLabel>
                <FieldError errors={[fieldState.error]} />
              </div>
            </Field>
          )}
        />
      </div>
    </StepLayout>
  )
}
