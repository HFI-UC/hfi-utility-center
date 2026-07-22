"use client"

import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { useLocale, useTranslations } from "next-intl"
import { ClassStep } from "@/features/reservation-create/steps/class-step"
import { AuditoriumTemplateStep } from "@/features/reservation-create/steps/auditorium-template-step"
import { DateTimeStep } from "@/features/reservation-create/steps/date-time-step"
import { LocationStep } from "@/features/reservation-create/steps/location-step"
import { ProfileStep } from "@/features/reservation-create/steps/profile-step"
import { ReviewStep } from "@/features/reservation-create/steps/review-step"
import { SuccessStep } from "@/features/reservation-create/steps/success-step"
import { createReservationSchema, stepFields, type ReservationFormValues } from "@/features/reservation-create/schema"
import { profileStorageKey, reservationDefaults, storedProfile } from "@/features/reservation-create/form-state"
import { ApiError } from "@/lib/api/client"
import { getBootstrap } from "@/lib/api/catalog"
import { createReservation } from "@/lib/api/reservations"
import type { BootstrapData } from "@/lib/api/types"

export function ReservationWizard() {
  const t = useTranslations("booking")
  const common = useTranslations("common")
  const locale = useLocale() as "zh-CN" | "en-US"
  const schema = useMemo(() => createReservationSchema((key) => t(key)), [t])
  const methods = useForm<ReservationFormValues>({ resolver: zodResolver(schema), defaultValues: reservationDefaults, mode: "onTouched" })
  const specialFacility = useWatch({ control: methods.control, name: "specialFacility" })
  const [step, setStep] = useState(0)
  const [catalog, setCatalog] = useState<BootstrapData>()
  const [loadingError, setLoadingError] = useState<string>()
  const [submitError, setSubmitError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ reservationId?: number; message?: string }>()

  async function loadCatalog() {
    setLoadingError(undefined)
    try { setCatalog(await getBootstrap()) } catch (error) { setLoadingError(error instanceof ApiError ? error.message : t("loadError")) }
  }

  useEffect(() => {
    let active = true
    getBootstrap()
      .then((data) => { if (active) setCatalog(data) })
      .catch((error) => { if (active) setLoadingError(error instanceof ApiError ? error.message : t("loadError")) })
    const stored = window.localStorage.getItem(profileStorageKey)
    if (stored) {
      try { methods.reset({ ...reservationDefaults, ...JSON.parse(stored), rememberProfile: true }) } catch { window.localStorage.removeItem(profileStorageKey) }
    }
    return () => { active = false }
  }, [methods, t])

  async function next() {
    const valid = await methods.trigger(stepFields[step], { shouldFocus: true })
    if (valid) { setSubmitError(undefined); setStep((current) => Math.min(current + 1, specialFacility === "auditorium" ? 2 : 4)) }
  }

  async function submit(values: ReservationFormValues) {
    setSubmitting(true)
    setSubmitError(undefined)
    try {
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
        multimediaRequired: values.multimediaRequired,
        multimediaDetails: values.multimediaDetails || undefined,
        locale,
      })
      if (values.rememberProfile) {
        window.localStorage.setItem(profileStorageKey, JSON.stringify(storedProfile(values)))
      } else window.localStorage.removeItem(profileStorageKey)
      setResult({ reservationId: response.data?.reservationId, message: response.message })
    } catch (error) {
      const message = error instanceof ApiError ? error.message : t("submitError")
      setSubmitError(message)
      if (/conflict|冲突|policy|规则|occupied/i.test(message)) setStep(2)
    } finally { setSubmitting(false) }
  }

  if (result) return <main className="px-4 py-8 sm:px-6"><SuccessStep {...result} onReset={() => { methods.reset(reservationDefaults); setStep(0); setResult(undefined) }} /></main>

  if (!catalog) return <main className="mx-auto flex min-h-[65svh] max-w-3xl flex-col justify-center px-4 sm:px-6"><Loader2 className="mb-4 size-6 animate-spin" /><h1 className="text-2xl font-semibold">{t("loadingTitle")}</h1><p className="mt-3 text-sm text-muted-foreground">{t("loadingDescription")}</p>{loadingError ? <><p className="mt-5 text-sm text-red-600">{loadingError}</p><Button className="mt-4 w-fit" variant="outline" onClick={() => void loadCatalog()}>{common("retry")}</Button></> : null}</main>

  const isAuditorium = specialFacility === "auditorium"
  const steps = isAuditorium
    ? [<ClassStep key="class" catalog={catalog} />, <LocationStep key="location" catalog={catalog} onSelectAuditorium={() => setStep(2)} />, <AuditoriumTemplateStep key="auditorium" catalog={catalog} />]
    : [<ClassStep key="class" catalog={catalog} />, <LocationStep key="location" catalog={catalog} onSelectAuditorium={() => setStep(2)} />, <DateTimeStep key="datetime" />, <ProfileStep key="profile" />, <ReviewStep key="review" catalog={catalog} />]
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submit)} className="min-h-[calc(100svh-3.5rem)]">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 pt-5 sm:px-6" aria-label={t("progress")}>
          {Array.from({ length: steps.length }, (_, index) => <span key={index} className={`h-1 flex-1 ${index <= step ? "bg-red-600" : "bg-muted"}`} />)}
        </div>
        <div className="px-4 py-9 sm:px-6 sm:py-14">{steps[step]}</div>
        <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <Button type="button" variant="ghost" disabled={step === 0 || submitting} onClick={() => setStep((current) => Math.max(0, current - 1))}><ArrowLeft />{common("back")}</Button>
            <div className="flex items-center gap-3">
              {submitError ? <p className="hidden max-w-md text-right text-xs text-red-600 sm:block">{submitError}</p> : null}
              {!isAuditorium && step < 4 ? <Button type="button" onClick={() => void next()}>{common("next")}<ArrowRight /></Button> : !isAuditorium && step === 4 ? <Button type="submit" disabled={submitting}>{submitting ? <Loader2 className="animate-spin" /> : null}{common("submit")}</Button> : isAuditorium && step < 2 ? <Button type="button" onClick={() => void next()}>{common("next")}<ArrowRight /></Button> : null}
            </div>
          </div>
          {submitError ? <p className="px-4 pb-3 text-xs text-red-600 sm:hidden">{submitError}</p> : null}
        </div>
      </form>
    </FormProvider>
  )
}
