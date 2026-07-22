import { useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StepLayout } from "@/features/reservation-create/step-layout"
import type { ReservationFormValues } from "@/features/reservation-create/schema"

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</div>
}

export function ProfileStep() {
  const t = useTranslations("booking")
  const { register, formState } = useFormContext<ReservationFormValues>()
  const errors = formState.errors
  return <StepLayout eyebrow="04 / 05" title={t("profileTitle")}>
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label={t("name")} error={errors.studentName?.message}><Input autoComplete="name" {...register("studentName")} /></Field>
      <Field label={t("studentId")} error={errors.studentId?.message}><Input autoCapitalize="characters" placeholder="GJ00000000" {...register("studentId")} /></Field>
      <Field label={t("email")} error={errors.email?.message}><Input type="email" autoComplete="email" {...register("email")} /></Field>
    </div>
    <div className="mt-7"><Field label={t("reason")} error={errors.reason?.message}><Textarea rows={5} {...register("reason")} /></Field></div>
    <div className="mt-6 space-y-3 border-y py-5 text-sm">
      <label className="flex items-start gap-3"><input className="mt-1 size-4" type="checkbox" {...register("isAgreed")} /><span>{t("agree")}</span></label>
      {errors.isAgreed?.message ? <p className="text-xs text-destructive">{errors.isAgreed.message}</p> : null}
      <label className="flex items-start gap-3"><input className="mt-1 size-4" type="checkbox" {...register("rememberProfile")} /><span>{t("remember")}</span></label>
    </div>
  </StepLayout>
}
