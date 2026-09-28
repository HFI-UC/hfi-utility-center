import { useTranslations } from "next-intl"

import { StepLayout } from "../step-layout"
import { ProfileStep } from "./profile-step"

export function ClassStep({ adminMode = false }: { adminMode?: boolean }) {
  const t = useTranslations("booking")

  return (
    <StepLayout title={t("profileTitle")} description={t("profileDescription")}>
      <ProfileStep adminMode={adminMode} />
    </StepLayout>
  )
}
