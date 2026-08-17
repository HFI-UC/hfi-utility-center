import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import type { AdminMutation } from "@/lib/api/admin-hooks"

export type FacilityEditorActions = {
  mutate: AdminMutation
  working: boolean
}

export function ConfirmFacilityDelete({
  label,
  action,
  mutate,
  working,
}: FacilityEditorActions & {
  label: string
  action: () => Promise<unknown>
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          title={`${common("delete")} ${label}`}
          disabled={working}
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{common("delete")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("confirmDelete", { name: label })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{common("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => mutate(action)}
          >
            {common("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
