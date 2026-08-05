import { AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function StepLayout({
  step,
  totalSteps = 5,
  title,
  description,
  error,
  children,
}: {
  step: number
  totalSteps?: number
  title: string
  description?: string
  error?: string
  children: React.ReactNode
}) {
  const t = useTranslations("booking")

  return (
    <section aria-labelledby="step-title" className="mx-auto w-full max-w-5xl">
      <header className="mb-8 space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          {t("step", { current: step, total: totalSteps })}
        </p>
        <h1 id="step-title" className="text-3xl font-semibold">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {children}
    </section>
  )
}
