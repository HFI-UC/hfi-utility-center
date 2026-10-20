import type { AvailabilitySlot } from "@/lib/api/types"
import { rangeIsAvailable } from "@/lib/reservations/availability"

/** Slot states collapsed into what the day timeline actually paints. */
export type DayBandKind = "open" | "reserved" | "closed"

export interface DayBand {
  kind: DayBandKind
  startTime: number
  endTime: number
  /** Horizontal offset and width, as a percentage of the day window. */
  left: number
  width: number
}

export interface DayWindow {
  startTime: number
  endTime: number
  spanSeconds: number
}

/** Booking lengths offered as duration chips, in minutes. */
export const DURATION_CHOICES = [15, 30, 45, 60, 90, 120]

/** Bands narrower than this cannot hold a readable time range. */
export const LABEL_MIN_PERCENT = 20

/** Length picked for the user on a fresh start, when the day allows it. */
const DEFAULT_DURATION = 60

/**
 * The window is simply the span the slots cover. Both availability builders
 * emit them in chronological order, so the first and last slot bound the day.
 */
export function dayWindow(slots: AvailabilitySlot[]): DayWindow | undefined {
  const first = slots[0]
  const last = slots.at(-1)
  if (!first || !last) return undefined

  return {
    startTime: first.startTime,
    endTime: last.endTime,
    spanSeconds: last.endTime - first.startTime,
  }
}

export function offsetPercent(timestamp: number, window: DayWindow) {
  return ((timestamp - window.startTime) / window.spanSeconds) * 100
}

/** How close a pointer must be, in pixels, before it sticks to a marked time. */
export const MAGNET_PX = 8

/**
 * Times the pointer prefers over a plain 15-minute step: hours, half hours,
 * and the edges of an open run. Those are the times people actually aim for.
 */
export function snapAnchors(bands: DayBand[], window: DayWindow) {
  const anchors: number[] = []
  const halfHour = 1800
  for (
    let cursor = Math.ceil(window.startTime / halfHour) * halfHour;
    cursor <= window.endTime;
    cursor += halfHour
  ) {
    anchors.push(cursor)
  }
  for (const band of bands) {
    if (band.kind !== "open") continue
    anchors.push(band.startTime)
    anchors.push(band.endTime)
  }
  return anchors
}

/**
 * 15-minute grid, unless the pointer is within `MAGNET_PX` of an anchor, in
 * which case it sticks there. `pxPerSecond` is the track's current scale, so
 * the same pixel radius holds on a phone and on a wide desktop.
 */
export function magnetize(
  timestamp: number,
  slotSeconds: number,
  anchors: number[],
  pxPerSecond: number,
) {
  const slot = Math.round(timestamp / slotSeconds) * slotSeconds
  if (!(pxPerSecond > 0)) return slot

  const reach = MAGNET_PX / pxPerSecond
  let nearest = slot
  let nearestGap = reach
  for (const anchor of anchors) {
    const gap = Math.abs(timestamp - anchor)
    if (gap > nearestGap) continue
    nearestGap = gap
    nearest = anchor
  }
  return nearest
}

/** Consecutive slots of the same state collapse into a single band. */
export function buildDayBands(slots: AvailabilitySlot[]): DayBand[] {
  const window = dayWindow(slots)
  if (!window) return []

  const bands: DayBand[] = []
  for (const slot of slots) {
    const kind: DayBandKind =
      slot.status === "available" ? "open" : slot.status === "occupied" ? "reserved" : "closed"
    const previous = bands.at(-1)
    if (previous?.kind === kind) {
      previous.endTime = slot.endTime
      continue
    }
    bands.push({ kind, startTime: slot.startTime, endTime: slot.endTime, left: 0, width: 0 })
  }

  for (const band of bands) {
    band.left = offsetPercent(band.startTime, window)
    band.width = offsetPercent(band.endTime, window) - band.left
  }

  return bands
}

/**
 * Axis marks two, three or four hours apart, by how long the window is: a
 * 13-hour day at two-hour steps crowds its labels into each other on a phone.
 * Windows also end mid-step (21:30), and that label crowds the last uniform
 * mark, so it is left out.
 */
export function hourMarks(window: DayWindow) {
  const hours = window.spanSeconds / 3600
  const step = hours <= 12 ? 2 * 3600 : hours <= 18 ? 3 * 3600 : 4 * 3600
  const marks: number[] = []
  for (
    let cursor = Math.ceil(window.startTime / 3600) * 3600;
    cursor < window.endTime;
    cursor += step
  ) {
    marks.push(cursor)
  }

  const last = marks.at(-1)
  if (last === undefined || window.endTime - last > step * 0.8) marks.push(window.endTime)
  return marks
}

/**
 * The bookable slot start closest to a pointer position. Tapping inside a
 * reserved or closed band therefore lands on the nearest bookable edge, and
 * returns 0 when the whole day is taken.
 */
export function nearestOpenStart(slots: AvailabilitySlot[], timestamp: number) {
  let nearest = 0
  let distance = Infinity
  for (const slot of slots) {
    if (slot.status !== "available") continue
    const gap = Math.abs(slot.startTime - timestamp)
    if (gap >= distance) continue
    distance = gap
    nearest = slot.startTime
  }
  return nearest
}

/** Steps over bookable slot starts only, so a key press never lands on a taken slot. */
export function shiftOpenStart(slots: AvailabilitySlot[], startTime: number, steps: number) {
  const open = slots.filter((slot) => slot.status === "available")
  const current = open.findIndex((slot) => slot.startTime >= startTime)
  if (current < 0) return startTime

  const next = current + steps

  if (next < 0) return open[0].startTime
  return (open[next] ?? open.at(-1)!).startTime
}

/**
 * End of the open run that begins at `startTime`, capped by the longest
 * booking. The end handle cannot travel past it, so a drag never lands on a
 * reserved or closed slot.
 */
export function latestEndTime(slots: AvailabilitySlot[], startTime: number, maxMinutes: number) {
  const limit = startTime + maxMinutes * 60
  let end = startTime
  for (const slot of slots) {
    if (slot.endTime <= startTime) continue
    if (slot.startTime > end || slot.status !== "available" || slot.endTime > limit) break
    end = slot.endTime
  }
  return end
}

/**
 * Earliest start that still leaves a legal range ending at `endTime`. A start
 * handle dragged leftwards stops here: the end stays where the user put it.
 */
export function earliestStartForEnd(
  slots: AvailabilitySlot[],
  endTime: number,
  maxMinutes: number,
) {
  let boundary = endTime
  for (let index = slots.length - 1; index >= 0; index -= 1) {
    const slot = slots[index]
    if (slot.endTime > endTime) continue
    if (slot.endTime !== boundary || slot.status !== "available") break
    boundary = slot.startTime
  }
  return Math.max(boundary, endTime - maxMinutes * 60)
}

/** Lengths the day can still hold from `startTime`, shortest first. */
export function durationChoices(slots: AvailabilitySlot[], startTime: number, maxMinutes: number) {
  if (!startTime) return []
  return DURATION_CHOICES.filter(
    (minutes) =>
      minutes <= maxMinutes &&
      rangeIsAvailable(slots, startTime, startTime + minutes * 60, maxMinutes),
  )
}

/** The length to select with a new start, so one tap leaves a valid range. */
export function defaultDuration(choices: number[]) {
  return choices.includes(DEFAULT_DURATION) ? DEFAULT_DURATION : choices.at(-1)
}
