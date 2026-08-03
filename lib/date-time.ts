const DATE_VALUE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DATE_TIME_VALUE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/
const HONG_KONG_OFFSET_SECONDS = 8 * 60 * 60

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
  const [year, month, day] = value.split("-").map(Number)
  if (!inputValueToDate(value)) return undefined

  const utcSeconds =
    Date.UTC(
      year,
      month - 1,
      day,
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0
    ) / 1000
  return utcSeconds - HONG_KONG_OFFSET_SECONDS
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
  const match = DATE_TIME_VALUE_PATTERN.exec(value)
  if (!match) return new Date(value)

  const [, year, month, day, hour, minute, second = "0"] = match
  const parts = [year, month, day, hour, minute, second].map(Number)
  const [numericYear, numericMonth, numericDay, numericHour, numericMinute] =
    parts
  const numericSecond = parts[5]
  const utcValue = Date.UTC(
    numericYear,
    numericMonth - 1,
    numericDay,
    numericHour,
    numericMinute,
    numericSecond
  )
  const normalized = new Date(utcValue)
  const isValid =
    normalized.getUTCFullYear() === numericYear &&
    normalized.getUTCMonth() === numericMonth - 1 &&
    normalized.getUTCDate() === numericDay &&
    normalized.getUTCHours() === numericHour &&
    normalized.getUTCMinutes() === numericMinute &&
    normalized.getUTCSeconds() === numericSecond

  if (!isValid) return new Date(Number.NaN)

  const timestamp = utcValue - HONG_KONG_OFFSET_SECONDS * 1000
  return new Date(timestamp)
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
