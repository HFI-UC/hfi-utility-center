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
    <section className="flex min-h-[45svh] flex-col justify-center">
      <CheckCircle2 className="mb-5 size-9 text-foreground" />
      <h2 className="text-2xl font-semibold">{t("success")}</h2>
      {reservationId ? (
        <p className="mt-3 text-5xl font-semibold tracking-tight">
          #{reservationId}
        </p>
      ) : null}
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
        {t("successDescription")}
      </p>
      <div className="mt-7 flex flex-wrap gap-2">
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
