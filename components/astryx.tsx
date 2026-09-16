"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from "react"
import { createPortal } from "react-dom"
import {
  Badge as AstryxBadge,
  Button as AstryxButton,
  Card as AstryxCard,
  CheckboxInput as AstryxCheckbox,
  ProgressBar as AstryxProgress,
  Spinner as AstryxSpinner,
  TextArea as AstryxTextArea,
  TextInput as AstryxTextInput,
} from "@astryxdesign/core"
import { DayPicker, type DayPickerProps } from "react-day-picker"
import { cn } from "@/lib/utils"

type AnyProps = Record<string, any>
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & AnyProps
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> &
  AnyProps

const buttonVariant = (variant?: string) => {
  if (!variant || variant === "default") return "primary"
  if (variant === "destructive") return "error"
  if (variant === "outline") return "secondary"
  return variant
}

const buttonSize = (size?: string) => {
  if (size === "lg") return "lg"
  if (size === "sm" || size === "xs") return "sm"
  return "md"
}

export function Button({
  children,
  label,
  variant,
  size,
  isLoading,
  isDisabled,
  disabled,
  icon,
  asChild,
  className,
  ...props
}: AnyProps) {
  const content = children ?? label ?? "Action"
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...props,
      className: cn(
        (children as React.ReactElement<any>).props.className,
        className
      ),
    })
  }
  return (
    <AstryxButton
      {...props}
      label={
        typeof label === "string"
          ? label
          : typeof content === "string"
            ? content
            : "Action"
      }
      variant={buttonVariant(variant) as any}
      size={buttonSize(size) as any}
      isLoading={isLoading}
      isDisabled={isDisabled ?? disabled}
      icon={icon}
      className={className}
    >
      {content}
    </AstryxButton>
  )
}

export function buttonVariants({ variant, size, className }: AnyProps = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition",
    className,
    {
      "bg-[var(--color-background-accent)] text-white": variant === "default",
      "border border-[var(--color-border-default)] bg-transparent":
        variant === "outline",
      "text-[var(--color-text-primary)]":
        variant === "ghost" || variant === "link",
      "h-8": size === "sm",
    }
  )
}

export function Card({ className, children, ...props }: AnyProps) {
  return (
    <AstryxCard
      {...props}
      variant={props.variant || "default"}
      className={cn("overflow-hidden", className)}
    >
      {children}
    </AstryxCard>
  )
}
export const CardHeader = ({ className, ...props }: AnyProps) => (
  <div
    className={cn("flex items-start justify-between gap-3 p-5", className)}
    {...props}
  />
)
export const CardTitle = ({ className, ...props }: AnyProps) => (
  <h3 className={cn("text-base font-semibold", className)} {...props} />
)
export const CardDescription = ({ className, ...props }: AnyProps) => (
  <p
    className={cn("text-sm text-[var(--color-text-secondary)]", className)}
    {...props}
  />
)
export const CardAction = ({ className, ...props }: AnyProps) => (
  <div className={cn("ml-auto", className)} {...props} />
)
export const CardContent = ({ className, ...props }: AnyProps) => (
  <div className={cn("p-5 pt-0", className)} {...props} />
)
export const CardFooter = ({ className, ...props }: AnyProps) => (
  <div
    className={cn("flex items-center gap-2 p-5 pt-0", className)}
    {...props}
  />
)

export function Badge({
  label,
  children,
  variant,
  className,
  ...props
}: AnyProps) {
  return (
    <AstryxBadge
      {...props}
      label={label ?? children}
      variant={
        (variant === "destructive" ? "error" : variant || "neutral") as any
      }
      className={className}
    />
  )
}

export function Input({
  className,
  onChange,
  value,
  defaultValue,
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      className={cn(
        "h-10 w-full rounded-lg border border-[var(--color-border-default)] bg-[var(--color-background-default)] px-3 text-sm outline-none focus:border-[var(--color-border-accent)]",
        className
      )}
    />
  )
}

