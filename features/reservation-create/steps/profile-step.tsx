import { useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChoiceGrid } from "@/features/reservation-create/choice-grid"
import { StepLayout } from "@/features/reservation-create/step-layout"
import type { ReservationFormValues } from "@/features/reservation-create/schema"

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{error ? <p className="text-xs text-red-600">{error}</p> : null}</div>
}

export function ProfileStep() {
  const t = useTranslations("booking")
  const { register, setValue, watch, formState } = useFormContext<ReservationFormValues>()
  const errors = formState.errors
  const multimedia = watch("multimediaRequired")
  const purpose = watch("purposeType")
  return <StepLayout eyebrow="04 / 05" title={t("profileTitle")} description={t("profileDescription")}>
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label={t("name")} error={errors.studentName?.message}><Input autoComplete="name" {...register("studentName")} /></Field>
      <Field label={t("studentId")} error={errors.studentId?.message}><Input autoCapitalize="characters" placeholder="GJ00000000" {...register("studentId")} /></Field>
      <Field label={t("email")} error={errors.email?.message}><Input type="email" autoComplete="email" placeholder="name@gdhfi.com" {...register("email")} /></Field>
    </div>
    <div className="mt-7"><Label>{t("purpose")}</Label><div className="mt-2"><ChoiceGrid value={purpose} items={[
      { value: "personal", label: t("purposePersonal") }, { value: "class", label: t("purposeClass") }, { value: "club", label: t("purposeClub") },
    ]} onChange={(value) => setValue("purposeType", value, { shouldValidate: true })} /></div></div>
    <div className="mt-7 space-y-4 border-y py-5">
      <label className="flex items-center gap-3 text-sm"><input className="size-4" type="checkbox" {...register("multimediaRequired")} />{t("multimedia")}</label>
      {multimedia ? <Field label={t("multimediaDetails")} error={errors.multimediaDetails?.message}><Input {...register("multimediaDetails")} /></Field> : null}
    </div>
    <div className="mt-7"><Field label={t("reason")} error={errors.reason?.message}><Textarea rows={5} {...register("reason")} /></Field></div>
    <div className="mt-6 space-y-3 border-y py-5 text-sm">
      <label className="flex items-start gap-3"><input className="mt-1 size-4" type="checkbox" {...register("isAgreed")} /><span>{t("agree")}</span></label>
      {errors.isAgreed?.message ? <p className="text-xs text-red-600">{errors.isAgreed.message}</p> : null}
      <label className="flex items-start gap-3"><input className="mt-1 size-4" type="checkbox" {...register("rememberProfile")} /><span>{t("remember")}</span></label>
    </div>
  </StepLayout>
}
