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
    <section aria-labelledby="step-title" className="mx-auto grid w-full max-w-7xl grid-cols-12 gap-x-4 sm:gap-x-6">
      <header className="col-span-12 border-t-4 border-foreground pt-3 lg:col-span-4">
        <p className="swiss-label">{eyebrow}</p>
        <h1 id="step-title" className="mt-5 text-4xl font-bold leading-[0.95] sm:text-6xl">{title}</h1>
        <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {error ? (
        <div className="mt-6 flex items-start gap-2 border-l-4 border-red-600 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />{error}
        </div>
      ) : null}
      </header>
      <div className="col-span-12 mt-10 border-t border-foreground pt-6 lg:col-span-8 lg:mt-0">{children}</div>
    </section>
  )
}
