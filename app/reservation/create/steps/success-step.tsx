import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

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
    <section className="flex min-h-[55svh] flex-col justify-center">
      <CheckCircle2 className="mb-6 size-10 text-foreground" />
      <p className="text-sm font-semibold text-foreground">{t("success")}</p>
      {reservationId ? (
        <h2 className="mt-3 text-4xl font-semibold sm:text-6xl">
          #{reservationId}
        </h2>
      ) : null}
      <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
        {t("successDescription")}
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/reservation/search">{t("viewReservations")}</Link>
        </Button>
        <Button variant="outline" onClick={onReset}>
          {t("bookAgain")}
        </Button>
        <Button asChild variant="ghost">
          <Link href="/">{t("home")}</Link>
        </Button>
      </div>
    </section>
  )
}
