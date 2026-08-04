import { CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
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
        {t("successDescription")}
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => router.push("/reservation/search")}
        >
          {t("viewReservations")}
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          {t("bookAgain")}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/")}>
          {t("home")}
        </Button>
      </div>
    </section>
  )
}
