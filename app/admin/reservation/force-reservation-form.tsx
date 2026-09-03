"use client"

import { useEffect, useMemo, useState } from "react"
import { enUS, zhCN } from "date-fns/locale"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarPlus,
  Check,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { ChoiceGrid } from "@/app/reservation/create/choice-grid"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { getAdmins } from "@/lib/api/admins"
import { getRememberedAdminEmail } from "@/lib/api/auth"
import { getCatalog } from "@/lib/api/catalog"
import { createReservation } from "@/lib/api/reservations"
import type { Admin, CatalogData } from "@/lib/api/types"
import { dateToInputValue, inputValueToDate } from "@/lib/date-time"

type ForceReservationData = CatalogData & { admins: Admin[] }

type ForceReservationValues = {
  classId: number
  campusId: number
  roomId: number
  date: string
  startTime: number
  endTime: number
  reason: string
}

const initialValues: ForceReservationValues = {
  classId: 0,
  campusId: 0,
  roomId: 0,
  date: "",
  startTime: 0,
  endTime: 0,
  reason: "",
}

const steps = ["class", "location", "dateTime", "reason", "review"] as const

async function loadForceReservationData(): Promise<ForceReservationData> {
  const [catalog, admins] = await Promise.all([getCatalog(), getAdmins()])
  return { ...catalog, admins }
}

