import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function ChoiceGrid<T extends number | string>({
  items,
  value,
  onChange,
  emptyText = "暂无可选项目",
}: {
  items: { value: T; label: string; description?: string; disabled?: boolean }[]
  value?: T
  onChange: (value: T) => void
  emptyText?: string
}) {
  if (!items.length) return <p className="border-y py-8 text-sm text-muted-foreground">{emptyText}</p>
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
      {items.map((item, index) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            disabled={item.disabled}
            aria-pressed={selected}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative min-h-24 rounded-md border border-foreground/20 bg-background p-4 text-left outline-none transition-colors hover:border-brand hover:bg-brand-soft focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-brand-soft",
              selected && "border-brand bg-brand text-brand-foreground hover:bg-brand hover:text-brand-foreground",
            )}
          >
            <span className={cn("mb-5 block font-mono text-[0.625rem] text-brand", selected && "text-brand-foreground/70")}>{String(index + 1).padStart(2, "0")}</span>
            <span className="block pr-8 text-base font-semibold">{item.label}</span>
            {item.description ? <span className={cn("mt-2 block text-xs text-muted-foreground", selected && "text-white/75")}>{item.description}</span> : null}
            {selected ? <Check className="absolute right-4 top-4 size-4" aria-hidden="true" /> : null}
          </button>
        )
      })}
    </div>
  )
}
