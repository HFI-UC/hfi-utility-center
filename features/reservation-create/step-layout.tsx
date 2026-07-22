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
  description?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <section aria-labelledby="step-title" className="mx-auto grid w-full max-w-7xl grid-cols-12 gap-x-4 sm:gap-x-6">
      <header className="col-span-12 border-t pt-4 lg:col-span-4">
        <p className="font-mono text-[0.6875rem] font-medium text-muted-foreground">STEP {eyebrow}</p>
        <p className="mt-4 text-5xl font-semibold leading-none sm:text-6xl" aria-hidden="true">{eyebrow.slice(0, 2)}</p>
        <h1 id="step-title" className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
        {description ? <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">{description}</p> : null}
      {error ? (
        <div className="mt-6 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />{error}
        </div>
      ) : null}
      </header>
      <div className="col-span-12 mt-10 border-t pt-6 lg:col-span-8 lg:mt-0">{children}</div>
    </section>
  )
}
