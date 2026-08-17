import { useLocale, useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"
import { StepLayout } from "../step-layout"
import type { ReservationFormValues } from "../form"
import type { CatalogData } from "@/lib/api/types"

export function ReviewStep({ catalog }: { catalog: CatalogData }) {
  const t = useTranslations("booking")
  const locale = useLocale()
  const { getValues } = useFormContext<ReservationFormValues>()
  const values = getValues()
  const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  })
  const formatDateTime = (timestamp: number) =>
    dateTimeFormatter.format(new Date(timestamp * 1000))
  const className =
    catalog.classes.find((schoolClass) => schoolClass.id === values.classId)
      ?.name ?? "-"
  const campusName = catalog.campuses.find(
    (campus) => campus.id === values.bookingCampusId
  )?.name
  const roomName = catalog.rooms.find((room) => room.id === values.room)?.name
  const location = [campusName, roomName].filter(Boolean).join(" · ") || "-"
  const rows = [
    { label: t("class"), value: className },
    { label: t("location"), value: location },
    { label: t("start"), value: formatDateTime(values.startTime) },
    { label: t("end"), value: formatDateTime(values.endTime) },
    { label: t("name"), value: values.studentName },
    { label: t("studentId"), value: values.studentId },
    { label: t("email"), value: values.email },
    { label: t("reason"), value: values.reason },
  ]
  return (
    <StepLayout title={t("reviewTitle")} description={t("reviewDescription")}>
      <dl className="border-t">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="grid items-baseline gap-2 border-b py-4 text-sm font-normal sm:grid-cols-[10rem_1fr]"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="wrap-break-word">{value}</dd>
          </div>
        ))}
      </dl>
    </StepLayout>
  )
}
