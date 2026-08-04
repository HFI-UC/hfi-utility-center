const DATE_VALUE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

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
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day

  return isValid ? date : undefined
}

export function inputValueToTimestamp(value: string, endOfDay = false) {
  if (!DATE_VALUE_PATTERN.test(value)) return undefined
  const date = inputValueToDate(value)
  if (!date) return undefined
  if (endOfDay) date.setHours(23, 59, 59, 0)
  return date.getTime() / 1000
}

export function timeOnInputDateTimestamp(
  date: string,
  [hour, minute]: number[]
) {
  const dayStart = inputValueToTimestamp(date)
  if (dayStart === undefined) return undefined
  return dayStart + hour * 60 * 60 + minute * 60
}

export function weekdayFromInputValue(value: string) {
  return inputValueToDate(value)?.getDay()
}
