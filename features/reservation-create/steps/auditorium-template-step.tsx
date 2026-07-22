import { useState } from "react"
import { enUS, zhCN } from "date-fns/locale"
import { Check, Copy } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChoiceGrid } from "@/features/reservation-create/choice-grid"
import { clockValue, dateToFormValue, formValueToDate, timestampForDate } from "@/features/reservation-create/date-utils"
import type { ReservationFormValues } from "@/features/reservation-create/schema"
import { StepLayout } from "@/features/reservation-create/step-layout"
import type { BootstrapData } from "@/lib/api/types"

function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "-")
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>
}

export function AuditoriumTemplateStep({ catalog }: { catalog: BootstrapData }) {
  const t = useTranslations("booking")
  const common = useTranslations("common")
  const locale = useLocale() as "zh-CN" | "en-US"
  const { register, setValue, watch } = useFormContext<ReservationFormValues>()
  const [copied, setCopied] = useState<"subject" | "body">()
  const values = watch()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const maximum = new Date(today)
  maximum.setDate(maximum.getDate() + 30)
  const className = catalog.classes.find((item) => item.id === values.classId)?.name ?? "-"
  const purpose = t(values.purposeType === "personal" ? "purposePersonal" : values.purposeType === "class" ? "purposeClass" : "purposeClub")
  const multimedia = values.multimediaRequired ? values.multimediaDetails || "-" : t("multimediaNone")
  const facility = catalog.specialFacilities?.find((item) => item.key === "auditorium")
  const templateValues = {
    studentName: values.studentName || "-",
    className,
    date: values.date || "-",
    startTime: clockValue(values.startTime) || "-",
    endTime: clockValue(values.endTime) || "-",
    purpose,
    attendeeCount: String(values.attendeeCount || 1),
    multimedia,
    reason: values.reason || "-",
  }
  const subject = facility ? fill(facility.templates[locale].subject, templateValues) : ""
  const body = facility ? fill(facility.templates[locale].body, templateValues) : ""

  async function copy(kind: "subject" | "body", value: string) {
    await navigator.clipboard.writeText(value)
    setCopied(kind)
  }

  return <StepLayout eyebrow="03 / 03" title={t("auditoriumTitle")} description={t("auditoriumTemplateDescription")}>
    <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start">
      <div className="w-fit border-y py-5">
        <Calendar
          mode="single"
          locale={locale === "zh-CN" ? zhCN : enUS}
          selected={formValueToDate(values.date)}
          defaultMonth={formValueToDate(values.date) ?? today}
          startMonth={today}
          endMonth={maximum}
          disabled={{ before: today, after: maximum }}
          onSelect={(selected) => {
            if (!selected) return
            setValue("date", dateToFormValue(selected))
            setValue("startTime", 0)
            setValue("endTime", 0)
          }}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("start")}><Input type="time" step={900} value={clockValue(values.startTime)} onChange={(event) => setValue("startTime", timestampForDate(values.date, event.target.value))} /></Field>
        <Field label={t("end")}><Input type="time" step={900} value={clockValue(values.endTime)} onChange={(event) => setValue("endTime", timestampForDate(values.date, event.target.value))} /></Field>
        <Field label={t("name")}><Input autoComplete="name" {...register("studentName")} /></Field>
        <Field label={t("attendeeCount")}><Input type="number" min={1} max={1000} {...register("attendeeCount", { valueAsNumber: true })} /></Field>
      </div>
    </div>

    <div className="mt-8 border-t pt-7">
      <Label>{t("purpose")}</Label>
      <div className="mt-2"><ChoiceGrid value={values.purposeType} items={[
        { value: "personal", label: t("purposePersonal") },
        { value: "class", label: t("purposeClass") },
        { value: "club", label: t("purposeClub") },
      ]} onChange={(value) => setValue("purposeType", value)} /></div>
    </div>
    <div className="mt-7 space-y-4 border-y py-5">
      <label className="flex items-center gap-3 text-sm"><input className="size-4" type="checkbox" {...register("multimediaRequired")} />{t("multimedia")}</label>
      {values.multimediaRequired ? <Field label={t("multimediaDetails")}><Input {...register("multimediaDetails")} /></Field> : null}
    </div>
    <div className="mt-7"><Field label={t("reason")}><Textarea rows={4} {...register("reason")} /></Field></div>

    <p className="mt-8 border-l-2 border-brand bg-brand-soft px-4 py-3 text-sm leading-6">{t("auditoriumSendInstruction")}</p>
    <div className="mt-8 space-y-6 border-t pt-7">
      <section><div className="mb-2 flex items-center justify-between gap-4"><h2 className="text-sm font-semibold">{t("subject")}</h2><Button type="button" size="sm" variant="outline" onClick={() => void copy("subject", subject)}>{copied === "subject" ? <Check /> : <Copy />}{copied === "subject" ? common("copied") : t("copySubject")}</Button></div><pre className="whitespace-pre-wrap border bg-muted/40 p-4 font-sans text-sm">{subject}</pre></section>
      <section><div className="mb-2 flex items-center justify-between gap-4"><h2 className="text-sm font-semibold">{t("body")}</h2><Button type="button" size="sm" variant="outline" onClick={() => void copy("body", body)}>{copied === "body" ? <Check /> : <Copy />}{copied === "body" ? common("copied") : t("copyBody")}</Button></div><pre className="whitespace-pre-wrap border bg-muted/40 p-4 font-sans text-sm leading-6">{body}</pre></section>
    </div>
  </StepLayout>
}
