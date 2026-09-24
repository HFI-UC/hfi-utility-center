import { ArrowLeft, CalendarPlus, Check, ListChecks } from "lucide-react"
import { useTranslations } from "next-intl"

import { ActionButton, Surface } from "@/components/neo/shared"

export function SuccessStep({
  reservationId,
  adminForce = false,
  onReset,
}: {
  reservationId?: number
  adminForce?: boolean
  onReset: () => void
}) {
  const t = useTranslations("booking")
  const adminT = useTranslations("admin")
  return (
    <section className="success-page">
      <Surface className="success-card">
        <span className="success-card__icon" aria-hidden="true">
          <Check size={30} strokeWidth={2.5} />
        </span>
        <span className="page-overline">HFI Utility Center</span>
        <h2>{adminForce ? adminT("forceSuccessTitle") : t("success")}</h2>
        <p className="success-card__description">
          {adminForce && reservationId
            ? adminT("forceSuccessDescription", { id: reservationId })
            : t("successDescription")}
        </p>
        {adminForce ? (
          <p className="success-card__description">
            {adminT("forceConflictHandled")}
          </p>
        ) : null}
        {reservationId ? (
          <div className="success-card__number">
            <span>{t("reservationNumberLabel")}</span>
            <strong>#{reservationId}</strong>
          </div>
        ) : null}
        <div className="success-card__actions">
          <ActionButton
            href={adminForce ? "/admin/reservation" : "/reservation/search"}
            icon={<ListChecks size={17} />}
          >
            {t("viewReservations")}
          </ActionButton>
          <ActionButton
            variant="secondary"
            icon={<CalendarPlus size={17} />}
            onClick={onReset}
          >
            {adminForce ? adminT("forceCreateAnother") : t("bookAgain")}
          </ActionButton>
          {!adminForce ? (
            <ActionButton
              href="/"
              variant="secondary"
              icon={<ArrowLeft size={17} />}
            >
              {t("home")}
            </ActionButton>
          ) : null}
        </div>
      </Surface>
    </section>
  )
}
