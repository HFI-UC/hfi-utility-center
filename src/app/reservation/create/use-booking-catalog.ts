"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import type { UseFormReturn } from "react-hook-form"

import { getAdminSession, type AdminSession } from "@/lib/api/auth"
import { getCatalog } from "@/lib/api/catalog"
import type { CatalogData } from "@/lib/api/types"
import { dateToInputValue } from "@/lib/date-time"

import { reservationDefaults, type ReservationFormValues } from "./form"

// Loads the booking catalog, prefilling admin credentials when in force mode.
export function useBookingCatalog(isForce: boolean, form: UseFormReturn<ReservationFormValues>) {
  const t = useTranslations("booking")
  const adminT = useTranslations("admin")
  const [catalog, setCatalog] = useState<CatalogData>()
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string>()
  const [catalogReloadKey, setCatalogReloadKey] = useState(0)
  const adminSessionRef = useRef<AdminSession | undefined>(undefined)

  useEffect(() => {
    let active = true

    async function loadCatalog() {
      setCatalogLoading(true)
      setCatalogError(undefined)
      try {
        const [data, session] = await Promise.all([
          getCatalog(),
          isForce ? getAdminSession() : Promise.resolve(undefined),
        ])
        if (!active) return

        if (isForce && !session) {
          throw new Error(adminT("forceLoadError"))
        }
        setCatalog(data)
        adminSessionRef.current = session
        if (isForce && session) {
          form.reset(forceReservationDefaults(session))
        }
        if (!form.getValues("bookingCampusId") && data.campuses[0]) {
          form.setValue("bookingCampusId", data.campuses[0].id)
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
  }, [adminT, catalogReloadKey, form, isForce, t])

  return {
    catalog,
    catalogLoading,
    catalogError,
    reloadCatalog: () => setCatalogReloadKey((key) => key + 1),
    adminSessionRef,
  }
}

export function forceReservationDefaults(admin: AdminSession): ReservationFormValues {
  return {
    ...reservationDefaults,
    email: admin.email,
    purposeType: "class",
    isAgreed: true,
  }
}
