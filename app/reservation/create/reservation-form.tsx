"use client"

import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { FormProvider, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { useTranslations } from "next-intl"
import { ClassStep } from "./steps/class-step"
import { DateTimeStep } from "./steps/date-time-step"
import { LocationStep } from "./steps/location-step"
import { ProfileStep } from "./steps/profile-step"
import { ReviewStep } from "./steps/review-step"
import { SuccessStep } from "./steps/success-step"
import {
  createReservationSchema,
  rangeIsAvailable,
  reservationDefaults,
  stepFields,
  type ReservationFormValues,
} from "./form"
import {
  checkReservationAvailability,
  loadReservationCatalog,
  submitReservation,
} from "./actions"
import type { BootstrapData } from "@/lib/api/types"

export function ReservationForm({
  initialCatalog,
}: {
  initialCatalog?: BootstrapData
}) {
  const t = useTranslations("booking")
  const common = useTranslations("common")
  const schema = useMemo(() => createReservationSchema((key) => t(key)), [t])
  const methods = useForm<ReservationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: reservationDefaults,
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldUnregister: false,
  })
  const [step, setStep] = useState(0)
  const [catalog, setCatalog] = useState<BootstrapData | undefined>(
    initialCatalog
  )
  const [loadingError, setLoadingError] = useState<string>()
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{
    reservationId?: number
    message?: string
  }>()

  async function loadCatalog() {
    setLoadingError(undefined)
    try {
      const result = await loadReservationCatalog()
      if (result.data) setCatalog(result.data)
      else setLoadingError(t("loadError"))
    } catch {
      setLoadingError(t("loadError"))
    }
  }

  useEffect(() => {
    if (initialCatalog) return
    let ignore = false

    async function loadInitialCatalog() {
      try {
        const result = await loadReservationCatalog()
        if (ignore) return
        if (result.data) setCatalog(result.data)
        else setLoadingError(t("loadError"))
      } catch {
        if (!ignore) setLoadingError(t("loadError"))
      }
    }

    void loadInitialCatalog()
    return () => {
      ignore = true
    }
  }, [initialCatalog, t])

  async function next() {
    const valid = await methods.trigger(stepFields[step], { shouldFocus: true })
    if (!valid) return
    if (step === 2 && catalog) {
      const values = methods.getValues()
      const room = catalog.rooms.find((item) => item.id === values.room)
      if (!room) return
      setSubmitting(true)
      try {
        const availability = await checkReservationAvailability(
          values.room,
          values.date
        )
        if (availability.error) {
          setSubmitError(t("availabilityError"))
          return
        }
        if (
          !rangeIsAvailable(
            availability.data.slots,
            values.startTime,
            values.endTime
          )
        ) {
          setSubmitError(t("timeConflict"))
          methods.setValue("startTime", 0)
          methods.setValue("endTime", 0)
          return
        }
      } catch {
        setSubmitError(t("availabilityError"))
        return
      } finally {
        setSubmitting(false)
      }
    }
    setSubmitError(undefined)
    setStep((current) => Math.min(current + 1, 4))
  }

  async function submit(values: ReservationFormValues) {
    setSubmitting(true)
    setSubmitError(undefined)
    try {
      const response = await submitReservation(values)
      if (response.error) {
        if (response.error === "conflict") {
          setStep(2)
          setSubmitError(t("timeConflict"))
        } else {
          setSubmitError(t("submitError"))
        }
        return
      }
      setResult(response.data)
    } catch {
      setSubmitError(t("submitError"))
    } finally {
      setSubmitting(false)
    }
  }

  if (result)
    return (
      <main className="px-4 py-8 sm:px-6">
        <SuccessStep
          {...result}
          onReset={() => {
            methods.reset(reservationDefaults)
            setStep(0)
            setResult(undefined)
          }}
        />
      </main>
    )

  if (!catalog)
    return (
      <main className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-3xl flex-col justify-center px-4 sm:px-6">
        {!loadingError ? <Spinner className="mb-4 size-6" /> : null}
        <h1 className="text-2xl font-semibold">{t("loadingTitle")}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t("loadingDescription")}
        </p>
        {loadingError ? (
          <>
            <p className="mt-5 text-sm text-destructive">{loadingError}</p>
            <Button
              className="mt-4 w-fit"
              variant="outline"
              onClick={() => void loadCatalog()}
            >
              {common("retry")}
            </Button>
          </>
        ) : null}
      </main>
    )

  const steps = [
    <ClassStep key="class" catalog={catalog} />,
    <LocationStep key="location" catalog={catalog} />,
    <DateTimeStep key="datetime" rooms={catalog.rooms} />,
    <ProfileStep key="profile" />,
    <ReviewStep key="review" catalog={catalog} />,
  ]
  return (
    <FormProvider {...methods}>
      <form
        noValidate
        onSubmit={methods.handleSubmit(submit)}
        className="min-h-[calc(100svh-4rem)]"
      >
        <Progress
          className="mx-auto mt-8 max-w-7xl"
          value={((step + 1) / steps.length) * 100}
          aria-label={t("progress")}
        />
        <div className="px-4 py-10 sm:px-8 sm:py-14">{steps[step]}</div>
        <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <div className="flex items-center gap-3">
              {submitError ? (
                <p className="hidden max-w-md text-right text-xs text-destructive sm:block">
                  {submitError}
                </p>
              ) : null}
            </div>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={step === 0 || submitting}
                    onClick={() =>
                      setStep((current) => Math.max(0, current - 1))
                    }
                  >
                    <ArrowLeft />
                    {common("back")}
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  {step < 4 ? (
                    <Button
                      type="button"
                      disabled={submitting}
                      onClick={() => void next()}
                    >
                      {submitting ? <Spinner /> : null}
                      {common("next")}
                      <ArrowRight />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={submitting}>
                      {submitting ? <Spinner /> : null}
                      {common("submit")}
                    </Button>
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          {submitError ? (
            <p className="px-4 pb-3 text-xs text-destructive sm:hidden">
              {submitError}
            </p>
          ) : null}
        </div>
      </form>
    </FormProvider>
  )
}
