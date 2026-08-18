"use client"

import { CalendarClock, Plus, Power, Trash2 } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { AdminMutation } from "@/lib/api/admin-hooks"
import { createPolicy, deletePolicy, togglePolicy } from "@/lib/api/catalog"
import type { Room } from "@/lib/api/types"

type PolicyForm = { day: string; start: string; end: string }

export function PolicyEditor({
  room,
  mutate,
  working,
}: {
  room: Room
  mutate: AdminMutation
  working: boolean
}) {
  const t = useTranslations("admin")
  const common = useTranslations("common")
  const weekdays = t("policyWeekdays").split(",")
  const form = useForm<PolicyForm>({
    defaultValues: { day: "1", start: "08:00", end: "18:00" },
  })

  async function createRoomPolicy({ day, start, end }: PolicyForm) {
    if (timeInMinutes(end) <= timeInMinutes(start)) {
      form.setError("end", { message: t("policyEndAfterStart") })
      return
    }

    const created = await mutate(() =>
      createPolicy(room.id, [Number(day)], parseTime(start), parseTime(end))
    )
    if (created) form.reset()
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CalendarClock />
          {room.policies.length}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {room.name} · {t("roomPolicies")}
          </DialogTitle>
          <DialogDescription>{t("policyDialogDescription")}</DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
          onSubmit={form.handleSubmit(createRoomPolicy)}
        >
          <Controller
            control={form.control}
            name="day"
            rules={{ required: t("fieldRequired") }}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`policy-day-${room.id}`}>
                  {t("selectDay")}
                </FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id={`policy-day-${room.id}`}
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
          <Controller
            control={form.control}
            name="start"
            rules={{ required: t("fieldRequired") }}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`policy-start-${room.id}`}>
                  {t("policyStart")}
                </FieldLabel>
                <Input
                  {...field}
                  id={`policy-start-${room.id}`}
                  type="time"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="end"
            rules={{ required: t("fieldRequired") }}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`policy-end-${room.id}`}>
                  {t("policyEnd")}
                </FieldLabel>
                <Input
                  {...field}
                  id={`policy-end-${room.id}`}
                  type="time"
                  aria-invalid={fieldState.invalid}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Button className="self-end" disabled={working}>
            <Plus />
            {common("add")}
          </Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("id")}</TableHead>
              <TableHead>{t("selectDay")}</TableHead>
              <TableHead>{t("time")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {room.policies.length ? (
              room.policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>#{policy.id}</TableCell>
                  <TableCell>
                    {policy.days.map((day) => weekdays[day]).join("、")}
                  </TableCell>
                  <TableCell>
                    {formatTime(policy.startTime)}–{formatTime(policy.endTime)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        policy.enabled
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {policy.enabled ? common("enabled") : common("disabled")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
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
                            <AlertDialogTitle>
                              {t("deletePolicy")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("confirmDelete", {
                                name: t("roomPolicies"),
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {common("cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() =>
                                mutate(() => deletePolicy(policy.id))
                              }
                            >
                              {common("delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {t("policiesEmpty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
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
