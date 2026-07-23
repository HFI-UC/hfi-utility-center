"use client"

import { useCallback, useEffect, useState } from "react"
import { KeyRound, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"
import { AdminPageHeader } from "@/components/admin-page-header"
import { ConfirmAction, TextActionDialog } from "@/components/action-dialogs"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  changeAdminPassword,
  createAdmin,
  deleteAdmin,
  editAdmin,
  getAdmins,
} from "@/lib/api/admins"
import type { Admin } from "@/lib/api/types"

type CreateFields = { name: string; email: string; password: string }

function EditAdminDialog({
  admin,
  onSave,
}: {
  admin: Admin
  onSave: (name: string, email: string) => Promise<void>
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [open, setOpen] = useState(false)
  const form = useForm<{ name: string; email: string }>({
    defaultValues: { name: admin.name, email: admin.email },
  })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) form.reset({ name: admin.name, email: admin.email })
  }

  async function submit({ name, email }: { name: string; email: string }) {
    await onSave(name.trim(), email.trim())
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Pencil />
          {common("edit")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{common("edit")}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
          {(["name", "email"] as const).map((name) => (
            <Controller
              key={name}
              control={form.control}
              name={name}
              rules={{ required: t("fieldRequired") }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${field.name}-${admin.id}`}>
                    {t(name === "name" ? "adminName" : "adminEmail")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`${field.name}-${admin.id}`}
                    type={name === "email" ? "email" : "text"}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          ))}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {common("cancel")}
              </Button>
            </DialogClose>
            <Button type="submit">{common("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminUsersPage() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [admins, setAdmins] = useState<Admin[]>([])
  const [error, setError] = useState<string>()
  const [notice, setNotice] = useState<string>()
  const form = useForm<CreateFields>({
    defaultValues: { name: "", email: "", password: "" },
  })
  const load = useCallback(async () => {
    try {
      setAdmins(await getAdmins())
      setError(undefined)
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t("usersLoadError")
      )
    }
  }, [t])
  useEffect(() => {
    // Data updates occur after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load()
  }, [load])

  async function run(action: () => Promise<unknown>, success: string) {
    try {
      await action()
      setNotice(success)
      setError(undefined)
      await load()
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : common("unknown")
      )
      setNotice(undefined)
    }
  }

  async function createAccount(values: CreateFields) {
    await run(
      () => createAdmin(values.name, values.email, values.password),
      t("adminCreated")
    )
    form.reset()
  }

  return (
    <main>
      <AdminPageHeader
        title={t("usersTitle")}
        description={t("usersDescription")}
        actions={
          <Button variant="outline" onClick={() => void load()}>
            <RefreshCw />
            {common("refresh")}
          </Button>
        }
      />
      <section className="border-b py-7">
        <h2 className="text-lg font-semibold">{t("addAdmin")}</h2>
        <form
          className="mt-4 grid gap-3 md:grid-cols-4"
          onSubmit={form.handleSubmit(createAccount)}
        >
          {(["name", "email", "password"] as const).map((name) => (
            <Controller
              key={name}
              control={form.control}
              name={name}
              rules={{
                required: t("fieldRequired"),
                minLength: name === "password" ? 6 : undefined,
              }}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`new-admin-${name}`}>
                    {t(name === "password" ? "initialPassword" : name)}
                  </FieldLabel>
                  <Input
                    {...field}
                    id={`new-admin-${name}`}
                    type={
                      name === "password"
                        ? "password"
                        : name === "email"
                          ? "email"
                          : "text"
                    }
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          ))}
          <Button className="self-end">
            <Plus />
            {t("addAccount")}
          </Button>
        </form>
      </section>
      {error ? (
        <p className="border-b py-3 text-sm text-destructive">{error}</p>
      ) : null}
      {notice ? (
        <p className="border-b py-3 text-sm text-foreground">{notice}</p>
      ) : null}
      <div className="divide-y">
        {admins.map((admin) => (
          <article
            key={admin.id}
            className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
          >
            <div>
              <p className="font-semibold">{admin.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {admin.email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <EditAdminDialog
                admin={admin}
                onSave={(name, email) =>
                  run(() => editAdmin(admin.id, name, email), t("adminUpdated"))
                }
              />
              <TextActionDialog
                title={t("changePassword")}
                label={t("newPassword")}
                inputType="password"
                cancelLabel={common("cancel")}
                saveLabel={common("save")}
                onSave={(password) =>
                  run(
                    () => changeAdminPassword(admin.id, password),
                    t("passwordUpdated")
                  )
                }
              >
                <Button size="sm" variant="outline">
                  <KeyRound />
                  {t("changePassword")}
                </Button>
              </TextActionDialog>
              <ConfirmAction
                title={common("delete")}
                description={t("confirmDelete", { name: admin.name })}
                cancelLabel={common("cancel")}
                confirmLabel={common("delete")}
                onConfirm={() =>
                  run(() => deleteAdmin(admin.id), t("adminDeleted"))
                }
              >
                <Button size="sm" variant="destructive">
                  <Trash2 />
                  {common("delete")}
                </Button>
              </ConfirmAction>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
