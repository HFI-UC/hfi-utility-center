"use client"

import { Plus, Power, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import type { AdminMutation } from "@/lib/api/admin-hooks"
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
  working,
}: {
  rooms: Room[]
  mutate: AdminMutation
  working: boolean
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const weekdays = t("policyWeekdays").split(",")
  const form = useForm<PolicyForm>({
    defaultValues: { room: "", day: "1", start: "08:00", end: "18:00" },
  })
  const { errors } = form.formState

  async function createRoomPolicy({ room, day, start, end }: PolicyForm) {
    const startMinutes = timeInMinutes(start)
    const endMinutes = timeInMinutes(end)
    if (endMinutes <= startMinutes) {
      form.setError("end", { message: t("policyEndAfterStart") })
      return
    }
    form.clearErrors("end")

    const created = await mutate(() =>
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
          render={({
            field: { onBlur, onChange, ref, ...field },
            fieldState,
          }) => (
            <Field data-invalid={fieldState.invalid}>
              <Select
                {...field}
                onValueChange={onChange}
                onOpenChange={(open) => !open && onBlur()}
              >
                <SelectTrigger ref={ref} aria-invalid={fieldState.invalid}>
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
          render={({
            field: { onBlur, onChange, ref, ...field },
            fieldState,
          }) => (
            <Field data-invalid={fieldState.invalid}>
              <Select
                {...field}
                onValueChange={onChange}
                onOpenChange={(open) => !open && onBlur()}
              >
                <SelectTrigger ref={ref} aria-invalid={fieldState.invalid}>
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
        <Field data-invalid={Boolean(errors.start)}>
          <FieldLabel className="sr-only" htmlFor="policy-start">
            {t("policyStart")}
          </FieldLabel>
          <Input
            {...form.register("start", { required: t("fieldRequired") })}
            id="policy-start"
            type="time"
            aria-invalid={Boolean(errors.start)}
          />
          <FieldError errors={[errors.start]} />
        </Field>
        <Field data-invalid={Boolean(errors.end)}>
          <FieldLabel className="sr-only" htmlFor="policy-end">
            {t("policyEnd")}
          </FieldLabel>
          <Input
            {...form.register("end", { required: t("fieldRequired") })}
            id="policy-end"
            type="time"
            aria-invalid={Boolean(errors.end)}
          />
          <FieldError errors={[errors.end]} />
        </Field>
        <Button disabled={working}>
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
                  {formatTime(policy.startTime)}–{formatTime(policy.endTime)} ·{" "}
                  {policy.enabled ? common("enabled") : common("disabled")}
                </p>
              </div>
              <div className="flex">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  title={t("togglePolicy")}
                  disabled={working}
                  onClick={() => mutate(() => togglePolicy(policy.id))}
                >
                  <Power />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title={t("deletePolicy")}
                      disabled={working}
                    >
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("deletePolicy")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("confirmDelete", { name: t("roomPolicies") })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{common("cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => mutate(() => deletePolicy(policy.id))}
                      >
                        {common("delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

function parseTime(value: string): [number, number] {
  const [hours, minutes] = value.split(":").map(Number)
  return [hours, minutes]
}

function timeInMinutes(value: string) {
  const [hours, minutes] = parseTime(value)
  return hours * 60 + minutes
}

function formatTime([hour, minute]: number[]) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}
