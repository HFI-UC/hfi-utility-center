import { useTranslations } from "next-intl"

import type { CatalogData } from "@/lib/api/types"

import { StepLayout } from "../step-layout"
import { ProfileStep } from "./profile-step"

export function ClassStep({
  catalog,
  privilegedOnly = false,
  adminMode = false,
  onClassSelected,
}: {
  catalog: CatalogData
  privilegedOnly?: boolean
  adminMode?: boolean
  onClassSelected?: () => void
}) {
  const t = useTranslations("booking")

  return (
    <StepLayout title={t("classTitle")} description={t("classDescription")}>
      <ProfileStep
        catalog={catalog}
        privilegedOnly={privilegedOnly}
        adminMode={adminMode}
        onClassSelected={onClassSelected}
      />
    </StepLayout>
  )
}
