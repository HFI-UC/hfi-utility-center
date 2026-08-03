import { useLocale, useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"
import { StepLayout } from "../step-layout"
import type { ReservationFormValues } from "../form"
import type { BootstrapData } from "@/lib/api/types"
import { createAppDateTimeFormatter } from "@/lib/date-time"

export function ReviewStep({ catalog }: { catalog: BootstrapData }) {
  const t = useTranslations("booking")
  const locale = useLocale()
  const { getValues } = useFormContext<ReservationFormValues>()
  const values = getValues()
  const className =
    catalog.classes.find((item) => item.id === values.classId)?.name ?? "-"
  const dateTimeFormatter = createAppDateTimeFormatter(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  })
  const format = (timestamp: number) =>
    dateTimeFormatter.format(new Date(timestamp * 1000))
  const location = `${catalog.campuses.find((item) => item.id === values.bookingCampusId)?.name ?? ""} · ${catalog.rooms.find((item) => item.id === values.room)?.name ?? ""}`
  const rows = [
    [t("class"), className],
    [t("location"), location],
    [t("start"), format(values.startTime)],
    [t("end"), format(values.endTime)],
    [t("name"), values.studentName],
    [t("studentId"), values.studentId],
    [t("email"), values.email],
    [t("reason"), values.reason],
  ]
  return (
    <StepLayout
      step={5}
      title={t("reviewTitle")}
      description={t("reviewDescription")}
    >
      <dl className="border-t">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-2 border-b py-4 sm:grid-cols-[10rem_1fr]"
          >
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="font-medium break-words">{value}</dd>
          </div>
        ))}
      </dl>
    </StepLayout>
  )
}
