"use client"

import { Pencil, Plus } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { AdminSection } from "@/app/admin/admin-shell"
import { TextActionDialog } from "@/app/admin/text-action-dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Campus } from "@/lib/api/types"
import { createCampus, deleteCampus, editCampus } from "@/lib/api/catalog"

import {
  ConfirmFacilityDelete,
  type FacilityEditorActions,
} from "./facility-editor-actions"

export function CampusEditor({
  campuses,
  mutate,
  working,
}: FacilityEditorActions & { campuses: Campus[] }) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const dateFormatter = new Intl.DateTimeFormat(useLocale(), {
    dateStyle: "medium",
  })

  return (
    <AdminSection
      title={t("campuses")}
      action={
        <TextActionDialog
          title={t("newCampus")}
          label={t("campusName")}
          cancelLabel={common("cancel")}
          saveLabel={common("add")}
          onSave={(name) =>
            mutate(() => createCampus(name.trim()), t("campusCreated"))
          }
        >
          <Button size="icon-sm" disabled={working}>
            <Plus />
            <span className="sr-only">{common("add")}</span>
          </Button>
        </TextActionDialog>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden sm:table-cell">{t("id")}</TableHead>
            <TableHead>{t("name")}</TableHead>
            <TableHead className="hidden md:table-cell">
              {t("createdAt")}
            </TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campuses.length ? (
            campuses.map((campus) => (
              <TableRow key={campus.id}>
                <TableCell className="hidden sm:table-cell">
                  #{campus.id}
                </TableCell>
                <TableCell className="font-medium">{campus.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {campus.createdAt
                    ? dateFormatter.format(new Date(campus.createdAt))
                    : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <TextActionDialog
                      title={t("renameCampus")}
                      label={t("campusName")}
                      initialValue={campus.name}
                      cancelLabel={common("cancel")}
                      saveLabel={common("save")}
                      onSave={(name) =>
                        mutate(
                          () => editCampus(campus.id, name),
                          t("campusUpdated")
                        )
                      }
                    >
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title={t("renameCampus")}
                        disabled={working}
                      >
                        <Pencil />
                      </Button>
                    </TextActionDialog>
                    <ConfirmFacilityDelete
                      label={campus.name}
                      action={() => deleteCampus(campus.id)}
                      mutate={mutate}
                      working={working}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                {t("campusesEmpty")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </AdminSection>
  )
}
