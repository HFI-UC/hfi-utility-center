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
      <ol className="grid grid-cols-3 gap-2 sm:gap-4">
        {bookingSteps.map((step, index) => (
          <li
            key={step.id}
            aria-current={index === currentStepIndex ? "step" : undefined}
            className="relative min-w-0 pt-2"
          >
            <span
              aria-hidden
              className="t-step-rail absolute inset-x-0 top-0 h-0.5 bg-foreground/25"
              data-reached=""
            />
            <span
              aria-hidden
              className="t-step-rail absolute inset-x-0 top-0 h-0.5 bg-primary"
              data-reached={index <= currentStepIndex ? "" : undefined}
            />
            <Button
              type="button"
              variant="step"
              disabled={isWorking || index >= currentStepIndex}
              onClick={() => onGoToStep(step.id)}
              className="w-full text-left"
            >
              <span
                className={cn(
                  "t-step-marker flex size-6 shrink-0 items-center justify-center rounded-full text-xs tabular-nums",
                  index === currentStepIndex
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground/10",
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
