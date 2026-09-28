const DATE_VALUE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const API_LOCAL_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/
const SHANGHAI_OFFSET_SECONDS = 8 * 60 * 60
const shanghaiFormatters = new WeakMap<Intl.DateTimeFormat, Intl.DateTimeFormat>()

// PHP returns Asia/Shanghai wall times without an offset. Attach that offset
// before parsing so browser timezone settings do not change their instant.
export function parseApiTimestamp(value: string) {
  const normalized = value.replace(" ", "T")
  return new Date(API_LOCAL_TIMESTAMP_PATTERN.test(normalized) ? `${normalized}+08:00` : normalized)
}

export function dateToInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function inputValueToDate(value: string) {
  if (!DATE_VALUE_PATTERN.test(value)) return undefined

  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  const isValid =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day

  return isValid ? date : undefined
}

export function inputValueToTimestamp(value: string, endOfDay = false) {
  if (!inputValueToDate(value)) return undefined
  const [year, month, day] = value.split("-").map(Number)
  return (
    Date.UTC(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0) / 1000 -
    SHANGHAI_OFFSET_SECONDS
  )
}

export function timeOnInputDateTimestamp(date: string, [hour, minute]: number[]) {
  const dayStart = inputValueToTimestamp(date)
  if (dayStart === undefined) return undefined
  return dayStart + hour * 60 * 60 + minute * 60
}

export function weekdayFromInputValue(value: string) {
  return inputValueToDate(value)?.getDay()
}

// Formats an API timestamp with fallback on invalid dates to prevent RangeError during render.
export function formatApiTimestamp(
  formatter: Intl.DateTimeFormat,
  value: string | number | Date | null | undefined,
  fallback = "",
) {
  if (!value) return fallback

  const date = typeof value === "string" ? parseApiTimestamp(value) : new Date(value)

  if (Number.isNaN(date.getTime())) return fallback

  let shanghaiFormatter = shanghaiFormatters.get(formatter)
  if (!shanghaiFormatter) {
    const options = formatter.resolvedOptions()
    shanghaiFormatter = new Intl.DateTimeFormat(options.locale, {
      ...(options as Intl.DateTimeFormatOptions),
      timeZone: "Asia/Shanghai",
    })
    shanghaiFormatters.set(formatter, shanghaiFormatter)
  }
  return shanghaiFormatter.format(date)
}
