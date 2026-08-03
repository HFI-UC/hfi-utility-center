import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

export function SuccessStep({
  reservationId,
  message,
  onReset,
}: {
  reservationId?: number
  message?: string
  onReset: () => void
}) {
  const t = useTranslations("booking")
  return (
    <section className="mx-auto flex min-h-[60svh] max-w-3xl flex-col justify-center">
      <CheckCircle2 className="mb-6 size-10 text-foreground" />
      <p className="text-sm font-semibold text-foreground">{t("success")}</p>
      {reservationId ? (
        <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">
          #{reservationId}
        </h1>
      ) : null}
      <p className="mt-5 max-w-xl leading-7 text-muted-foreground">
        {message ?? t("successDescription")}
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/reservation/search">
          <Button>{t("viewReservations")}</Button>
        </Link>
        <Button type="button" variant="outline" onClick={onReset}>
          {t("bookAgain")}
        </Button>
        <Link href="/">
          <Button type="button" variant="ghost">
            {t("home")}
          </Button>
        </Link>
      </div>
    </section>
  )
}
