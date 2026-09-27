"use client"

import { Check } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { bookingSteps, type BookingStepId } from "./form"

// Progress breadcrumb where only completed steps are navigable.
export function BookingStepper({
  titles,
  currentStepIndex,
  isWorking,
  onGoToStep,
}: {
  titles: Record<BookingStepId, ReactNode>
  currentStepIndex: number
  isWorking: boolean
  onGoToStep: (step: BookingStepId) => void
}) {
  const t = useTranslations("booking")
  return (
    <nav aria-label={t("progress")} className="mb-6">
      <ol className="grid grid-cols-4 gap-2 sm:gap-4">
        {bookingSteps.map((step, index) => (
          <li
            key={step.id}
            aria-current={index === currentStepIndex ? "step" : undefined}
            className="relative min-w-0 pt-2"
          >
            <span
              aria-hidden
              className="t-step-rail absolute inset-x-0 top-0 h-0.5 bg-border"
              data-reached=""
            />
            <span
              aria-hidden
              className="t-step-rail absolute inset-x-0 top-0 h-0.5 bg-primary"
              data-reached={index <= currentStepIndex ? "" : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              disabled={isWorking || index >= currentStepIndex}
              onClick={() => onGoToStep(step.id)}
              className={cn(
                "h-auto min-h-11 w-full flex-col items-start gap-1 rounded-md px-1 py-1 text-left whitespace-normal disabled:opacity-100 sm:flex-row sm:items-center sm:gap-2",
                index > currentStepIndex && "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "t-step-marker flex size-6 shrink-0 items-center justify-center rounded-full text-xs tabular-nums",
                  index === currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
                data-current={index === currentStepIndex ? "" : undefined}
              >
                {index < currentStepIndex ? <Check aria-hidden className="size-3.5" /> : index + 1}
              </span>
              <span className="text-xs leading-5 sm:text-sm">{titles[step.id]}</span>
            </Button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
