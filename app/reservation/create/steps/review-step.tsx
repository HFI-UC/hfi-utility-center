import type { ReactNode } from "react"
import {
  CalendarDays,
  FileText,
  Mail,
  MapPin,
  Monitor,
  UserRound,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useFormContext } from "react-hook-form"

import type { CatalogData } from "@/lib/api/types"

import type { ReservationFormValues } from "../form"
import { StepLayout } from "../step-layout"

function ConfirmValue({
  label,
  children,
  icon,
}: {
  label: string
  children: ReactNode
  icon: ReactNode
}) {
  return (
    <div className="confirm-card">
      <div className="confirm-card__label">
        <span>{icon}</span>
        <strong>{label}</strong>
      </div>
      <div className="confirm-card__value">{children}</div>
    </div>
  )
}

export function ReviewStep({ catalog }: { catalog: CatalogData }) {
  const t = useTranslations("booking")
  const locale = useLocale()
  const { getValues } = useFormContext<ReservationFormValues>()
  const values = getValues()
  const className =
    catalog.classes.find((item) => item.id === values.classId)?.name ?? "-"
  const campusName =
    catalog.campuses.find((item) => item.id === values.bookingCampusId)?.name ??
    "-"
  const roomName =
    catalog.rooms.find((item) => item.id === values.room)?.name ?? "-"
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  })
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const duration = Math.max(
    0,
    Math.round((values.endTime - values.startTime) / 60)
  )

  return (
    <StepLayout
      title={t("reviewTitle")}
      description={t("reviewDescription")}
      hideHeader
    >
      <div className="confirm-step">
        <div className="confirm-banner">
          <span className="confirm-banner__icon">
            <CalendarDays size={22} />
          </span>
          <div>
            <h2>{t("reviewTitle")}</h2>
            <p>{t("reviewDescription")}</p>
          </div>
        </div>
        <div className="confirm-grid">
          <ConfirmValue label={t("location")} icon={<MapPin size={20} />}>
            <strong>{roomName}</strong>
            <span className="room-pill">{campusName}</span>
          </ConfirmValue>
          <ConfirmValue
            label={t("dateTimeTitle")}
            icon={<CalendarDays size={20} />}
          >
            <span className="confirm-date">
              {dateFormatter.format(new Date(values.startTime * 1000))}
            </span>
            <strong className="confirm-time">
              {timeFormatter.format(new Date(values.startTime * 1000))} -{" "}
              {timeFormatter.format(new Date(values.endTime * 1000))}
            </strong>
            <span className="duration-strip">{duration} 分钟</span>
          </ConfirmValue>
          <ConfirmValue
            label={t("profileTitle")}
            icon={<UserRound size={20} />}
          >
            <dl>
              <div>
                <dt>{t("class")}</dt>
                <dd>{className}</dd>
              </div>
              <div>
                <dt>{t("name")}</dt>
                <dd>{values.studentName}</dd>
              </div>
              <div>
                <dt>{t("studentId")}</dt>
                <dd>{values.studentId}</dd>
              </div>
              <div>
                <dt>{t("email")}</dt>
                <dd>{values.email}</dd>
              </div>
            </dl>
          </ConfirmValue>
          <ConfirmValue label={t("reason")} icon={<FileText size={20} />}>
            <span className="reason-quote">{values.reason}</span>
            <span className="confirm-note">
              <Mail size={16} /> 提交后将收到邮件确认及取消入口
            </span>
          </ConfirmValue>
          <ConfirmValue label={t("purpose")} icon={<Monitor size={20} />}>
            <strong>{t(`purposeOptions.${values.purposeType}`)}</strong>
            <span>
              {values.needsMultimedia
                ? t("multimedia")
                : t("no") + " · " + t("multimedia")}
            </span>
          </ConfirmValue>
        </div>
      </div>
    </StepLayout>
  )
}
