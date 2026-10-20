"use client"

import { Pencil, Plus, School } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useMemo, useState } from "react"

import { EmptyState } from "@/components/layout/data-state"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createCampus, deleteCampus, editCampus, restoreCampus } from "@/lib/api/catalog"
import type { Campus } from "@/lib/api/types"
import { formatApiTimestamp } from "@/lib/date-time"

import {
  FacilityRowMenu,
  RestoreFacilityButton,
  ResourceSection,
  type FacilityEditorActions,
  touchTarget,
} from "./facility-editor-actions"
import { FacilityNameDialog } from "./name-dialog"

export function CampusEditor({
  campuses,
  mutate,
  working,
}: FacilityEditorActions & { campuses: Campus[] }) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const locale = useLocale()
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
      }),
    [locale],
  )
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const editing = campuses.find((campus) => campus.id === editingId)

  return (
    <ResourceSection
      title={t("campuses")}
      count={campuses.length}
      action={
        <Button
          variant="outline"
          size="sm"
          disabled={working}
          onClick={() => setCreateOpen(true)}
          className={touchTarget}
        >
          <Plus aria-hidden />
          {common("add")}
        </Button>
      }
    >
      {campuses.length === 0 ? (
        <EmptyState icon={School} title={t("campusesEmpty")} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("facilityName")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("createdAt")}</TableHead>
              <TableHead className="w-0 text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campuses.map((campus) => (
              <TableRow key={campus.id}>
                <TableCell>
                  <span className="block max-w-[16rem] truncate font-medium">
                    {campus.name}
                    {campus.deletedAt ? (
                      <span className="ml-2 text-xs text-amber-700">{t("archived")}</span>
                    ) : null}
                  </span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    #{campus.id}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatApiTimestamp(dateFormatter, campus.createdAt)}
                </TableCell>
                <TableCell className="w-0 text-right">
                  {campus.deletedAt ? (
                    <RestoreFacilityButton
                      action={() => restoreCampus(campus.id)}
                      mutate={mutate}
                      working={working}
                    />
                  ) : (
                    <CampusRowMenu
                      campus={campus}
                      mutate={mutate}
                      working={working}
                      onEdit={() => setEditingId(campus.id)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <FacilityNameDialog
        key="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        title={t("newCampus")}
        label={t("campusName")}
        working={working}
        onSave={(name) => mutate(() => createCampus(name), t("campusCreated"))}
      />
      {editing ? (
        <FacilityNameDialog
          key={editing.id}
          open
          onOpenChange={(nextOpen) => !nextOpen && setEditingId(null)}
          mode="edit"
          title={t("renameCampus")}
          label={t("campusName")}
          initialValue={editing.name}
          working={working}
          onSave={(name) => mutate(() => editCampus(editing.id, name), t("campusUpdated"))}
        />
      ) : null}
    </ResourceSection>
  )
}

function CampusRowMenu({
  campus,
  mutate,
  working,
  onEdit,
}: FacilityEditorActions & {
  campus: Campus
  onEdit: () => void
}) {
  const common = useTranslations("common")

  return (
    <FacilityRowMenu
      label={campus.name}
      action={() => deleteCampus(campus.id)}
      mutate={mutate}
      working={working}
    >
      <DropdownMenuItem onSelect={onEdit} disabled={working}>
        <Pencil aria-hidden />
        {common("edit")}
      </DropdownMenuItem>
    </FacilityRowMenu>
  )
}
