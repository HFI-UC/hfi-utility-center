import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function ChoiceGrid<T extends number | string>({
  items,
  value,
  onChange,
  onBlur,
  name,
  invalid,
  label,
  emptyText = "暂无可选项目",
}: {
  items: { value: T; label: string; description?: string; disabled?: boolean }[]
  value?: T
  onChange: (value: T) => void
  onBlur?: () => void
  name?: string
  invalid?: boolean
  label?: string
  emptyText?: string
}) {
  if (!items.length) return <p className="border-y py-8 text-sm text-muted-foreground">{emptyText}</p>
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4"
      role="radiogroup"
      aria-label={label}
      aria-invalid={invalid || undefined}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) onBlur?.()
      }}
    >
      {items.map((item, index) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            name={name}
            type="button"
            role="radio"
            disabled={item.disabled}
            aria-checked={selected}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative min-h-24 rounded-lg border bg-background p-4 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40",
              selected && "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            <span className={cn("mb-5 block font-mono text-[0.625rem] text-muted-foreground", selected && "text-primary-foreground/70")}>{String(index + 1).padStart(2, "0")}</span>
            <span className="block pr-8 text-base font-bold">{item.label}</span>
            {item.description ? <span className={cn("mt-2 block text-xs text-muted-foreground", selected && "text-white/75")}>{item.description}</span> : null}
            {selected ? <Check className="absolute right-4 top-4 size-4" /> : null}
          </button>
        )
      })}
    </div>
  )
}
