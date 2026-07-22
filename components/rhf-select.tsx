"use client"

import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SelectOption = {
  label: string
  value: string
}

export function RhfSelect<TValues extends FieldValues>({
  control,
  name,
  options,
  placeholder,
  className,
  required = true,
}: {
  control: Control<TValues>
  name: FieldPath<TValues>
  options: SelectOption[]
  placeholder: string
  className?: string
  required?: boolean
}) {
  const {
    field: { value, onChange, onBlur, name: fieldName, ref },
    fieldState,
  } = useController({ control, name, rules: { required } })

  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger
        ref={ref}
        name={fieldName}
        className={className ?? "w-full"}
        aria-invalid={fieldState.invalid || undefined}
        onBlur={onBlur}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
