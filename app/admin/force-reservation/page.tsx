"use client"

import { AdminPageHeader } from "@/app/admin/admin-shell"
import { ForceReservationForm } from "@/app/admin/reservation/force-reservation-form"
import { useTranslations } from "next-intl"

export default function AdminForceReservationPage() {
  const t = useTranslations("admin")

  return (
    <main className="space-y-6">
      <AdminPageHeader
        title={t("forceReservationTitle")}
        description={t("forceReservationDescription")}
      />
      <ForceReservationForm />
    </main>
  )
}
