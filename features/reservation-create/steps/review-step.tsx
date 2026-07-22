import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { StepLayout } from "@/features/reservation-create/step-layout"
import type { ReservationFormValues } from "@/features/reservation-create/schema"
import type { BootstrapData } from "@/lib/api/types"

function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "-")
}

export function ReviewStep({ catalog }: { catalog: BootstrapData }) {
  const t = useTranslations("booking")
  const common = useTranslations("common")
  const locale = useLocale() as "zh-CN" | "en-US"
  const { getValues } = useFormContext<ReservationFormValues>()
  const [copied, setCopied] = useState<"subject" | "body">()
  const values = getValues()
  const className = catalog.classes.find((item) => item.id === values.classId)?.name ?? "-"
  const purpose = t(values.purposeType === "personal" ? "purposePersonal" : values.purposeType === "class" ? "purposeClass" : "purposeClub")
  const format = (timestamp: number) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp * 1000))
  const location = values.specialFacility === "auditorium" ? "Auditorium" : `${catalog.campuses.find((item) => item.id === values.bookingCampusId)?.name ?? ""} · ${catalog.rooms.find((item) => item.id === values.room)?.name ?? ""}`
  const multimedia = values.multimediaRequired ? values.multimediaDetails : t("multimediaNone")
  const rows = [[t("class"), className], [t("location"), location], [t("start"), format(values.startTime)], [t("end"), format(values.endTime)], [t("name"), values.studentName], [t("studentId"), values.studentId], [t("email"), values.email], [t("purpose"), purpose], [t("multimedia"), multimedia], [t("reason"), values.reason]]
  const facility = catalog.specialFacilities?.find((item) => item.key === "auditorium")
  const templateValues = { studentName: values.studentName, className, date: values.date, startTime: new Date(values.startTime * 1000).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }), endTime: new Date(values.endTime * 1000).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }), purpose, multimedia, reason: values.reason }
  const subject = facility ? fill(facility.templates[locale].subject, templateValues) : ""
  const body = facility ? fill(facility.templates[locale].body, templateValues) : ""
  async function copy(kind: "subject" | "body", value: string) { await navigator.clipboard.writeText(value); setCopied(kind) }
  return <StepLayout eyebrow="05 / 05" title={values.specialFacility === "auditorium" ? t("auditoriumTitle") : t("reviewTitle")} description={values.specialFacility === "auditorium" ? t("auditoriumDescription") : t("reviewDescription")}>
    <dl className="border-t">{rows.map(([label, value]) => <div key={label} className="grid gap-2 border-b py-4 sm:grid-cols-[10rem_1fr]"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-medium break-words">{value}</dd></div>)}</dl>
    {values.specialFacility === "auditorium" ? <div className="mt-8 space-y-6 border-t pt-7">
      <section><div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-semibold">{t("subject")}</h2><Button type="button" size="sm" variant="outline" onClick={() => void copy("subject", subject)}>{copied === "subject" ? <Check /> : <Copy />}{copied === "subject" ? common("copied") : t("copySubject")}</Button></div><pre className="whitespace-pre-wrap border bg-muted/40 p-4 font-sans text-sm">{subject}</pre></section>
      <section><div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-semibold">{t("body")}</h2><Button type="button" size="sm" variant="outline" onClick={() => void copy("body", body)}>{copied === "body" ? <Check /> : <Copy />}{copied === "body" ? common("copied") : t("copyBody")}</Button></div><pre className="whitespace-pre-wrap border bg-muted/40 p-4 font-sans text-sm leading-6">{body}</pre></section>
    </div> : null}
  </StepLayout>
}
