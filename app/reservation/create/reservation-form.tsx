"use client"

import { useMemo, useState, type FormEvent } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { FormProvider, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { ApiError, getErrorMessage } from "@/lib/api/client"
import { createReservation, getAvailability } from "@/lib/api/reservations"
import { rangeIsAvailable } from "@/lib/reservations/availability"

import {
  bookingSteps,
  createReservationSchema,
  reservationDefaults,
  type BookingStepId,
  type ReservationFormValues,
} from "./form"
import { ClassStep } from "./steps/class-step"
import { DateTimeStep } from "./steps/date-time-step"
import { LocationStep } from "./steps/location-step"
import { ProfileStep } from "./steps/profile-step"
import { ReviewStep } from "./steps/review-step"
import { SuccessStep } from "./steps/success-step"
import { useReservationCatalog } from "./use-reservation-catalog"

type ReservationResult = {
  reservationId?: number
}

export function ReservationForm() {
  const t = useTranslations("booking")
  const common = useTranslations("common")
  const schema = useMemo(() => createReservationSchema((key) => t(key)), [t])
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: reservationDefaults,
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldUnregister: false,
  })
  const [currentStepId, setCurrentStepId] = useState<BookingStepId>("class")
  const [flowError, setFlowError] = useState<string>()
  const [isWorking, setIsWorking] = useState(false)
  const [result, setResult] = useState<ReservationResult>()
  const {
    catalog,
    error: catalogError,
    loading: catalogLoading,
    reload: reloadCatalog,
  } = useReservationCatalog(t("loadError"))
  const currentStepIndex = bookingSteps.findIndex(
    (step) => step.id === currentStepId
  )
  const currentStep = bookingSteps[currentStepIndex]

  async function selectedTimeIsStillAvailable(values: ReservationFormValues) {
    const room = catalog?.rooms.find(
      (candidate) => candidate.id === values.room
    )
    if (!room) {
      setFlowError(t("availabilityError"))
      return false
    }

    try {
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
    } catch (error) {
      setFlowError(getErrorMessage(error, t("availabilityError")))
      return false
    }
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
      })
      setResult({
        reservationId: response?.reservationId,
      })
    } catch (error) {
      setFlowError(getErrorMessage(error, t("submitError")))
      if (error instanceof ApiError && error.status === 409) {
        setCurrentStepId("dateTime")
      }
    } finally {
      setIsWorking(false)
    }
  }

  async function handleStepSubmit(event: FormEvent<HTMLFormElement>) {
    if (currentStep.id === "review") {
      await form.handleSubmit(confirmReservation)(event)
      return
    }

    event.preventDefault()
    await continueToNextStep()
  }

  function returnToPreviousStep() {
    const previousStep = bookingSteps[currentStepIndex - 1]
    if (!previousStep) return
    setFlowError(undefined)
    setCurrentStepId(previousStep.id)
  }

  function resetReservation() {
    form.reset(reservationDefaults)
    setCurrentStepId("class")
    setResult(undefined)
    setFlowError(undefined)
  }

  if (result) {
    return (
      <main className="px-4 py-8 sm:px-6">
        <SuccessStep {...result} onReset={resetReservation} />
      </main>
    )
  }

  if (!catalog) {
    return (
      <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-3xl flex-col justify-center px-4 sm:px-6">
        {catalogLoading ? <Spinner className="mb-4 size-6" /> : null}
        <h1 className="text-2xl font-semibold">{t("loadingTitle")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("loadingDescription")}
        </p>
        {catalogError ? (
          <>
            <p className="mt-5 text-sm text-destructive">{catalogError}</p>
            <Button
              className="mt-4 w-fit"
              variant="outline"
              onClick={() => void reloadCatalog()}
            >
              {common("retry")}
            </Button>
          </>
        ) : null}
      </main>
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
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={(event) => void handleStepSubmit(event)}
        className="min-h-[calc(100svh-4rem)]"
      >
        <Progress
          className="mx-auto mt-8 max-w-7xl"
          value={((currentStepIndex + 1) / bookingSteps.length) * 100}
          aria-label={t("progress")}
        />
        <div className="px-4 py-10 sm:px-8 sm:py-14">
          {stepContent[currentStep.id]}
        </div>
        <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <div className="flex items-center gap-3">
              {flowError ? (
                <p className="hidden max-w-md text-right text-xs text-destructive sm:block">
                  {flowError}
                </p>
              ) : null}
            </div>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={currentStepIndex === 0 || isWorking}
                    onClick={returnToPreviousStep}
                  >
                    <ArrowLeft />
                    {common("back")}
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button type="submit" disabled={isWorking}>
                    {isWorking ? <Spinner /> : null}
                    {currentStep.id === "review"
                      ? t("confirmReservation")
                      : common("next")}
                    {currentStep.id !== "review" ? <ArrowRight /> : null}
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          {flowError ? (
            <p className="px-4 pb-3 text-xs text-destructive sm:hidden">
              {flowError}
            </p>
          ) : null}
        </div>
      </form>
    </FormProvider>
  )
}
