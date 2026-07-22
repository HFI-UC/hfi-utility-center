"use client"

import { useCallback, useEffect, useState } from "react"
import { KeyRound, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { AdminPageHeader } from "@/components/admin-page-header"
import { ConfirmAction, TextActionDialog } from "@/components/action-dialogs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async ({ name, email }) => {
            await onSave(name.trim(), email.trim())
            setOpen(false)
          })}
        >
          <div className="space-y-2">
            <Label htmlFor={`admin-name-${admin.id}`}>{t("adminName")}</Label>
            <Input
              id={`admin-name-${admin.id}`}
              {...form.register("name", { required: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`admin-email-${admin.id}`}>{t("adminEmail")}</Label>
            <Input
              id={`admin-email-${admin.id}`}
              type="email"
              {...form.register("email", { required: true })}
            />
          </div>
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

export function AdminUsers() {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const [admins, setAdmins] = useState<Admin[]>([])
  const [error, setError] = useState<string>()
  const [notice, setNotice] = useState<string>()
  const form = useForm<CreateFields>()
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
    void Promise.resolve().then(load)
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
          onSubmit={form.handleSubmit(async (values) => {
            await run(
              () => createAdmin(values.name, values.email, values.password),
              t("adminCreated")
            )
            form.reset()
          })}
        >
          <div>
            <Label htmlFor="admin-name">{t("name")}</Label>
            <Input
              id="admin-name"
              className="mt-1"
              {...form.register("name", { required: true })}
            />
          </div>
          <div>
            <Label htmlFor="admin-email">{t("email")}</Label>
            <Input
              id="admin-email"
              className="mt-1"
              type="email"
              {...form.register("email", { required: true })}
            />
          </div>
          <div>
            <Label htmlFor="admin-password">{t("initialPassword")}</Label>
            <Input
              id="admin-password"
              className="mt-1"
              type="password"
              minLength={6}
              {...form.register("password", { required: true })}
            />
          </div>
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
