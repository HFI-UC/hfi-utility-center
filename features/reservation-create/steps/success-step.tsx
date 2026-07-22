import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

export function SuccessStep({ reservationId, message, onReset }: { reservationId?: number; message?: string; onReset: () => void }) {
  const t = useTranslations("booking")
  return (
    <section className="mx-auto flex min-h-[60svh] max-w-3xl flex-col justify-center">
      <CheckCircle2 className="mb-6 size-10 text-emerald-600" />
      <p className="text-sm font-semibold text-emerald-700">{t("success")}</p>
      <h1 className="mt-3 text-4xl font-semibold sm:text-6xl">#{reservationId}</h1>
      <p className="mt-5 max-w-xl leading-7 text-muted-foreground">{message ?? t("successDescription")}</p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild><Link href="/reservation/search">{t("viewReservations")}</Link></Button>
        <Button type="button" variant="outline" onClick={onReset}>{t("bookAgain")}</Button>
        <Button asChild type="button" variant="ghost"><Link href="/">{t("home")}</Link></Button>
      </div>
    </section>
  )
}
