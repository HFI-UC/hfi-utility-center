"use client"

import { useLocale, useTranslations } from "next-intl"

import { AdminSection } from "@/app/admin/admin-shell"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/astryx"
import { createCampus, deleteCampus, editCampus } from "@/lib/api/catalog"
import type { Campus } from "@/lib/api/types"

import {
  ConfirmFacilityDelete,
  type FacilityEditorActions,
} from "./facility-editor-actions"
import styles from "./facility.module.css"
import { FacilityNameDialog } from "./name-dialog"

export function CampusEditor({
  campuses,
  mutate,
  working,
}: FacilityEditorActions & { campuses: Campus[] }) {
  const t = useTranslations("admin")
  const dateFormatter = new Intl.DateTimeFormat(useLocale(), {
    dateStyle: "medium",
  })

  return (
    <AdminSection
      title={t("campuses")}
      action={
        <FacilityNameDialog
          mode="create"
          title={t("newCampus")}
          label={t("campusName")}
          working={working}
          onSave={(name) =>
            mutate(() => createCampus(name), t("campusCreated"))
          }
        />
      }
    >
      <p className={styles.sectionIntro}>{t("facilitiesDescription")}</p>
      <Table>
        <TableHeader>
          <TableRow>
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
                <TableCell className="font-medium">
                  {campus.name}
                  <span className="ml-2 text-xs text-[var(--color-text-secondary)]">
                    #{campus.id}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {campus.createdAt
                    ? dateFormatter.format(new Date(campus.createdAt))
                    : "—"}
                </TableCell>
                <TableCell>
                  <div className={styles.rowActions}>
                    <FacilityNameDialog
                      mode="edit"
                      title={t("renameCampus")}
                      label={t("campusName")}
                      initialValue={campus.name}
                      working={working}
                      onSave={(name) =>
                        mutate(
                          () => editCampus(campus.id, name),
                          t("campusUpdated")
                        )
                      }
                    />
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
              <TableCell colSpan={3}>
                <div className={styles.empty}>{t("campusesEmpty")}</div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </AdminSection>
  )
}
