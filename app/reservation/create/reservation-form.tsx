"use client"

import { useState } from "react"
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
import { createReservation, getAvailability } from "@/lib/api/reservations"
import type { CatalogData } from "@/lib/api/types"
import { rangeIsAvailable } from "@/lib/reservations/availability"

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

export function ReservationForm({ catalog }: { catalog: CatalogData }) {
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
  const currentStepIndex = bookingSteps.findIndex(
    (step) => step.id === currentStepId
  )
  const currentStep = bookingSteps[currentStepIndex]

  async function selectedTimeIsStillAvailable(values: ReservationFormValues) {
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
      })
      setResult({ reservationId: response.reservationId })
    } finally {
      setIsWorking(false)
    }
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

  if (result) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 py-8 sm:px-8">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {t("createTitle")}
        </h1>
        <SuccessStep {...result} onReset={resetReservation} />
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
        onSubmit={form.handleSubmit(confirmReservation)}
        className="flex flex-1 flex-col"
      >
        <div className="px-5 pt-8 sm:px-8 sm:pt-10">
          <header className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
              <h1 className="text-2xl font-semibold sm:text-3xl">
                {t("createTitle")}
              </h1>
              <p className="text-sm font-medium text-muted-foreground">
                {t("step", {
                  current: currentStepIndex + 1,
                  total: bookingSteps.length,
                })}
              </p>
            </div>
            <Progress
              className="mt-4"
              value={((currentStepIndex + 1) / bookingSteps.length) * 100}
              aria-label={t("progress")}
            />
          </header>
        </div>
        <div className="flex-1 px-5 py-6 sm:px-8 sm:py-8">
          {stepContent[currentStep.id]}
        </div>
        <div className="sticky bottom-0 z-20 border-t bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 py-3">
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
                {currentStep.id === "review" ? (
                  <PaginationItem key="confirm">
                    <Button type="submit" disabled={isWorking}>
                      {isWorking ? <Spinner /> : null}
                      {t("confirmReservation")}
                    </Button>
                  </PaginationItem>
                ) : (
                  <PaginationItem key="next">
                    <Button
                      type="button"
                      disabled={isWorking}
                      onClick={continueToNextStep}
                    >
                      {isWorking ? <Spinner /> : null}
                      {common("next")}
                      <ArrowRight />
                    </Button>
                  </PaginationItem>
                )}
              </PaginationContent>
            </Pagination>
          </div>
          {flowError ? (
            <p className="pb-3 text-xs text-destructive sm:hidden">
              {flowError}
            </p>
          ) : null}
        </div>
      </form>
    </FormProvider>
  )
}