export function Textarea({
  className,
  onChange,
  value,
  ...props
}: TextareaProps) {
  return (
    <AstryxTextArea
      {...props}
      label={props["aria-label"] || props.label || "Text"}
      isLabelHidden
      value={String(value ?? "")}
      onChange={(next: string) =>
        onChange?.({
          target: { value: next },
        } as React.ChangeEvent<HTMLTextAreaElement>)
      }
      className={className}
    />
  )
}

export function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  children,
  ...props
}: AnyProps & { onCheckedChange?: (checked: boolean) => void }) {
  return (
    <AstryxCheckbox
      {...props}
      label={
        props["aria-label"] ||
        (typeof children === "string" ? children : "Select")
      }
      isLabelHidden={!children}
      value={checked ?? defaultChecked ?? false}
      onChange={(next: boolean) => onCheckedChange?.(next)}
      className={props.className}
    />
  )
}

export const Progress = ({
  value = 0,
  max = 100,
  className,
  ...props
}: AnyProps) => (
  <AstryxProgress
    {...props}
    value={value}
    max={max}
    label="Progress"
    isLabelHidden
    className={className}
  />
)
export const Spinner = ({ className, ...props }: AnyProps) => (
  <AstryxSpinner {...props} className={className} />
)

export const Field = ({ className, ...props }: AnyProps) => (
  <div className={cn("grid gap-2", className)} {...props} />
)
export const FieldSet = ({ className, ...props }: AnyProps) => (
  <fieldset className={cn("grid gap-4", className)} {...props} />
)
export const FieldGroup = ({ className, ...props }: AnyProps) => (
  <div className={cn("grid gap-4", className)} {...props} />
)
export const FieldContent = ({ className, ...props }: AnyProps) => (
  <div className={cn("grid gap-1", className)} {...props} />
)
export const FieldLabel = ({ className, ...props }: AnyProps) => (
  <label className={cn("text-sm font-medium", className)} {...props} />
)
export const FieldLegend = ({ className, ...props }: AnyProps) => (
  <legend className={cn("mb-1 text-sm font-semibold", className)} {...props} />
)
export const FieldDescription = ({ className, ...props }: AnyProps) => (
  <p
    className={cn("text-xs text-[var(--color-text-secondary)]", className)}
    {...props}
  />
)
export const FieldError = ({ className, children, ...props }: AnyProps) =>
  children ? (
    <p
      className={cn("text-xs text-[var(--color-text-error)]", className)}
      {...props}
    >
      {children}
    </p>
  ) : null

export const Alert = ({ className, ...props }: AnyProps) => (
  <div
    role="alert"
    className={cn(
      "rounded-lg border border-[var(--color-border-default)] bg-[var(--color-background-secondary)] p-4 text-sm",
      className
    )}
    {...props}
  />
)
export const AlertDescription = ({ className, ...props }: AnyProps) => (
  <p className={cn("text-sm", className)} {...props} />
)
export const Separator = ({
  className,
  orientation = "horizontal",
  ...props
}: AnyProps) => (
  <div
    role="separator"
    className={cn(
      orientation === "vertical" ? "w-px self-stretch" : "h-px w-full",
      "bg-[var(--color-border-default)]",
      className
    )}
    {...props}
  />
)

type LayerContextValue = { open: boolean; setOpen: (open: boolean) => void }
const LayerContext = React.createContext<LayerContextValue | null>(null)
function useLayerContext() {
  return React.useContext(LayerContext)
}

