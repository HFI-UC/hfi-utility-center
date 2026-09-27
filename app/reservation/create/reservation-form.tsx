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
import { useLocale, useTranslations } from "next-intl"
import { FormProvider, useForm } from "react-hook-form"

import { Spinner } from "@/components/astryx"
import { getAdminSession, type AdminSession } from "@/lib/api/auth"
import { getCatalog } from "@/lib/api/catalog"
import {
  createReservation,
  forceReservation,
  getAvailability,
  previewReservation,
  type CreateReservationInput,
  type CreateReservationPreview,
} from "@/lib/api/reservations"
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

export function ReservationForm({
  mode = "public",
}: {
  mode?: "public" | "adminForce"
}) {
  const t = useTranslations("booking")
  const adminT = useTranslations("admin")
  const common = useTranslations("common")
  const locale = useLocale()
  const isForce = mode === "adminForce"
  const schema = useReservationSchema(isForce)
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: reservationDefaults,
    mode: "onTouched",
  })
  const [currentStepId, setCurrentStepId] = useState<BookingStepId>("class")
  const [flowError, setFlowError] = useState<string>()
  const [isWorking, setIsWorking] = useState(false)
  const [result, setResult] = useState<ReservationResult>()
  const [priorityPreview, setPriorityPreview] = useState<{
    input: CreateReservationInput
    preview: CreateReservationPreview
  }>()
  const [catalog, setCatalog] = useState<CatalogData>()
  const [adminSession, setAdminSession] = useState<AdminSession>()
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
        const [data, session] = await Promise.all([
          getCatalog(),
          isForce ? getAdminSession() : Promise.resolve(undefined),
        ])
        if (!active) return

        if (isForce && !session) {
          throw new Error(adminT("forceLoadError"))
        }
        setCatalog(data)
        setAdminSession(session)
        if (isForce && session) {
          form.reset(forceReservationDefaults(session))
        }
      } catch (error) {
        if (active) {
          setCatalogError(
            error instanceof Error
              ? error.message
              : "无法连接预约服务，请检查网络后重试。"
          )
        }
      } finally {
        if (active) setCatalogLoading(false)
      }
    }

    loadCatalog()
    return () => {
      active = false
    }
  }, [adminT, catalogReloadKey, form, isForce])

  async function selectedTimeIsStillAvailable(values: ReservationFormValues) {
    if (!catalog) return false

    if (isForce) return true

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
    setPriorityPreview(undefined)
    setCurrentStepId(nextStep.id)
  }

  async function confirmReservation(values: ReservationFormValues) {
    setIsWorking(true)
    setFlowError(undefined)

    try {
      if (priorityPreview) {
        try {
          setResult(
            await forceReservation(
              priorityPreview.input,
              priorityPreview.preview.conflicts.map((conflict) => conflict.id)
            )
          )
          setPriorityPreview(undefined)
        } catch (error) {
          setPriorityPreview(undefined)
          setFlowError(
            error instanceof Error
              ? `${t("priorityChanged")} ${error.message}`
              : t("priorityChanged")
          )
        }
        return
      }

      if (!(await selectedTimeIsStillAvailable(values))) {
        setCurrentStepId("dateTime")
        return
      }

      const input: CreateReservationInput = {
        classId: values.classId || undefined,
        room: values.room,
        studentName: values.studentName.trim(),
        studentId: isForce ? "-" : values.studentId.trim().toUpperCase(),
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
      setFlowError(error instanceof Error ? error.message : t("submitError"))
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
    setPriorityPreview(undefined)
    setCurrentStepId(previousStep.id)
  }

  function resetReservation() {
    form.reset(
      isForce && adminSession
        ? forceReservationDefaults(adminSession)
        : reservationDefaults
    )
    setCurrentStepId("class")
    setResult(undefined)
    setPriorityPreview(undefined)
    setFlowError(undefined)
  }

  if (catalogLoading) {
    if (isForce) {
      return (
        <div className="admin-dashboard-loading">
          <Spinner />
          {adminT("forceLoading")}
        </div>
      )
    }
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
    if (isForce) {
      return (
        <div className="neo-load-state neo-load-state--error">
          <AlertCircle size={30} />
          <strong>{adminT("forceLoadError")}</strong>
          <span>{catalogError}</span>
          <ActionButton onClick={() => setCatalogReloadKey((key) => key + 1)}>
            <RefreshCw />
            {common("retry")}
          </ActionButton>
        </div>
      )
    }
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
      <div
        className={isForce ? "admin-force-booking" : "app-page app-page--light"}
      >
        {!isForce ? <NeoHeader /> : null}
        <main className="success-shell">
          <SuccessStep
            {...result}
            adminForce={isForce}
            onReset={resetReservation}
          />
        </main>
        {!isForce ? <NeoFooter /> : null}
      </div>
    )
  }

  const stepContent = {
    class: <ClassStep catalog={catalog} optional={isForce} />,
    location: <LocationStep catalog={catalog} />,
    dateTime: <DateTimeStep rooms={catalog.rooms} privileged={isForce} />,
    profile: <ProfileStep adminMode={isForce} />,
    review: <ReviewStep catalog={catalog} adminMode={isForce} />,
  }

  return (
    <div
      className={isForce ? "admin-force-booking" : "app-page app-page--light"}
    >
      {!isForce ? <NeoHeader /> : null}
      <FormProvider {...form}>
        <form
          noValidate
          onSubmit={handleFormSubmit}
          className="internal-main wizard-page"
        >
          <div className="wizard-card">
            <header className="wizard-title-row">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <h1>
                  {isForce ? adminT("forceReservationTitle") : t("createTitle")}
                </h1>
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
                    onClick={() => {
                      if (index <= currentStepIndex) {
                        setPriorityPreview(undefined)
                        setCurrentStepId(step.id)
                      }
                    }}
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
              {currentStep.id === "review" && priorityPreview ? (
                <section
                  className="mx-auto mb-6 max-w-3xl rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950"
                  aria-live="polite"
                >
                  <h2 className="font-semibold">{t("priorityPreviewTitle")}</h2>
                  <p className="mt-2 text-sm">
                    {t("priorityPreviewDescription", {
                      count: priorityPreview.preview.cancelledCount,
                    })}
                  </p>
                  {priorityPreview.preview.conflicts.length > 0 ? (
                    <ul className="mt-4 space-y-2 text-sm">
                      {priorityPreview.preview.conflicts.map((conflict) => (
                        <li
                          key={conflict.id}
                          className="rounded-lg border border-amber-200 bg-white p-3"
                        >
                          <strong>
                            #{conflict.id} · {conflict.studentName}
                          </strong>
                          <span className="block">
                            {conflict.roomName} ·{" "}
                            {new Intl.DateTimeFormat(locale, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(conflict.startTime))}
                            {" – "}
                            {new Intl.DateTimeFormat(locale, {
                              timeStyle: "short",
                            }).format(new Date(conflict.endTime))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ) : null}
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
                    {priorityPreview
                      ? t("confirmPriority")
                      : isForce
                        ? t("previewPriority")
                        : t("confirmReservation")}
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
      {!isForce ? <NeoFooter /> : null}
    </div>
  )
}

function forceReservationDefaults(admin: AdminSession): ReservationFormValues {
  return {
    ...reservationDefaults,
    studentName: admin.name,
    email: admin.email,
    purposeType: "class",
    isAgreed: true,
  }
}
