import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { ConfirmAction } from "@/components/action-dialogs"
import { Button } from "@/components/ui/button"
import type { AdminMutation } from "@/features/admin/use-admin-mutation"

export type FacilityEditorActions = {
  mutate: AdminMutation
  workingKey?: string
}

export function ConfirmFacilityDelete({
  mutationKey,
  label,
  action,
  mutate,
  workingKey,
}: FacilityEditorActions & {
  mutationKey: string
  label: string
  action: () => Promise<unknown>
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")

  return (
    <ConfirmAction
      title={common("delete")}
      description={t("confirmDelete", { name: label })}
      cancelLabel={common("cancel")}
      confirmLabel={common("delete")}
      onConfirm={() => mutate(mutationKey, action)}
    >
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        title={`${common("delete")} ${label}`}
        disabled={Boolean(workingKey)}
      >
        <Trash2 />
      </Button>
    </ConfirmAction>
  )
}
