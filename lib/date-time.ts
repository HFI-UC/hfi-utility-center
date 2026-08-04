const DATE_VALUE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
export const APP_TIME_ZONE = "Asia/Hong_Kong"

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
  if (!inputValueToDate(value)) return undefined
  const time = endOfDay ? "23:59:59" : "00:00:00"
  return new Date(`${value}T${time}+08:00`).getTime() / 1000
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
  if (!inputValueToDate(value)) return undefined
  const [year, month, day] = value.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

export function backendDateTimeToDate(value: string) {
  return new Date(value)
}

export function createAppDateTimeFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: APP_TIME_ZONE,
  })
}
