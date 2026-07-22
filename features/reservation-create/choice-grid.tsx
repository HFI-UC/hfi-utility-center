import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ChoiceGrid<T extends number | string>({
  items,
  value,
  onChange,
  onBlur,
  name,
  invalid,
  label,
  emptyText,
}: {
  items: { value: T; label: string; description?: string; disabled?: boolean }[]
  value?: T
  onChange: (value: T) => void
  onBlur?: () => void
  name?: string
  invalid?: boolean
  label?: string
  emptyText: string
}) {
  if (!items.length)
    return (
      <p className="border-y py-8 text-sm text-muted-foreground">{emptyText}</p>
    )
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
      {items.map((item) => {
        const selected = item.value === value
        return (
          <Button
            key={item.value}
            name={name}
            type="button"
            role="radio"
            disabled={item.disabled}
            aria-checked={selected}
            onClick={() => onChange(item.value)}
            variant={selected ? "default" : "outline"}
            className={cn(
              "relative h-auto min-h-16 justify-start rounded-lg p-4 text-left whitespace-normal",
              !selected && "bg-background"
            )}
          >
            <span className="block pr-8 text-sm font-medium">{item.label}</span>
            {item.description ? (
              <span
                className={cn(
                  "mt-2 block text-xs text-muted-foreground",
                  selected && "text-white/75"
                )}
              >
                {item.description}
              </span>
            ) : null}
            {selected ? (
              <Check className="absolute top-4 right-4 size-4" />
            ) : null}
          </Button>
        )
      })}
    </div>
  )
}
