"use client"

import { enUS, zhCN } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { FieldDescription, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Room } from "@/lib/api/types"
import { dateToInputValue, inputValueToDate } from "@/lib/date-time"

export function EditDateField({
  date,
  today,
  maximumDate,
  dateFormatter,
  selectedRoom,
  open,
  onOpenChange,
  onSelect,
}: {
  date: string
  today: Date
  maximumDate: Date
  dateFormatter: Intl.DateTimeFormat
  selectedRoom?: Room
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (date: string) => void
}) {
  const t = useTranslations("neo.management")
  const bookingT = useTranslations("booking")
  const locale = useLocale()
  const selected = inputValueToDate(date)

  return (
    <FieldSet className="min-w-0">
      <FieldLegend variant="label">{t("selectDateTime")}</FieldLegend>
      <FieldLabel htmlFor="cancel-date">{bookingT("dateTitle")}</FieldLabel>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="cancel-date"
            type="button"
            variant="outline"
            className="min-h-11 w-full justify-start sm:min-h-8"
          >
            <CalendarDays aria-hidden />
            <span className="min-w-0 truncate">
              {date ? dateFormatter.format(selected ?? today) : bookingT("dateTitle")}
            </span>
          </Button>
        </PopoverTrigger>
        {/* oxlint-disable-next-line shadcn/no-restyle -- calendar popover padding */}
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            showOutsideDays
            locale={locale === "zh-CN" ? zhCN : enUS}
            selected={selected}
            defaultMonth={selected || today}
            startMonth={today}
            endMonth={maximumDate}
            disabled={{ before: today, after: maximumDate }}
            onSelect={(value) => {
              if (value) onSelect(dateToInputValue(value))
            }}
          />
        </PopoverContent>
      </Popover>
      <FieldDescription>
        {selectedRoom ? `${t("room")}: ${selectedRoom.name}` : ""}
      </FieldDescription>
    </FieldSet>
  )
}
