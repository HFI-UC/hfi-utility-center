import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function StepLayout({
  title,
  description,
  error,
  children,
}: {
  title: string
  description?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby="step-title" className="mx-auto w-full max-w-5xl">
      <header className="mb-5 space-y-2">
        <h2 id="step-title" className="text-xl font-semibold sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
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