export function Dialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: AnyProps & { onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = controlledOpen ?? internalOpen
  const setOpen = (next: boolean) => {
    setInternalOpen(next)
    onOpenChange?.(next)
  }
  return (
    <LayerContext.Provider value={{ open, setOpen }}>
      {children}
    </LayerContext.Provider>
  )
}
export function DialogTrigger({ asChild, children, ...props }: AnyProps) {
  const ctx = useLayerContext()
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    return React.cloneElement(child, {
      ...props,
      onClick: (event: React.MouseEvent) => {
        child.props.onClick?.(event)
        if (!event.defaultPrevented) ctx?.setOpen(true)
      },
    })
  }
  return (
    <button type="button" {...props} onClick={() => ctx?.setOpen(true)}>
      {children}
    </button>
  )
}
export function DialogClose({ asChild, children, ...props }: AnyProps) {
  const ctx = useLayerContext()
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>
    return React.cloneElement(child, {
      ...props,
      onClick: (event: React.MouseEvent) => {
        child.props.onClick?.(event)
        if (!event.defaultPrevented) ctx?.setOpen(false)
      },
    })
  }
  return (
    <button type="button" {...props} onClick={() => ctx?.setOpen(false)}>
      {children}
    </button>
  )
}
export const DialogPortal = ({ children }: AnyProps) => <>{children}</>
export const DialogOverlay = ({ className, ...props }: AnyProps) => (
  <div className={cn("fixed inset-0 z-40 bg-black/30", className)} {...props} />
)
export function DialogContent({ className, children, ...props }: AnyProps) {
  const ctx = useLayerContext()
  if (!ctx?.open) return null
  if (typeof document === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <DialogOverlay onClick={() => ctx.setOpen(false)} />
      <div
        role="dialog"
        className={cn(
          "relative z-50 max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-[var(--color-background-default)] p-6 shadow-2xl",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}
export const DialogHeader = ({ className, ...props }: AnyProps) => (
  <div className={cn("mb-4 grid gap-1", className)} {...props} />
)
export const DialogFooter = ({ className, ...props }: AnyProps) => (
  <div className={cn("mt-6 flex justify-end gap-2", className)} {...props} />
)
export const DialogTitle = ({ className, ...props }: AnyProps) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props} />
)
export const DialogDescription = ({ className, ...props }: AnyProps) => (
  <p
    className={cn("text-sm text-[var(--color-text-secondary)]", className)}
    {...props}
  />
)

export const AlertDialog = Dialog
export const AlertDialogTrigger = DialogTrigger
export const AlertDialogContent = DialogContent
export const AlertDialogHeader = DialogHeader
export const AlertDialogFooter = DialogFooter
export const AlertDialogTitle = DialogTitle
export const AlertDialogDescription = DialogDescription
export const AlertDialogCancel = DialogClose
export const AlertDialogAction = DialogClose

export const Popover = Dialog
export const PopoverTrigger = DialogTrigger
export const PopoverContent = ({ className, children, ...props }: AnyProps) => {
  const ctx = useLayerContext()
  if (!ctx?.open) return null
  return (
    <div
      className={cn(
        "absolute z-50 mt-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-background-default)] p-3 shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

type SelectContextValue = {
  value?: string
  onValueChange?: (value: string) => void
}
const SelectContext = React.createContext<SelectContextValue>({})
export function Select({
  value,
  defaultValue,
  onValueChange,
  children,
  className,
}: AnyProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value ?? internal
  const change = (next: string) => {
    setInternal(next)
    onValueChange?.(next)
  }
  return (
    <SelectContext.Provider value={{ value: current, onValueChange: change }}>
      <div className={cn("relative grid gap-1", className)}>{children}</div>
    </SelectContext.Provider>
  )
}
export const SelectGroup = ({ className, ...props }: AnyProps) => (
  <div className={cn("grid gap-1", className)} {...props} />
)
export const SelectLabel = ({ className, ...props }: AnyProps) => (
  <span className={cn("px-2 py-1 text-xs font-medium", className)} {...props} />
)
export const SelectValue = ({ placeholder, children }: AnyProps) => (
  <>{children || placeholder}</>
)
export const SelectTrigger = ({ className, children, ...props }: AnyProps) => (
  <div
    className={cn(
      "flex min-h-10 items-center rounded-lg border border-[var(--color-border-default)] px-3 text-sm",
      className
    )}
    {...props}
  >
    {children}
  </div>
)
export const SelectContent = ({ className, children, ...props }: AnyProps) => (
  <div
    className={cn(
      "grid gap-1 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-background-default)] p-1",
      className
    )}
    {...props}
  >
    {children}
  </div>
)
export function SelectItem({ value, children, className, ...props }: AnyProps) {
  const ctx = React.useContext(SelectContext)
  return (
    <button
      type="button"
      className={cn(
        "rounded-md px-2 py-1.5 text-left text-sm hover:bg-[var(--color-background-secondary)]",
        className
      )}
      onClick={() => ctx.onValueChange?.(value)}
      {...props}
    >
      {children}
    </button>
  )
}
export const SelectSeparator = Separator
export const SelectScrollUpButton = () => null
export const SelectScrollDownButton = () => null

export const Table = ({ className, ...props }: AnyProps) => (
  <div className="overflow-x-auto">
    <table className={cn("w-full text-sm", className)} {...props} />
  </div>
)
export const TableHeader = ({ className, ...props }: AnyProps) => (
  <thead
    className={cn("border-b border-[var(--color-border-default)]", className)}
    {...props}
  />
)
export const TableBody = ({ className, ...props }: AnyProps) => (
  <tbody className={className} {...props} />
)
export const TableFooter = ({ className, ...props }: AnyProps) => (
  <tfoot className={className} {...props} />
)
export const TableHead = ({ className, ...props }: AnyProps) => (
  <th className={cn("px-3 py-2 text-left font-medium", className)} {...props} />
)
export const TableRow = ({ className, ...props }: AnyProps) => (
  <tr
    className={cn("border-b border-[var(--color-border-default)]", className)}
    {...props}
  />
)
export const TableCell = ({ className, ...props }: AnyProps) => (
  <td className={cn("px-3 py-2 align-top", className)} {...props} />
)
export const TableCaption = ({ className, ...props }: AnyProps) => (
  <caption
    className={cn(
      "p-3 text-left text-sm text-[var(--color-text-secondary)]",
      className
    )}
    {...props}
  />
)

export const InputGroup = ({ className, ...props }: AnyProps) => (
  <div className={cn("flex items-center gap-2", className)} {...props} />
)
export const InputGroupAddon = ({ className, ...props }: AnyProps) => (
  <div
    className={cn("text-[var(--color-text-secondary)]", className)}
    {...props}
  />
)
export const InputGroupInput = Input
export const InputGroupTextarea = Textarea

export const Pagination = ({ className, ...props }: AnyProps) => (
  <nav aria-label="Pagination" className={cn("flex", className)} {...props} />
)
export const PaginationContent = ({ className, ...props }: AnyProps) => (
  <div className={cn("flex items-center gap-1", className)} {...props} />
)
export const PaginationItem = ({ className, ...props }: AnyProps) => (
  <span className={className} {...props} />
)
export const PaginationLink = ({ className, ...props }: AnyProps) => (
  <a
    className={cn(
      "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm hover:bg-[var(--color-background-secondary)]",
      className
    )}
    {...props}
  />
)
export const PaginationPrevious = ({ className, ...props }: AnyProps) => (
  <PaginationLink className={className} {...props}>
    Previous
  </PaginationLink>
)
export const PaginationNext = ({ className, ...props }: AnyProps) => (
  <PaginationLink className={className} {...props}>
    Next
  </PaginationLink>
)
export const PaginationEllipsis = ({ className, ...props }: AnyProps) => (
  <span className={cn("px-2", className)} {...props}>
    …
  </span>
)

export function Calendar(props: DayPickerProps & AnyProps) {
  return (
    <DayPicker
      {...props}
      className={cn(
        "rounded-xl border border-[var(--color-border-default)] p-3",
        props.className
      )}
    />
  )
}

export const Drawer = Dialog
export const DrawerTrigger = DialogTrigger
export const DrawerContent = DialogContent
export const DrawerHeader = DialogHeader
export const DrawerFooter = DialogFooter
export const DrawerTitle = DialogTitle
export const DrawerDescription = DialogDescription
export const DrawerClose = DialogClose

export const Label = FieldLabel

export const TextInput = AstryxTextInput
export const TextArea = AstryxTextArea
export const CheckboxInput = AstryxCheckbox
export const Toaster = () => null
