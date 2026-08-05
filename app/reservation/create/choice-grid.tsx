import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  items: { value: T; label: string; disabled?: boolean }[]
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
            size="lg"
            className="w-full justify-start"
          >
            {item.label}
            {selected ? <Check className="ml-auto" /> : null}
          </Button>
        )
      })}
    </div>
  )
}
