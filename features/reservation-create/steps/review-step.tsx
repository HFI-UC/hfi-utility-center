import { useLocale, useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"
import { StepLayout } from "@/features/reservation-create/step-layout"
import type { ReservationFormValues } from "@/features/reservation-create/schema"
import type { BootstrapData } from "@/lib/api/types"

export function ReviewStep({ catalog }: { catalog: BootstrapData }) {
  const t = useTranslations("booking")
  const locale = useLocale()
  const { getValues } = useFormContext<ReservationFormValues>()
  const values = getValues()
  const className =
    catalog.classes.find((item) => item.id === values.classId)?.name ?? "-"
  const format = (timestamp: number) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(timestamp * 1000))
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
    <StepLayout step={5} title={t("reviewTitle")}>
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
