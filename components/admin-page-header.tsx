export function AdminPageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: React.ReactNode }) {
  return (
    <header className="flex flex-col justify-between gap-6 border-t-4 border-foreground py-4 sm:flex-row sm:items-end">
      <div>
        <p className="swiss-label">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-bold leading-none sm:text-6xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </header>
  )
}
