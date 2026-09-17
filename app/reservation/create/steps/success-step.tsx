import { ArrowLeft, CalendarPlus, Check, ListChecks } from "lucide-react"
import { useTranslations } from "next-intl"

import { ActionButton, Surface } from "@/components/neo/shared"

export function SuccessStep({
  reservationId,
  onReset,
}: {
  reservationId?: number
  onReset: () => void
}) {
  const t = useTranslations("booking")
  return (
    <section className="success-page">
      <Surface className="success-card">
        <span className="success-card__icon" aria-hidden="true">
          <Check size={30} strokeWidth={2.5} />
        </span>
        <span className="page-overline">HFI Utility Center</span>
        <h2>{t("success")}</h2>
        <p className="success-card__description">{t("successDescription")}</p>
        {reservationId ? (
          <div className="success-card__number">
            <span>{t("reservationNumberLabel")}</span>
            <strong>#{reservationId}</strong>
          </div>
        ) : null}
        <div className="success-card__actions">
          <ActionButton
            href="/reservation/search"
            icon={<ListChecks size={17} />}
          >
            {t("viewReservations")}
          </ActionButton>
          <ActionButton
            variant="secondary"
            icon={<CalendarPlus size={17} />}
            onClick={onReset}
          >
            {t("bookAgain")}
          </ActionButton>
          <ActionButton
            href="/"
            variant="secondary"
            icon={<ArrowLeft size={17} />}
          >
            {t("home")}
          </ActionButton>
        </div>
      </Surface>
    </section>
  )
}
