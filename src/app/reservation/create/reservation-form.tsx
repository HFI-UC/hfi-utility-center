"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"

import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { useErrorShake } from "@/hooks/use-error-shake"
import { RequestError } from "@/lib/api/client"
import {
  confirmPriorityReservation,
  createReservation,
  getReservationPreflight,
  previewReservation,
  type CreateReservationInput,
  type CreateReservationPreview,
  type ReservationPreflight,
} from "@/lib/api/reservations"
import { dateToInputValue, formatApiTimestamp } from "@/lib/date-time"
import { countsTowardDailyLimit, DAILY_RESERVATION_LIMIT } from "@/lib/reservations/availability"
import { cn } from "@/lib/utils"

import { isBookableCampus } from "./bookable-campus"
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
import { LocationStep } from "./steps/location-step"
import { ProfileStep } from "./steps/profile-step"
import { ReviewStep } from "./steps/review-step"
import { SuccessStep } from "./steps/success-step"
import { useBookingCatalog } from "./use-booking-catalog"

type ReservationResult = {
  reservationId?: number
}

export function ReservationForm() {
  const t = useTranslations("booking")
  const common = useTranslations("common")
  const locale = useLocale()
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
  const [preflight, setPreflight] = useState<ReservationPreflight>()
  const [priorityPreview, setPriorityPreview] = useState<{
    input: CreateReservationInput
    preview: CreateReservationPreview
  }>()
  const [stepDirection, setStepDirection] = useState<"forward" | "back">("forward")
  const [hasSlid, setHasSlid] = useState(false)
  const currentStepIndex = bookingSteps.findIndex((step) => step.id === currentStepId)
  const currentStep = bookingSteps[currentStepIndex]
  const dailyCount =
    preflight?.reservations.filter((reservation) => countsTowardDailyLimit(reservation.status))
      .length ?? 0
  // Priority accounts (preflight mode) bypass the per-email daily reservation limit.
  const dailyLimitReached = preflight?.mode !== "priority" && dailyCount >= DAILY_RESERVATION_LIMIT
  const { catalog, catalogLoading, catalogError, reloadCatalog } = useBookingCatalog(form)

  function goToStep(nextStepId: BookingStepId) {
    const nextIndex = bookingSteps.findIndex((step) => step.id === nextStepId)
    setStepDirection(nextIndex >= currentStepIndex ? "forward" : "back")
    setHasSlid(true)
    if (nextStepId === "details") setPreflight(undefined)
    if (nextStepId !== "review") setPriorityPreview(undefined)
    setCurrentStepId(nextStepId)
  }

  const [selectedRoomId, selectedDate, selectedStart, selectedEnd] = useWatch({
    control: form.control,
    name: ["room", "date", "startTime", "endTime"],
  })
  const { ref: stepRef, shake: shakeStep } = useErrorShake<HTMLDivElement>()

  useEffect(() => {
    if (hasSlid) {
      const heading = stepRef.current?.querySelector("h2")
      heading?.focus({ preventScroll: true })
      stepRef.current?.closest("form")?.scrollIntoView({ block: "start" })
    }
  }, [currentStepId, hasSlid, stepRef])

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

    if (currentStep.id === "details" || currentStep.id === "location") {
      setIsWorking(true)
      try {
        const values = form.getValues()
        setPreflight(
          await getReservationPreflight(
            values.email.trim(),
            values.date || dateToInputValue(new Date()),
          ),
        )
      } catch (error) {
        setPreflight(undefined)
        setFlowError(
          error instanceof Error && error.message === "student_not_registered"
            ? t("studentNotRegistered")
            : error instanceof Error
              ? error.message
              : common("unknown"),
        )
        shakeStep()
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

  async function confirmReservation(values: ReservationFormValues) {
    setIsWorking(true)
    setFlowError(undefined)

    try {
      if (priorityPreview) {
        setResult(
          await confirmPriorityReservation(
            priorityPreview.input,
            priorityPreview.preview.conflicts.map((conflict) => conflict.id),
          ),
        )
        setPriorityPreview(undefined)
        return
      }

      const input: CreateReservationInput = {
        room: values.room,
        email: values.email.trim(),
        reason: values.reason.trim(),
        startTime: values.startTime,
        endTime: values.endTime,
        purposeType: values.purposeType,
        needsMultimedia: values.needsMultimedia,
      }
      const preview = await previewReservation(input)
      if (preview.mode === "priority" && preview.cancelledCount > 0) {
        setPriorityPreview({ input, preview })
        return
      }

      setResult(
        preview.mode === "priority"
          ? await confirmPriorityReservation(input)
          : await createReservation(input),
      )
    } catch (error) {
      if (
        priorityPreview &&
        error instanceof RequestError &&
        error.status === 409 &&
        error.validation?.field === "conflict"
      ) {
        try {
          const preview = await previewReservation(priorityPreview.input)
          setPriorityPreview({ input: priorityPreview.input, preview })
          setFlowError(t("priorityChanged"))
        } catch (refreshError) {
          setPriorityPreview(undefined)
          setFlowError(refreshError instanceof Error ? refreshError.message : common("unknown"))
        }
        return
      }
      const message = error instanceof Error ? error.message : common("unknown")
      setFlowError(
        message === "Student email is not registered." ? t("studentNotRegistered") : message,
      )
    } finally {
      setIsWorking(false)
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isWorking) return
    if (currentStep.id !== "review" || dailyLimitReached) {
      if (currentStep.id !== "review") void continueToNextStep()
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
    form.reset({
      ...reservationDefaults,
      bookingCampusId: catalog?.campuses.find(isBookableCampus)?.id ?? 0,
      date: dateToInputValue(new Date()),
    })
    goToStep("details")
    setResult(undefined)
    setFlowError(undefined)
    setPriorityPreview(undefined)
    setPreflight(undefined)
  }

  if (catalogLoading || catalogError || !catalog) {
    return <BookingGate loading={catalogLoading} error={catalogError} onRetry={reloadCatalog} />
  }

  if (result) {
    return (
      <AppShell>
        <SuccessStep {...result} onReset={resetReservation} />
      </AppShell>
    )
  }

  const stepContent: Record<BookingStepId, ReactNode> = {
    details: <ProfileStep />,
    location: <LocationStep catalog={catalog} priority={preflight?.mode === "priority"} />,
    review: <ReviewStep catalog={catalog} preflight={preflight} onEdit={goToStep} />,
  }

  const formBody = (
    <FormProvider {...form}>
      <form noValidate onSubmit={handleFormSubmit} className="min-w-0 scroll-mt-20">
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
            {preflight?.student.className ? (
              <span className="font-medium">{preflight.student.className}</span>
            ) : null}
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
            {selectedDate ? <span>{selectedDate}</span> : null}
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
          {currentStep.id === "review" && priorityPreview ? (
            <PriorityPreview preview={priorityPreview.preview} />
          ) : (
            <div
              key={currentStep.id}
              ref={stepRef}
              className={cn(
                "min-w-0",
                hasSlid && "motion-safe:animate-page-slide",
                hasSlid &&
                  stepDirection === "back" &&
                  "[--page-from-x:calc(var(--distance-base)*-1)]",
              )}
            >
              {stepContent[currentStep.id]}
            </div>
          )}
        </fieldset>
        <BookingActionBar
          nextLabel={t(`continue.${currentStep.id}`)}
          confirmLabel={
            priorityPreview
              ? t(
                  priorityPreview.preview.cancelledCount > 0
                    ? "confirmPriority"
                    : "confirmPriorityClear",
                )
              : t("confirmReservation")
          }
          flowError={flowError}
          isFirstStep={currentStepIndex === 0}
          isLastStep={currentStep.id === "review"}
          isWorking={isWorking}
          submitDisabled={currentStep.id === "review" && dailyLimitReached}
          onPrevious={returnToPreviousStep}
          onNext={() => void continueToNextStep()}
        />
      </form>
    </FormProvider>
  )

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <PageHeader title={t("createTitle")} description={t("intro")} />
        {formBody}
      </div>
    </AppShell>
  )
}

function PriorityPreview({ preview }: { preview: CreateReservationPreview }) {
  const t = useTranslations("booking")
  const locale = useLocale()
  const clock = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })

  return (
    <section className="flex min-w-0 flex-col items-start gap-4 text-left">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">{t("priorityPreviewTitle")}</h2>
        <p className="text-sm text-muted-foreground">
          {preview.cancelledCount > 0
            ? t("priorityPreviewDescription", { count: preview.cancelledCount })
            : t("priorityPreviewNone")}
        </p>
      </div>
      {preview.conflicts.length ? (
        <ol className="flex w-full max-w-xl min-w-0 flex-col gap-4">
          {preview.conflicts.map((conflict) => (
            <li key={conflict.id} className="min-w-0">
              <div className="flex items-baseline justify-between gap-4">
                <p className="min-w-0 truncate text-sm font-medium">{conflict.studentName}</p>
                <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {formatApiTimestamp(clock, conflict.startTime)}–
                  {formatApiTimestamp(clock, conflict.endTime)}
                </p>
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                <span className="mr-2 tabular-nums">#{conflict.id}</span>
                {conflict.roomName}
              </p>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  )
}
