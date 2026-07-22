export function dateToFormValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function formValueToDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : undefined
}

export function clockValue(timestamp: number) {
  if (!timestamp) return ""
  const date = new Date(timestamp * 1000)
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
}

export function timestampForDate(dateValue: string, timeValue: string) {
  if (!formValueToDate(dateValue) || !/^\d{2}:\d{2}$/.test(timeValue)) return 0
  return Math.floor(new Date(`${dateValue}T${timeValue}:00`).getTime() / 1000)
}
