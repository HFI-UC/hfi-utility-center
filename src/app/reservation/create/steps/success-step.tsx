import { ArrowLeft, CalendarPlus, CheckCircle2, ListChecks } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export function SuccessStep({
  reservationId,
  onReset,
}: {
  reservationId?: number
  onReset: () => void
}) {
  const t = useTranslations("booking")
  return (
    <section className="mx-auto flex w-full max-w-xl min-w-0 flex-col items-center gap-3 py-6 text-center">
      <span
        aria-hidden
        className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground motion-safe:animate-success-check [&_svg]:motion-safe:animate-success-icon"
      >
        <CheckCircle2 className="size-7" />
      </span>
      <h2 className="text-xl font-semibold break-words">{t("success")}</h2>
      <p className="max-w-md text-sm break-words text-muted-foreground">
        {t("successDescription")}
      </p>
      {reservationId ? (
        <p className="flex flex-col items-center gap-0.5">
          <span className="text-xs text-muted-foreground">{t("reservationNumberLabel")}</span>
          <strong className="font-mono text-lg tabular-nums">#{reservationId}</strong>
        </p>
      ) : null}
      <div className="mt-2 flex w-full flex-wrap items-center justify-center gap-2">
        <Button asChild className="min-h-11 sm:min-h-8">
          <Link href="/reservation/search" prefetch={false}>
            <ListChecks aria-hidden />
            {t("viewReservations")}
          </Link>
        </Button>
        <Button type="button" variant="outline" onClick={onReset} className="min-h-11 sm:min-h-8">
          <CalendarPlus aria-hidden />
          {t("bookAgain")}
        </Button>
        <Button asChild variant="ghost" className="min-h-11 sm:min-h-8">
          <Link href="/" prefetch={false}>
            <ArrowLeft aria-hidden />
            {t("home")}
          </Link>
        </Button>
      </div>
    </section>
  )
}
