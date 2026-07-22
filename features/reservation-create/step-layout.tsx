import { AlertCircle } from "lucide-react"

export function StepLayout({
  eyebrow,
  title,
  description,
  error,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby="step-title" className="mx-auto w-full max-w-4xl">
      <p className="mb-3 text-xs font-semibold text-red-600">{eyebrow}</p>
      <h1 id="step-title" className="text-3xl font-semibold sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{description}</p>
      {error ? (
        <div className="mt-6 flex items-start gap-2 border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />{error}
        </div>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  )
}
