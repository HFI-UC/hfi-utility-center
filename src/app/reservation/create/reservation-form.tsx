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
  createReservation,
  forceReservation,
  getReservationPreflight,
  previewReservation,
  type CreateReservationInput,
  type CreateReservationPreview,
  type ReservationPreflight,
} from "@/lib/api/reservations"
import { dateToInputValue } from "@/lib/date-time"
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
import { LocationStep } from "./steps/location-step"
import { ProfileStep } from "./steps/profile-step"
import { ReviewStep } from "./steps/review-step"
import { SuccessStep } from "./steps/success-step"
import { forceReservationDefaults, useBookingCatalog } from "./use-booking-catalog"

type ReservationResult = {
  reservationId?: number
}

export function ReservationForm({ mode = "public" }: { mode?: "public" | "adminForce" }) {
  const t = useTranslations("booking")
  const adminT = useTranslations("admin")
  const common = useTranslations("common")
  const locale = useLocale()
  const isForce = mode === "adminForce"
  const schema = useReservationSchema()
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: reservationDefaults,
    mode: "onTouched",
  })
  const [currentStepId, setCurrentStepId] = useState<BookingStepId>("location")
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
  const { catalog, catalogLoading, catalogError, reloadCatalog, adminSessionRef } =
    useBookingCatalog(isForce, form)

  function goToStep(nextStepId: BookingStepId) {
    const nextIndex = bookingSteps.findIndex((step) => step.id === nextStepId)
    setStepDirection(nextIndex >= currentStepIndex ? "forward" : "back")
    setHasSlid(true)
    if (nextStepId !== "review") {
      setPriorityPreview(undefined)
      setPreflight(undefined)
    }
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

    if (currentStep.id === "profile") {
      setIsWorking(true)
      try {
        const values = form.getValues()
        setPreflight(await getReservationPreflight(values.email.trim(), values.date))
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
          await forceReservation(
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
      if (preview.mode === "priority") {
        setPriorityPreview({ input, preview })
        return
      }
      if (isForce) {
        setFlowError(adminT("forceIdentityInvalid"))
        return
      }
      setResult(await createReservation(input))
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
    form.reset({
      ...(isForce && adminSessionRef.current
        ? forceReservationDefaults(adminSessionRef.current)
        : reservationDefaults),
      bookingCampusId: catalog?.campuses[0]?.id ?? 0,
      date: dateToInputValue(new Date()),
    })
    goToStep("location")
    setResult(undefined)
    setFlowError(undefined)
    setPriorityPreview(undefined)
    setPreflight(undefined)
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
    location: <LocationStep catalog={catalog} privileged={isForce} />,
    profile: <ProfileStep adminMode={isForce} />,
    review: <ReviewStep catalog={catalog} preflight={preflight} onEdit={goToStep} />,
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
            location: t("steps.location"),
            profile: t("steps.profile"),
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
        {currentStep.id === "review" && priorityPreview ? (
          <section className="mx-auto mb-6 w-full max-w-3xl rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
            <h2 className="font-semibold">{t("priorityPreviewTitle")}</h2>
            <p className="mt-2 text-sm">
              {t("priorityPreviewDescription", {
                count: priorityPreview.preview.cancelledCount,
              })}
            </p>
            {priorityPreview.preview.conflicts.length ? (
              <ul className="mt-4 space-y-2 text-sm">
                {priorityPreview.preview.conflicts.map((conflict) => (
                  <li key={conflict.id} className="rounded-lg border border-amber-200 bg-white p-3">
                    <strong>
                      #{conflict.id} · {conflict.studentName}
                    </strong>
                    <span className="block">
                      {conflict.roomName} · {conflict.startTime} – {conflict.endTime}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}
        <BookingActionBar
          nextLabel={t(`continue.${currentStep.id}`)}
          confirmLabel={
            priorityPreview
              ? t("confirmPriority")
              : isForce
                ? t("previewPriority")
                : t("confirmReservation")
          }
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
