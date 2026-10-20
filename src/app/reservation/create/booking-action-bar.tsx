"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function BookingActionBar({
  flowError,
  nextLabel,
  confirmLabel,
  isFirstStep,
  isLastStep,
  isWorking,
  submitDisabled = false,
  onPrevious,
  onNext,
}: {
  flowError?: string
  nextLabel: string
  confirmLabel?: string
  isFirstStep: boolean
  isLastStep: boolean
  isWorking: boolean
  submitDisabled?: boolean
  onPrevious: () => void
  onNext: () => void
}) {
  const t = useTranslations("booking")
  const common = useTranslations("common")

  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-5 flex min-w-0 flex-wrap items-center gap-2 border-t bg-background/95 px-[max(1rem,env(safe-area-inset-left))] pt-3 pr-[max(1rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:-mx-6 sm:justify-between sm:px-6 lg:-mx-8 lg:px-8">
      {flowError ? (
        <p role="alert" className="w-full min-w-0 text-sm break-words text-destructive">
          {flowError}
        </p>
      ) : null}
      <div className="flex w-full min-w-0 items-center gap-2 sm:justify-end">
        {!isFirstStep ? (
          <Button
            type="button"
            variant="outline"
            disabled={isWorking}
            onClick={onPrevious}
            className="h-auto min-h-11 min-w-0 flex-1 whitespace-normal sm:min-w-36 sm:flex-none"
          >
            <ArrowLeft aria-hidden />
            {common("back")}
          </Button>
        ) : null}
        {isLastStep ? (
          <Button
            key="confirm"
            type="submit"
            disabled={isWorking || submitDisabled}
            className="h-auto min-h-11 min-w-0 flex-1 whitespace-normal sm:min-w-36 sm:flex-none"
          >
            {isWorking ? <Spinner /> : null}
            {confirmLabel ?? t("confirmReservation")}
          </Button>
        ) : (
          <Button
            key="continue"
            type="button"
            disabled={isWorking}
            onClick={(event) => {
              event.preventDefault()
              onNext()
            }}
            className="h-auto min-h-11 min-w-0 flex-1 whitespace-normal sm:min-w-36 sm:flex-none"
          >
            {isWorking ? <Spinner /> : null}
            {nextLabel}
            {isWorking ? null : <ArrowRight aria-hidden />}
          </Button>
        )}
      </div>
    </div>
  )
}
