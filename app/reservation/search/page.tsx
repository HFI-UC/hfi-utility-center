import { Suspense } from "react"
import { ReservationSearch } from "@/features/reservation-search/reservation-search"
import { getTranslations } from "next-intl/server"

export default async function ReservationSearchPage() {
  const t = await getTranslations("admin")
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl px-4 py-12 text-sm text-muted-foreground sm:px-6">
          {t("searchLoading")}
        </main>
      }
    >
      <ReservationSearch />
    </Suspense>
  )
}
