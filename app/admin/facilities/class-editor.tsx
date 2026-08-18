"use client"

import { useState } from "react"
import { Pencil, Plus } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Controller, useForm, type Control } from "react-hook-form"

import { AdminSection } from "@/app/admin/admin-shell"
import { TextActionDialog } from "@/app/admin/text-action-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  working,
}: FacilityEditorActions & {
  classes: SchoolClass[]
  campuses: Campus[]
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [open, setOpen] = useState(false)
  const form = useForm<ClassForm>({
    defaultValues: { name: "", campus: "" },
  })
  const campusNames = new Map(
    campuses.map((campus) => [campus.id, campus.name])
  )
  const dateFormatter = new Intl.DateTimeFormat(useLocale(), {
    dateStyle: "medium",
  })

  async function createNewClass({ name, campus }: ClassForm) {
    const created = await mutate(
      () => createClass(name.trim(), Number(campus)),
      t("classCreated")
    )
    if (created) {
      form.reset()
      setOpen(false)
    }
  }

  return (
    <AdminSection
      title={t("classes")}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon-sm" disabled={working}>
              <Plus />
              <span className="sr-only">{common("add")}</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("newClass")}</DialogTitle>
              <DialogDescription>{t("newClassDescription")}</DialogDescription>
            </DialogHeader>
            <form
              className="grid gap-4"
              onSubmit={form.handleSubmit(createNewClass)}
            >
              <Controller
                control={form.control}
                name="name"
                rules={{
                  validate: (name) =>
                    Boolean(name.trim()) || t("fieldRequired"),
                }}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="new-class-name">
                      {t("className")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="new-class-name"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <CampusField control={form.control} campuses={campuses} />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{common("cancel")}</Button>
                </DialogClose>
                <Button disabled={working}>{common("add")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="hidden sm:table-cell">{t("id")}</TableHead>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("campus")}</TableHead>
            <TableHead className="hidden md:table-cell">
              {t("createdAt")}
            </TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.length ? (
            classes.map((schoolClass) => (
              <TableRow key={schoolClass.id}>
                <TableCell className="hidden sm:table-cell">
                  #{schoolClass.id}
                </TableCell>
                <TableCell className="font-medium">
                  {schoolClass.name}
                </TableCell>
                <TableCell>{campusNames.get(schoolClass.campus)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {schoolClass.createdAt
                    ? dateFormatter.format(new Date(schoolClass.createdAt))
                    : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <TextActionDialog
                      title={t("renameClass")}
                      label={t("className")}
                      initialValue={schoolClass.name}
                      cancelLabel={common("cancel")}
                      saveLabel={common("save")}
                      onSave={(name) =>
                        mutate(
                          () =>
                            editClass(
                              schoolClass.id,
                              name,
                              schoolClass.campus
                            ),
                          t("classUpdated")
                        )
                      }
                    >
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title={t("renameClass")}
                        disabled={working}
                      >
                        <Pencil />
                      </Button>
                    </TextActionDialog>
                    <ConfirmFacilityDelete
                      label={schoolClass.name}
                      action={() => deleteClass(schoolClass.id)}
                      mutate={mutate}
                      working={working}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {t("classesEmpty")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </AdminSection>
  )
}

function CampusField({
  control,
  campuses,
}: {
  control: Control<ClassForm>
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
          <FieldLabel htmlFor="new-class-campus">
            {t("selectCampus")}
          </FieldLabel>
          <Select
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              id="new-class-campus"
              aria-invalid={fieldState.invalid}
            >
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
