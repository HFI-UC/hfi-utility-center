"use client"

import { useEffect, useState, type FormEvent } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  RefreshCw,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { FormProvider, useForm } from "react-hook-form"

import { Spinner } from "@/components/astryx"
import { getCatalog } from "@/lib/api/catalog"
import { createReservation, getAvailability } from "@/lib/api/reservations"
import type { CatalogData } from "@/lib/api/types"
import { rangeIsAvailable } from "@/lib/reservations/availability"
import { ActionButton, NeoFooter, NeoHeader } from "@/components/neo/shared"

import {
  bookingSteps,
  reservationDefaults,
  useReservationSchema,
  type BookingStepId,
  type ReservationFormValues,
} from "./form"
import { ClassStep } from "./steps/class-step"
import { DateTimeStep } from "./steps/date-time-step"
import { LocationStep } from "./steps/location-step"
import { ProfileStep } from "./steps/profile-step"
import { ReviewStep } from "./steps/review-step"
import { SuccessStep } from "./steps/success-step"

type ReservationResult = {
  reservationId?: number
}

export function ReservationForm() {
  const t = useTranslations("booking")
  const common = useTranslations("common")
  const schema = useReservationSchema()
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: reservationDefaults,
    mode: "onTouched",
  })
  const [currentStepId, setCurrentStepId] = useState<BookingStepId>("class")
  const [flowError, setFlowError] = useState<string>()
  const [isWorking, setIsWorking] = useState(false)
  const [result, setResult] = useState<ReservationResult>()
  const [catalog, setCatalog] = useState<CatalogData>()
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState<string>()
  const [catalogReloadKey, setCatalogReloadKey] = useState(0)
  const currentStepIndex = bookingSteps.findIndex(
    (step) => step.id === currentStepId
  )
  const currentStep = bookingSteps[currentStepIndex]

  useEffect(() => {
    let active = true

    async function loadCatalog() {
      setCatalogLoading(true)
      setCatalogError(undefined)
      try {
        const data = await getCatalog()
        if (active) setCatalog(data)
      } catch {
        if (active) setCatalogError("无法连接预约服务，请检查网络后重试。")
      } finally {
        if (active) setCatalogLoading(false)
      }
    }

    loadCatalog()
    return () => {
      active = false
    }
  }, [catalogReloadKey])

  async function selectedTimeIsStillAvailable(values: ReservationFormValues) {
    if (!catalog) return false

    const room = catalog.rooms.find((candidate) => candidate.id === values.room)
    if (!room) {
      setFlowError(t("availabilityError"))
      return false
    }

    const availability = await getAvailability(values.room, values.date, room)
    if (
      rangeIsAvailable(availability.slots, values.startTime, values.endTime)
    ) {
      return true
    }

    form.setValue("startTime", 0)
    form.setValue("endTime", 0)
    setFlowError(t("timeConflict"))
    return false
  }

  async function continueToNextStep() {
    const valid = await form.trigger([...currentStep.fields], {
      shouldFocus: true,
    })
    if (!valid) return

    if (currentStep.id === "dateTime") {
      setIsWorking(true)
      try {
        if (!(await selectedTimeIsStillAvailable(form.getValues()))) return
      } finally {
        setIsWorking(false)
      }
    }

    const nextStep = bookingSteps[currentStepIndex + 1]
    if (!nextStep) return
    setFlowError(undefined)
    setCurrentStepId(nextStep.id)
  }

  async function confirmReservation(values: ReservationFormValues) {
    setIsWorking(true)
    setFlowError(undefined)

    try {
      if (!(await selectedTimeIsStillAvailable(values))) {
        setCurrentStepId("dateTime")
        return
      }

      const response = await createReservation({
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
      setResult({ reservationId: response.reservationId })
    } finally {
      setIsWorking(false)
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (currentStep.id !== "review") {
      void continueToNextStep()
      return
    }

    void form.handleSubmit(confirmReservation)(event)
  }

  function returnToPreviousStep() {
    const previousStep = bookingSteps[currentStepIndex - 1]
    if (!previousStep) return
    setFlowError(undefined)
    setCurrentStepId(previousStep.id)
  }

  function resetReservation() {
    form.reset()
    setCurrentStepId("class")
    setResult(undefined)
    setFlowError(undefined)
  }

  if (catalogLoading) {
    return (
      <div className="app-page app-page--light">
        <NeoHeader />
        <main className="neo-load-state">
          <Spinner className="size-8" />
          <strong>正在载入预约资源</strong>
          <span>通常会在一秒内完成</span>
        </main>
      </div>
    )
  }

  if (catalogError || !catalog) {
    return (
      <div className="app-page app-page--light">
        <NeoHeader />
        <main className="neo-load-state neo-load-state--error">
          <AlertCircle size={30} />
          <strong>预约服务暂时无法连接</strong>
          <span>{catalogError}</span>
          <ActionButton onClick={() => setCatalogReloadKey((key) => key + 1)}>
            <RefreshCw />
            重新加载
          </ActionButton>
        </main>
        <NeoFooter />
      </div>
    )
  }

  if (result) {
    return (
      <div className="app-page app-page--light">
        <NeoHeader />
        <main className="success-shell">
          <SuccessStep {...result} onReset={resetReservation} />
        </main>
        <NeoFooter />
      </div>
    )
  }

  const stepContent = {
    class: <ClassStep catalog={catalog} />,
    location: <LocationStep catalog={catalog} />,
    dateTime: <DateTimeStep rooms={catalog.rooms} />,
    profile: <ProfileStep />,
    review: <ReviewStep catalog={catalog} />,
  }

  return (
    <div className="app-page app-page--light">
      <NeoHeader />
      <FormProvider {...form}>
        <form
          noValidate
          onSubmit={handleFormSubmit}
          className="internal-main wizard-page"
        >
          <div className="wizard-card">
            <header className="wizard-title-row">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <h1>{t("createTitle")}</h1>
              </div>
              <p className="wizard-count">
                {t("step", {
                  current: currentStepIndex + 1,
                  total: bookingSteps.length,
                })}
              </p>
            </header>
            <div className="booking-stepper" aria-label={t("progress")}>
              {bookingSteps.map((step, index) => (
                <div className="stepper-item-wrap" key={step.id}>
                  <button
                    type="button"
                    className={`stepper-item ${index < currentStepIndex ? "stepper-item--complete" : ""} ${index === currentStepIndex ? "stepper-item--active" : ""}`}
                    onClick={() =>
                      index <= currentStepIndex && setCurrentStepId(step.id)
                    }
                  >
                    <span className="stepper-item__number">
                      {index < currentStepIndex ? (
                        <Check size={14} />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className="stepper-item__label">
                      {
                        [
                          t("classTitle"),
                          t("locationTitle"),
                          t("dateTimeTitle"),
                          t("profileTitle"),
                          t("reviewTitle"),
                        ][index]
                      }
                    </span>
                  </button>
                  {index < bookingSteps.length - 1 ? (
                    <span
                      className={`stepper-divider ${index < currentStepIndex ? "stepper-divider--complete" : ""}`}
                    />
                  ) : null}
                </div>
              ))}
            </div>
            <div className="wizard-step-body">
              {stepContent[currentStep.id]}
            </div>
            <div className="wizard-actions">
              <div className="flex items-center gap-3">
                {flowError ? (
                  <p className="hidden max-w-md text-right text-xs text-destructive sm:block">
                    {flowError}
                  </p>
                ) : null}
              </div>
              <div className="wizard-action-controls">
                <ActionButton
                  className="wizard-nav-button"
                  icon={<ArrowLeft size={16} />}
                  ariaLabel={common("back")}
                  variant="secondary"
                  disabled={currentStepIndex === 0 || isWorking}
                  onClick={(event) => {
                    event.preventDefault()
                    returnToPreviousStep()
                  }}
                >
                  {common("back")}
                </ActionButton>
                {currentStep.id === "review" ? (
                  <ActionButton
                    ariaLabel={t("confirmReservation")}
                    type="submit"
                    disabled={isWorking}
                  >
                    {isWorking ? <Spinner /> : null}
                    {t("confirmReservation")}
                  </ActionButton>
                ) : (
                  <ActionButton
                    className="wizard-nav-button"
                    icon={isWorking ? <Spinner /> : undefined}
                    endContent={
                      isWorking ? undefined : <ArrowRight size={16} />
                    }
                    ariaLabel={common("next")}
                    disabled={isWorking}
                    onClick={(event) => {
                      event.preventDefault()
                      void continueToNextStep()
                    }}
                  >
                    {common("next")}
                  </ActionButton>
                )}
              </div>
            </div>
            {flowError ? (
              <p className="pb-3 text-xs text-destructive sm:hidden">
                {flowError}
              </p>
            ) : null}
          </div>
        </form>
      </FormProvider>
      <NeoFooter />
    </div>
  )
}
