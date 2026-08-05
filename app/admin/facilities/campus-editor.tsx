"use client"

import { Pencil, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"

import { TextActionDialog } from "@/app/admin/text-action-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
  const form = useForm<{ name: string }>({ defaultValues: { name: "" } })
  const nameError = form.formState.errors.name

  async function createNewCampus({ name }: { name: string }) {
    const created = await mutate(() => createCampus(name.trim()))
    if (created) form.reset()
  }

  return (
    <section>
      <h2 className="border-b pb-3 text-lg font-semibold">{t("campuses")}</h2>
      <form
        className="flex gap-2 py-4"
        onSubmit={form.handleSubmit(createNewCampus)}
      >
        <Field className="flex-1" data-invalid={Boolean(nameError)}>
          <Input
            {...form.register("name", {
              validate: (name) => Boolean(name.trim()) || t("fieldRequired"),
            })}
            placeholder={t("newCampus")}
            aria-invalid={Boolean(nameError)}
          />
          <FieldError errors={[nameError]} />
        </Field>
        <Button disabled={working}>
          <Plus />
          {common("add")}
        </Button>
      </form>
      <div className="divide-y border-t">
        {campuses.map((campus) => (
          <div
            key={campus.id}
            className="flex items-center justify-between gap-3 py-3"
          >
            <span className="text-sm font-medium">{campus.name}</span>
            <div className="flex">
              <TextActionDialog
                title={t("renameCampus")}
                label={t("campusName")}
                initialValue={campus.name}
                cancelLabel={common("cancel")}
                saveLabel={common("save")}
                onSave={(name) => mutate(() => editCampus(campus.id, name))}
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
          </div>
        ))}
      </div>
    </section>
  )
}
