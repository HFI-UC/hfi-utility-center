import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/astryx"

export function StepLayout({
  title,
  description,
  error,
  hideHeader = false,
  children,
}: {
  title: string
  description?: string
  error?: string
  hideHeader?: boolean
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby="step-title" className="wizard-step-full">
      {hideHeader ? null : (
        <header className="panel-heading">
          <span className="panel-heading__accent" />
          <div>
            <h2 id="step-title">{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
        </header>
      )}
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
