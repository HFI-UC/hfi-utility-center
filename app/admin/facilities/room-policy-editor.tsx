"use client"

import { Plus, Power, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"

import { ConfirmAction } from "@/components/action-dialogs"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AdminMutation } from "@/features/admin/use-admin-mutation"
import { createPolicy, deletePolicy, togglePolicy } from "@/lib/api/catalog"
import type { Room } from "@/lib/api/types"

type PolicyForm = {
  room: string
  day: string
  start: string
  end: string
}

export function PolicyEditor({
  rooms,
  mutate,
  workingKey,
}: {
  rooms: Room[]
  mutate: AdminMutation
  workingKey?: string
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const weekdays = t("policyWeekdays").split(",")
  const form = useForm<PolicyForm>({
    defaultValues: { room: "", day: "1", start: "08:00", end: "18:00" },
  })

  async function createRoomPolicy({ room, day, start, end }: PolicyForm) {
    const created = await mutate("policy:create", () =>
      createPolicy(
        Number(room),
        [Number(day)],
        parseTime(start),
        parseTime(end)
      )
    )
    if (created) form.reset()
  }

  return (
    <section>
      <h2 className="border-b pb-3 text-lg font-semibold">
        {t("roomPolicies")}
      </h2>
      <form
        className="grid gap-2 py-4 sm:grid-cols-2 xl:grid-cols-[1fr_7rem_8rem_8rem_auto]"
        onSubmit={form.handleSubmit(createRoomPolicy)}
      >
        <Controller
          control={form.control}
          name="room"
          rules={{ required: t("fieldRequired") }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onOpenChange={(open) => !open && field.onBlur()}
              >
                <SelectTrigger
                  ref={field.ref}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder={t("selectRoom")} />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={String(room.id)}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="day"
          rules={{ required: t("fieldRequired") }}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                onOpenChange={(open) => !open && field.onBlur()}
              >
                <SelectTrigger
                  ref={field.ref}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder={t("selectDay")} />
                </SelectTrigger>
                <SelectContent>
                  {weekdays.map((weekday, index) => (
                    <SelectItem key={weekday} value={String(index)}>
                      {weekday}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        {(["start", "end"] as const).map((name) => (
          <Controller
            key={name}
            control={form.control}
            name={name}
            rules={{ required: t("fieldRequired") }}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="sr-only" htmlFor={`policy-${name}`}>
                  {t(name === "start" ? "policyStart" : "policyEnd")}
                </FieldLabel>
                <Input
                  {...field}
                  id={`policy-${name}`}
                  type="time"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        ))}
        <Button disabled={Boolean(workingKey)}>
          <Plus />
          {common("add")}
        </Button>
      </form>
      <div className="divide-y border-t">
        {rooms.flatMap((room) =>
          room.policies.map((policy) => {
            const toggleKey = `policy:${policy.id}:toggle`
            const deleteKey = `policy:${policy.id}:delete`
            return (
              <div
                key={policy.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{room.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {policy.days.map((day) => weekdays[day]).join("、")} ·{" "}
                    {formatTime(policy.startTime)}–{formatTime(policy.endTime)}{" "}
                    · {policy.enabled ? common("enabled") : common("disabled")}
                  </p>
                </div>
                <div className="flex">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    title={t("togglePolicy")}
                    disabled={Boolean(workingKey)}
                    onClick={() =>
                      void mutate(toggleKey, () => togglePolicy(policy.id))
                    }
                  >
                    <Power />
                  </Button>
                  <ConfirmAction
                    title={t("deletePolicy")}
                    description={t("confirmDelete", {
                      name: t("roomPolicies"),
                    })}
                    cancelLabel={common("cancel")}
                    confirmLabel={common("delete")}
                    onConfirm={() =>
                      mutate(deleteKey, () => deletePolicy(policy.id))
                    }
                  >
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title={t("deletePolicy")}
                      disabled={Boolean(workingKey)}
                    >
                      <Trash2 />
                    </Button>
                  </ConfirmAction>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

function parseTime(value: string) {
  return value.split(":").map(Number)
}

function formatTime([hour, minute]: number[]) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}
