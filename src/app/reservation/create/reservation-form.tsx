"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { useErrorShake } from "@/hooks/use-error-shake"
import { createReservation, forceReservation, getAvailability } from "@/lib/api/reservations"
import { dateToInputValue } from "@/lib/date-time"
import { rangeIsAvailable } from "@/lib/reservations/availability"
import { cn } from "@/lib/utils"

import { BookingActionBar } from "./booking-action-bar"
import { BookingGate } from "./booking-gate"
import { BookingStepper } from "./booking-stepper"
import {
  bookingSteps,
  reservationDefaults,
  useReservationSchema,
  type BookingStepId,
  type ReservationFormValues,
} from "./form"
import { ClassStep } from "./steps/class-step"
import { LocationStep } from "./steps/location-step"
import { ReviewStep } from "./steps/review-step"
import { SuccessStep } from "./steps/success-step"
import {
  findPriorityClass,
  forceReservationDefaults,
  useBookingCatalog,
} from "./use-booking-catalog"

type ReservationResult = {
  reservationId?: number
}

export function ReservationForm({ mode = "public" }: { mode?: "public" | "adminForce" }) {
  const t = useTranslations("booking")
  const common = useTranslations("common")
  const locale = useLocale()
  const isForce = mode === "adminForce"
  const schema = useReservationSchema()
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: reservationDefaults,
    mode: "onTouched",
  })
  const [currentStepId, setCurrentStepId] = useState<BookingStepId>("details")
  const [flowError, setFlowError] = useState<string>()
  const [isWorking, setIsWorking] = useState(false)
  const [result, setResult] = useState<ReservationResult>()
  const [stepDirection, setStepDirection] = useState<"forward" | "back">("forward")
  const [hasSlid, setHasSlid] = useState(false)
  const currentStepIndex = bookingSteps.findIndex((step) => step.id === currentStepId)
  const currentStep = bookingSteps[currentStepIndex]
  const { catalog, catalogLoading, catalogError, reloadCatalog, adminSessionRef } =
    useBookingCatalog(isForce, form)

  function goToStep(nextStepId: BookingStepId) {
    const nextIndex = bookingSteps.findIndex((step) => step.id === nextStepId)
    setStepDirection(nextIndex >= currentStepIndex ? "forward" : "back")
    setHasSlid(true)
    setCurrentStepId(nextStepId)
  }

  const [selectedClassId, selectedRoomId, selectedDate, selectedStart, selectedEnd] = useWatch({
    control: form.control,
    name: ["classId", "room", "date", "startTime", "endTime"],
  })
  const selectedClass = catalog?.classes.find((item) => item.id === selectedClassId)
  const isPrivilegedSelection = Boolean(
    catalog?.campuses.find((item) => item.id === selectedClass?.campus)?.isPrivileged,
  )
  const { ref: stepRef, shake: shakeStep } = useErrorShake<HTMLDivElement>()

  useEffect(() => {
    if (hasSlid) {
      const heading = stepRef.current?.querySelector("h2")
      heading?.focus({ preventScroll: true })
      stepRef.current?.closest("form")?.scrollIntoView({ block: "start" })
    }
  }, [currentStepId, hasSlid, stepRef])

  async function selectedTimeIsStillAvailable(values: ReservationFormValues) {
    if (!catalog) return false

    if (isForce || values.isPrivileged) return true

    const room = catalog.rooms.find((candidate) => candidate.id === values.room)
    if (!room) {
      setFlowError(t("availabilityError"))
      return false
    }

    const availability = await getAvailability(values.room, values.date, room)
    if (rangeIsAvailable(availability.slots, values.startTime, values.endTime)) {
      return true
    }

    form.setValue("startTime", 0)
    form.setValue("endTime", 0)
    setFlowError(t("timeConflict"))
    return false
  }

  async function continueToNextStep() {
    if (isWorking) return
    const valid = await form.trigger([...currentStep.fields], {
      shouldFocus: true,
    })
    if (!valid) {
      setFlowError(undefined)
      shakeStep()
      requestAnimationFrame(() => {
        const controls = stepRef.current?.querySelectorAll<HTMLElement>(
          '[data-invalid="true"] button, [data-invalid="true"] input, [data-invalid="true"] textarea',
        )
        Array.from(controls ?? [])
          .find((control) => control.getClientRects().length)
          ?.focus()
      })
      return
    }

    if (currentStep.id === "details") {
      if (!form.getValues("bookingCampusId")) {
        const campus =
          catalog?.campuses.find(
            (item) => item.id === selectedClass?.campus && !item.isPrivileged,
          ) ?? catalog?.campuses.find((item) => !item.isPrivileged)
        if (campus) form.setValue("bookingCampusId", campus.id)
      }
      if (!form.getValues("date")) form.setValue("date", dateToInputValue(new Date()))
    }

    if (currentStep.id === "location") {
      setIsWorking(true)
      try {
        if (!(await selectedTimeIsStillAvailable(form.getValues()))) return
      } catch (error) {
        setFlowError(error instanceof Error ? error.message : common("unknown"))
        return
      } finally {
        setIsWorking(false)
      }
    }

    const nextStep = bookingSteps[currentStepIndex + 1]
    if (!nextStep) return
    setFlowError(undefined)
    goToStep(nextStep.id)
  }

  function continueFromDetails() {
    if (isWorking || currentStep.id !== "details") return
    const parsed = schema.safeParse(form.getValues())
    const detailsComplete =
      parsed.success ||
      parsed.error.issues.every((issue) => {
        const field = issue.path[0]
        return typeof field !== "string" || !currentStep.fields.some((name) => name === field)
      })
    if (detailsComplete) void continueToNextStep()
  }

  async function confirmReservation(values: ReservationFormValues) {
    setIsWorking(true)
    setFlowError(undefined)

    try {
      if (!(await selectedTimeIsStillAvailable(values))) {
        goToStep("location")
        return
      }

      const response = isForce
        ? await forceReservation({
            classId: values.classId,
            room: values.room,
            studentName: values.studentName.trim(),
            studentId: "-",
            email: values.email.trim(),
            reason: values.reason.trim(),
            startTime: values.startTime,
            endTime: values.endTime,
            purposeType: values.purposeType,
            needsMultimedia: values.needsMultimedia,
          })
        : await createReservation({
            classId: values.classId,
            room: values.room,
            studentName: values.studentName.trim(),
            studentId: values.studentId.trim().toUpperCase(),
            email: values.email.trim(),
            reason: values.reason.trim(),
            startTime: values.startTime,
            endTime: values.endTime,
            purposeType: values.purposeType,
            needsMultimedia: values.needsMultimedia,
          })
      setResult(response)
    } catch (error) {
      setFlowError(error instanceof Error ? error.message : common("unknown"))
    } finally {
      setIsWorking(false)
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isWorking) return
    if (currentStep.id !== "review") {
      void continueToNextStep()
      return
    }

    void form.handleSubmit(confirmReservation, (errors) => {
      const invalidStep = bookingSteps.find((step) => step.fields.some((field) => errors[field]))
      if (invalidStep) goToStep(invalidStep.id)
      setFlowError(t("completeStep"))
    })(event)
  }

  function returnToPreviousStep() {
    const previousStep = bookingSteps[currentStepIndex - 1]
    if (!previousStep) return
    setFlowError(undefined)
    goToStep(previousStep.id)
  }

  function resetReservation() {
    const priorityClass = catalog && findPriorityClass(catalog)
    form.reset(
      isForce && adminSessionRef.current && priorityClass
        ? forceReservationDefaults(priorityClass.id, adminSessionRef.current)
        : reservationDefaults,
    )
    goToStep("details")
    setResult(undefined)
    setFlowError(undefined)
  }

  if (catalogLoading || catalogError || !catalog) {
    return (
      <BookingGate
        isForce={isForce}
        loading={catalogLoading}
        error={catalogError}
        onRetry={reloadCatalog}
      />
    )
  }

  if (result) {
    if (isForce) {
      return <SuccessStep {...result} adminForce onReset={resetReservation} />
    }
    return (
      <AppShell>
        <PageHeader title={t("success")} description={t("successDescription")} />
        <SuccessStep {...result} onReset={resetReservation} />
      </AppShell>
    )
  }

  const stepContent: Record<BookingStepId, ReactNode> = {
    details: (
      <ClassStep
        catalog={catalog}
        privilegedOnly={isForce}
        adminMode={isForce}
        onClassSelected={() => continueFromDetails()}
      />
    ),
    location: <LocationStep catalog={catalog} privileged={isPrivilegedSelection} />,
    review: <ReviewStep catalog={catalog} onEdit={goToStep} />,
  }

  const formBody = (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={handleFormSubmit}
        className={isForce ? "flex min-w-0 scroll-mt-20 flex-col gap-4" : "min-w-0 scroll-mt-20"}
      >
        <BookingStepper
          titles={{
            details: t("steps.details"),
            location: t("steps.location"),
            review: t("steps.review"),
          }}
          currentStepIndex={currentStepIndex}
          isWorking={isWorking}
          onGoToStep={goToStep}
        />
        {currentStepIndex > 0 ? (
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-muted/60 px-4 py-3 text-sm">
            <span className="font-medium">{selectedClass?.name}</span>
            {selectedRoomId ? (
              <span>{catalog.rooms.find((item) => item.id === selectedRoomId)?.name}</span>
            ) : null}
            {selectedStart && selectedEnd ? (
              <span className="tabular-nums">
                {new Intl.DateTimeFormat(locale, {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }).formatRange(new Date(selectedStart * 1000), new Date(selectedEnd * 1000))}
              </span>
            ) : null}
            {selectedDate ? (
              <span className="text-muted-foreground tabular-nums">{selectedDate}</span>
            ) : null}
          </div>
        ) : null}
        <fieldset
          disabled={isWorking}
          className="min-w-0 border-0 p-0"
          onFocusCapture={(event) => {
            const target = event.target
            if (
              !target.matches(
                "input:focus-visible, button:focus-visible, textarea:focus-visible, [role=combobox]:focus-visible",
              )
            )
              return
            const bounds = target.getBoundingClientRect()
            if (bounds.bottom > window.innerHeight - 112 || bounds.top < 72) {
              target.scrollIntoView({ block: "center" })
            }
          }}
        >
          <div
            key={currentStep.id}
            ref={stepRef}
            className={cn(
              "min-w-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))]",
              hasSlid && "motion-safe:animate-page-slide",
              hasSlid &&
                stepDirection === "back" &&
                "[--page-from-x:calc(var(--distance-base)*-1)]",
            )}
          >
            {stepContent[currentStep.id]}
          </div>
        </fieldset>
        <BookingActionBar
          nextLabel={t(`continue.${currentStep.id}`)}
          flowError={flowError}
          isFirstStep={currentStepIndex === 0}
          isLastStep={currentStep.id === "review"}
          isWorking={isWorking}
          isForce={isForce}
          onPrevious={returnToPreviousStep}
          onNext={() => void continueToNextStep()}
        />
      </form>
    </FormProvider>
  )

  if (isForce) return formBody

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <PageHeader title={t("createTitle")} description={t("intro")} />
        {formBody}
      </div>
    </AppShell>
  )
}
