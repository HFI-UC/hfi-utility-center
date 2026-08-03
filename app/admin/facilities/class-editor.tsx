"use client"

import { Pencil, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"

import { TextActionDialog } from "@/components/action-dialogs"
import { Button } from "@/components/ui/button"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClass, deleteClass, editClass } from "@/lib/api/catalog"
import type { Campus, SchoolClass } from "@/lib/api/types"

import {
  ConfirmFacilityDelete,
  type FacilityEditorActions,
} from "./facility-editor-actions"

type ClassForm = { name: string; campus: string }

export function ClassEditor({
  classes,
  campuses,
  mutate,
  workingKey,
}: FacilityEditorActions & {
  classes: SchoolClass[]
  campuses: Campus[]
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const form = useForm<ClassForm>({
    defaultValues: { name: "", campus: "" },
  })
  const campusNames = new Map(
    campuses.map((campus) => [campus.id, campus.name])
  )

  async function createNewClass({ name, campus }: ClassForm) {
    const created = await mutate("class:create", () =>
      createClass(name, Number(campus))
    )
    if (created) form.reset()
  }

  return (
    <section>
      <h2 className="border-b pb-3 text-lg font-semibold">{t("classes")}</h2>
      <form
        className="grid gap-2 py-4 sm:grid-cols-[1fr_10rem_auto]"
        onSubmit={form.handleSubmit(createNewClass)}
      >
        <Controller
          control={form.control}
          name="name"
          rules={{ required: t("fieldRequired") }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                placeholder={t("newClass")}
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <CampusField control={form.control} campuses={campuses} />
        <Button disabled={Boolean(workingKey)}>
          <Plus />
          {common("add")}
        </Button>
      </form>
      <div className="divide-y border-t">
        {classes.map((schoolClass) => {
          const editKey = `class:${schoolClass.id}:edit`
          const deleteKey = `class:${schoolClass.id}:delete`
          return (
            <div
              key={schoolClass.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div>
                <p className="text-sm font-medium">{schoolClass.name}</p>
                <p className="text-xs text-muted-foreground">
                  {campusNames.get(schoolClass.campus)}
                </p>
              </div>
              <div className="flex">
                <TextActionDialog
                  title={t("renameClass")}
                  label={t("className")}
                  initialValue={schoolClass.name}
                  cancelLabel={common("cancel")}
                  saveLabel={common("save")}
                  onSave={(name) =>
                    mutate(editKey, () =>
                      editClass(schoolClass.id, name, schoolClass.campus)
                    )
                  }
                >
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title={t("renameClass")}
                    disabled={Boolean(workingKey)}
                  >
                    <Pencil />
                  </Button>
                </TextActionDialog>
                <ConfirmFacilityDelete
                  mutationKey={deleteKey}
                  label={schoolClass.name}
                  action={() => deleteClass(schoolClass.id)}
                  mutate={mutate}
                  workingKey={workingKey}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function CampusField({
  control,
  campuses,
}: {
  control: ReturnType<typeof useForm<ClassForm>>["control"]
  campuses: Campus[]
}) {
  const t = useTranslations("admin")
  return (
    <Controller
      control={control}
      name="campus"
      rules={{ required: t("fieldRequired") }}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <Select
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
            onOpenChange={(open) => !open && field.onBlur()}
          >
            <SelectTrigger ref={field.ref} aria-invalid={fieldState.invalid}>
              <SelectValue placeholder={t("selectCampus")} />
            </SelectTrigger>
            <SelectContent>
              {campuses.map((campus) => (
                <SelectItem key={campus.id} value={String(campus.id)}>
                  {campus.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  )
}