export function ForceReservationForm({
  onCreated,
}: {
  onCreated?: () => Promise<void>
}) {
  const t = useTranslations("admin")
  const locale = useLocale()
  const [data, setData] = useState<ForceReservationData>()
  const [loading, setLoading] = useState(true)
  const [values, setValues] = useState(initialValues)
  const [stepIndex, setStepIndex] = useState(0)
  const [identityEmail, setIdentityEmail] = useState("")
  const [error, setError] = useState<string>()
  const [working, setWorking] = useState(false)
  const [reservationId, setReservationId] = useState<number>()

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const result = await loadForceReservationData()
        if (!active) return
        setData(result)
        const rememberedEmail = getRememberedAdminEmail()?.toLowerCase()
        const rememberedAdmin = result.admins.find(
          (admin) => admin.email.toLowerCase() === rememberedEmail
        )
        if (rememberedAdmin) setIdentityEmail(rememberedAdmin.email)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  const admin = data?.admins.find((item) => item.email === identityEmail)
  const currentStep = steps[stepIndex]
  const selectedClass = data?.classes.find((item) => item.id === values.classId)
  const selectedCampus = data?.campuses.find(
    (item) => item.id === values.campusId
  )
  const selectedRoom = data?.rooms.find((item) => item.id === values.roomId)
  const today = useMemo(() => startOfToday(), [])
  const maximumDate = useMemo(() => addDays(today, 30), [today])
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [locale]
  )
  const dateTimeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale]
  )
  const timeOptions = useMemo(
    () => buildForceTimeOptions(values.date),
    [values.date]
  )

  function update(nextValues: Partial<ForceReservationValues>) {
    setValues((current) => ({ ...current, ...nextValues }))
    setError(undefined)
  }

  function validateCurrentStep() {
    if (!admin) return t("forceIdentityRequired")
    if (currentStep === "class" && !values.classId) {
      return t("forceClassRequired")
    }
    if (currentStep === "location" && (!values.campusId || !values.roomId)) {
      return t("forceRoomRequired")
    }
    if (
      currentStep === "dateTime" &&
      (!values.date || !values.startTime || !values.endTime)
    ) {
      return t("forceTimeRequired")
    }
    if (currentStep === "reason" && !values.reason.trim()) {
      return t("forceReasonRequired")
    }
    return undefined
  }

  function nextStep() {
    const validationError = validateCurrentStep()
    if (validationError) {
      setError(validationError)
      return
    }
    setStepIndex((current) => Math.min(current + 1, steps.length - 1))
  }

  function previousStep() {
    setError(undefined)
    setStepIndex((current) => Math.max(0, current - 1))
  }

  function selectTime(timestamp: number) {
    if (!values.startTime || values.endTime || timestamp <= values.startTime) {
      update({ startTime: timestamp, endTime: 0 })
      return
    }

    if (timestamp - values.startTime > 2 * 60 * 60) {
      setError(t("forceDurationExceeded"))
      return
    }
    update({ endTime: timestamp })
  }

  async function submitReservation() {
    if (!admin || !selectedRoom || !selectedClass) {
      setError(t("forceIdentityRequired"))
      return
    }

    setWorking(true)
    setError(undefined)
    try {
      const result = await createReservation({
        classId: values.classId,
        room: values.roomId,
        studentName: admin.name,
        studentId: "GJ00000000",
        email: admin.email,
        reason: values.reason.trim(),
        startTime: values.startTime,
        endTime: values.endTime,
      })
      setReservationId(result.reservationId)
      await onCreated?.()
    } finally {
      setWorking(false)
    }
  }

  function reset() {
    setValues(initialValues)
    setStepIndex(0)
    setReservationId(undefined)
    setError(undefined)
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (reservationId !== undefined) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="size-5" />
            {t("forceSuccessTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("forceSuccessDescription", { id: reservationId })}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={reset}>
            <CalendarPlus />
            {t("forceCreateAnother")}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="font-medium">{t(`forceStep.${currentStep}`)}</span>
          <span className="text-muted-foreground">
            {t("forceStepProgress", {
              current: stepIndex + 1,
              total: steps.length,
            })}
          </span>
        </div>
        <Progress
          className="mt-3"
          value={((stepIndex + 1) / steps.length) * 100}
        />
      </div>

      {!admin ? (
        <Alert>
          <AlertTriangle />
          <AlertTitle>{t("forceIdentityMissingTitle")}</AlertTitle>
          <AlertDescription>
            {t("forceIdentityMissingDescription")}
          </AlertDescription>
          <div className="col-span-2 mt-3">
            <Select value={identityEmail} onValueChange={setIdentityEmail}>
              <SelectTrigger className="w-full sm:max-w-md">
                <SelectValue placeholder={t("forceSelectIdentity")} />
              </SelectTrigger>
              <SelectContent>
                {data.admins.map((item) => (
                  <SelectItem key={item.id} value={item.email}>
                    {item.name} · {item.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Alert>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("forceActingAs", { name: admin.name, email: admin.email })}
        </p>
      )}

      <Card>
        <CardContent className="py-6">
          {currentStep === "class" ? (
            <ForceClassStep
              data={data}
              value={values.classId}
              onChange={(classId) => update({ classId })}
            />
          ) : null}
          {currentStep === "location" ? (
            <ForceLocationStep data={data} values={values} update={update} />
          ) : null}
          {currentStep === "dateTime" ? (
            <div className="grid gap-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start">
              <div>
                <h3 className="mb-2 text-sm font-semibold">
                  {t("forceChooseDate")}
                </h3>
                <Calendar
                  className="mx-auto max-w-full p-0 lg:mx-0 lg:p-3"
                  mode="single"
                  locale={locale === "zh-CN" ? zhCN : enUS}
                  selected={inputValueToDate(values.date)}
                  defaultMonth={inputValueToDate(values.date) ?? today}
                  startMonth={today}
                  endMonth={maximumDate}
                  disabled={{ before: today, after: maximumDate }}
                  onSelect={(date) =>
                    date &&
                    update({
                      date: dateToInputValue(date),
                      startTime: 0,
                      endTime: 0,
                    })
                  }
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold">
                  {t("forceChooseTime")}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {values.startTime && values.endTime
                    ? t("forceSelectedTime", {
                        start: timeFormatter.format(values.startTime * 1000),
                        end: timeFormatter.format(values.endTime * 1000),
                      })
                    : values.startTime
                      ? t("forceChooseEnd")
                      : t("forceChooseStart")}
                </p>
                {values.date ? (
                  <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-8">
                    {timeOptions.map((timestamp) => {
                      const selected =
                        timestamp === values.startTime ||
                        (Boolean(values.endTime) &&
                          timestamp > values.startTime &&
                          timestamp <= values.endTime)
                      const canSelect = timeCanBeSelected(timestamp, values)
                      return (
                        <Button
                          key={timestamp}
                          type="button"
                          variant={selected ? "default" : "outline"}
                          disabled={!canSelect && !selected}
                          aria-pressed={selected}
                          onClick={() => selectTime(timestamp)}
                        >
                          {timeFormatter.format(timestamp * 1000)}
                        </Button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-muted-foreground">
                    {t("forceDateFirst")}
                  </p>
                )}
              </div>
            </div>
          ) : null}
          {currentStep === "reason" ? (
            <Field>
              <FieldLabel htmlFor="force-reason">
                {t("forceReasonLabel")}
              </FieldLabel>
              <Textarea
                id="force-reason"
                className="min-h-32"
                value={values.reason}
                onChange={(event) => update({ reason: event.target.value })}
                placeholder={t("forceReasonPlaceholder")}
              />
              <FieldDescription>{t("forceReasonDescription")}</FieldDescription>
            </Field>
          ) : null}
          {currentStep === "review" && admin ? (
            <div className="space-y-6">
              <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <ReviewField label={t("adminName")}>{admin.name}</ReviewField>
                <ReviewField label={t("adminEmail")}>{admin.email}</ReviewField>
                <ReviewField label={t("studentId")}>GJ00000000</ReviewField>
                <ReviewField label={t("class")}>
                  {selectedClass?.name}
                </ReviewField>
                <ReviewField label={t("campus")}>
                  {selectedCampus?.name}
                </ReviewField>
                <ReviewField label={t("room")}>
                  {selectedRoom?.name}
                </ReviewField>
                <ReviewField label={t("forceTimeLabel")}>
                  {dateTimeFormatter.format(values.startTime * 1000)} -{" "}
                  {timeFormatter.format(values.endTime * 1000)}
                </ReviewField>
                <ReviewField label={t("reason")} wide>
                  {values.reason}
                </ReviewField>
              </dl>
              <Alert variant="destructive">
                <AlertTriangle />
                <AlertTitle>{t("forceWarningTitle")}</AlertTitle>
                <AlertDescription>
                  {t("forceWarningDescription")}
                </AlertDescription>
              </Alert>
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 border-t sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">{error}</p>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={stepIndex === 0 || working}
              onClick={previousStep}
            >
              <ArrowLeft />
              {t("forceBack")}
            </Button>
            {currentStep === "review" ? (
              <Button
                type="button"
                variant="destructive"
                disabled={working || !admin}
                onClick={submitReservation}
              >
                {working ? <Spinner /> : <CalendarPlus />}
                {t("forceConfirm")}
              </Button>
            ) : (
              <Button type="button" disabled={working} onClick={nextStep}>
                {t("forceNext")}
                <ArrowRight />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

function ForceClassStep({
  data,
  value,
  onChange,
}: {
  data: ForceReservationData
  value: number
  onChange: (value: number) => void
}) {
  const t = useTranslations("admin")
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">{t("forceChooseClass")}</h2>
      <ChoiceGrid
        value={value}
        onChange={onChange}
        label={t("forceChooseClass")}
        items={data.classes.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
        emptyText={t("forceNoClasses")}
      />
    </div>
  )
}

function ForceLocationStep({
  data,
  values,
  update,
}: {
  data: ForceReservationData
  values: ForceReservationValues
  update: (values: Partial<ForceReservationValues>) => void
}) {
  const t = useTranslations("admin")
  const rooms = data.rooms.filter(
    (room) => room.campus === values.campusId && room.enabled
  )
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold">{t("forceChooseCampus")}</h2>
        <ChoiceGrid
          value={values.campusId}
          onChange={(campusId) => update({ campusId, roomId: 0 })}
          label={t("forceChooseCampus")}
          items={data.campuses.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
          emptyText={t("campusesEmpty")}
        />
      </div>
      {values.campusId ? (
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("forceChooseRoom")}</h2>
          <ChoiceGrid
            value={values.roomId}
            onChange={(roomId) => update({ roomId, startTime: 0, endTime: 0 })}
            label={t("forceChooseRoom")}
            items={rooms.map((item) => ({ value: item.id, label: item.name }))}
            emptyText={t("forceNoEnabledRooms")}
          />
        </div>
      ) : null}
    </div>
  )
}

function ReviewField({
  label,
  children,
  wide,
}: {
  label: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className={wide ? "sm:col-span-2 lg:col-span-3" : undefined}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  )
}

function buildForceTimeOptions(date: string) {
  const selectedDate = inputValueToDate(date)
  if (!selectedDate) return []
  const options: number[] = []
  selectedDate.setHours(8, 0, 0, 0)
  const end = new Date(selectedDate)
  end.setHours(21, 30, 0, 0)
  while (selectedDate <= end) {
    options.push(selectedDate.getTime() / 1000)
    selectedDate.setMinutes(selectedDate.getMinutes() + 15)
  }
  return options
}

function timeCanBeSelected(timestamp: number, values: ForceReservationValues) {
  if (timestamp <= Date.now() / 1000) return false
  if (!values.startTime || values.endTime || timestamp <= values.startTime) {
    return timestamp < buildForceTimeOptions(values.date).at(-1)!
  }
  return timestamp <= values.startTime + 2 * 60 * 60
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
