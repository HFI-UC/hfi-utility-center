"use client"

import { useForm } from "react-hook-form"
import { Bell, BellOff, Plus, Power, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RhfSelect } from "@/components/rhf-select"
import { ConfirmAction } from "@/components/action-dialogs"
import type { Admin, Room } from "@/lib/api/types"
import {
  createApprover,
  deleteApprover,
  toggleApproverNotifications,
} from "@/lib/api/admins"
import { createPolicy, deletePolicy, togglePolicy } from "@/lib/api/catalog"

type Props = {
  rooms: Room[]
  admins: Admin[]
  reload: () => Promise<void>
  report: (value?: string) => void
}

export function PolicyEditor({ rooms, reload, report }: Props) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const weekdays = t("policyWeekdays").split(",")
  const form = useForm<{
    room: string
    day: string
    start: string
    end: string
  }>({ defaultValues: { day: "1", start: "08:00", end: "18:00" } })
  return (
    <section>
      <h2 className="border-b pb-3 text-lg font-semibold">
        {t("roomPolicies")}
      </h2>
      <form
        className="grid gap-2 py-4 sm:grid-cols-2 xl:grid-cols-[1fr_7rem_8rem_8rem_auto]"
        onSubmit={form.handleSubmit(async ({ room, day, start, end }) => {
          const [sh, sm] = start.split(":").map(Number)
          const [eh, em] = end.split(":").map(Number)
          try {
            await createPolicy(Number(room), [Number(day)], [sh, sm], [eh, em])
            await reload()
          } catch (error) {
            report(error instanceof Error ? error.message : undefined)
          }
        })}
      >
        <RhfSelect
          control={form.control}
          name="room"
          placeholder={t("selectRoom")}
          options={rooms.map((room) => ({
            value: String(room.id),
            label: room.name,
          }))}
        />
        <RhfSelect
          control={form.control}
          name="day"
          placeholder={t("selectDay")}
          options={weekdays.map((day, index) => ({
            value: String(index),
            label: day,
          }))}
        />
        <Input type="time" {...form.register("start", { required: true })} />
        <Input type="time" {...form.register("end", { required: true })} />
        <Button>
          <Plus />
          {common("add")}
        </Button>
      </form>
      <div className="divide-y border-t">
        {rooms.flatMap((room) =>
          room.policies.map((policy) => (
            <div
              key={policy.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{room.name}</p>
                <p className="text-xs text-muted-foreground">
                  {policy.days.map((day) => weekdays[day]).join("、")} ·{" "}
                  {String(policy.startTime[0]).padStart(2, "0")}:
                  {String(policy.startTime[1]).padStart(2, "0")}–
                  {String(policy.endTime[0]).padStart(2, "0")}:
                  {String(policy.endTime[1]).padStart(2, "0")} ·{" "}
                  {policy.enabled ? common("enabled") : common("disabled")}
                </p>
              </div>
              <div className="flex">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  title={t("togglePolicy")}
                  onClick={async () => {
                    await togglePolicy(policy.id)
                    await reload()
                  }}
                >
                  <Power />
                </Button>
                <ConfirmAction
                  title={t("deletePolicy")}
                  description={t("confirmDelete", { name: t("roomPolicies") })}
                  cancelLabel={common("cancel")}
                  confirmLabel={common("delete")}
                  onConfirm={async () => {
                    await deletePolicy(policy.id)
                    await reload()
                  }}
                >
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title={t("deletePolicy")}
                  >
                    <Trash2 />
                  </Button>
                </ConfirmAction>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export function ApproverEditor({ rooms, admins, reload, report }: Props) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const form = useForm<{ room: string; admin: string }>()
  return (
    <section>
      <h2 className="border-b pb-3 text-lg font-semibold">{t("approvers")}</h2>
      <form
        className="grid gap-2 py-4 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={form.handleSubmit(async ({ room, admin }) => {
          try {
            await createApprover(Number(room), Number(admin))
            await reload()
          } catch (error) {
            report(error instanceof Error ? error.message : undefined)
          }
        })}
      >
        <RhfSelect
          control={form.control}
          name="room"
          placeholder={t("selectRoom")}
          options={rooms.map((room) => ({
            value: String(room.id),
            label: room.name,
          }))}
        />
        <RhfSelect
          control={form.control}
          name="admin"
          placeholder={t("selectAdmin")}
          options={admins.map((admin) => ({
            value: String(admin.id),
            label: `${admin.name} · ${admin.email}`,
          }))}
        />
        <Button>
          <Plus />
          {common("add")}
        </Button>
      </form>
      <div className="divide-y border-t">
        {rooms.flatMap((room) =>
          (room.approvers ?? []).map((approver) => {
            const admin = admins.find((item) => item.id === approver.adminId)
            return (
              <div
                key={approver.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {room.name} ·{" "}
                    {admin?.name ?? t("adminNumber", { id: approver.adminId })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {approver.notificationsEnabled
                      ? t("notificationsOn")
                      : t("notificationsOff")}
                  </p>
                </div>
                <div className="flex">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title={t("toggleNotifications")}
                    onClick={async () => {
                      await toggleApproverNotifications(approver.id)
                      await reload()
                    }}
                  >
                    {approver.notificationsEnabled ? <Bell /> : <BellOff />}
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title={t("removeApprover")}
                    onClick={async () => {
                      await deleteApprover(approver.id)
                      await reload()
                    }}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
