"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import type { UseFormReturn } from "react-hook-form"

import { getCatalog } from "@/lib/api/catalog"
import type { CatalogData } from "@/lib/api/types"
import { dateToInputValue } from "@/lib/date-time"

import { isBookableCampus } from "./bookable-campus"
import type { ReservationFormValues } from "./form"

export function useBookingCatalog(form: UseFormReturn<ReservationFormValues>) {
  const t = useTranslations("booking")
  const [catalog, setCatalog] = useState<CatalogData>()
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string>()
  const [catalogReloadKey, setCatalogReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    async function loadCatalog() {
      setCatalogLoading(true)
      setCatalogError(undefined)
      try {
        const data = await getCatalog()
        if (!active) return

        setCatalog(data)
        const firstCampus = data.campuses.find(isBookableCampus)
        if (!form.getValues("bookingCampusId") && firstCampus) {
          form.setValue("bookingCampusId", firstCampus.id)
        }
        if (!form.getValues("date")) {
          form.setValue("date", dateToInputValue(new Date()))
        }
      } catch (error) {
        if (active) {
          setCatalogError(error instanceof Error ? error.message : t("connectionError"))
        }
      } finally {
        if (active) setCatalogLoading(false)
      }
    }

    void loadCatalog()
    return () => {
      active = false
    }
  }, [catalogReloadKey, form, t])

  return {
    catalog,
    catalogLoading,
    catalogError,
    reloadCatalog: () => setCatalogReloadKey((key) => key + 1),
  }
}
