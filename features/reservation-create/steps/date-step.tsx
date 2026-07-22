import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { StepLayout } from "@/features/reservation-create/step-layout"
import type { ReservationFormValues } from "@/features/reservation-create/schema"

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function DateStep() {
  const { register, setValue, formState } = useFormContext<ReservationFormValues>()
  const today = new Date()
  const maximum = new Date()
  maximum.setDate(maximum.getDate() + 30)
  return (
    <StepLayout eyebrow="04 / 07" title="选择日期" description="可以预约今天至未来 30 天。晚于 21:30 时，今天将不再提供时段。" error={formState.errors.date?.message}>
      <div className="max-w-sm border-y py-6">
        <Input
          type="date"
          min={formatDate(today)}
          max={formatDate(maximum)}
          {...register("date", {
            onChange: () => {
              setValue("startTime", 0)
              setValue("endTime", 0)
            },
          })}
        />
      </div>
    </StepLayout>
  )
}
