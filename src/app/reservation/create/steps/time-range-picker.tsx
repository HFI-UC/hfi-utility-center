"use client"

import { Check, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { PercentBox, PercentSpan } from "@/components/layout/percent-span"
import { Button } from "@/components/ui/button"
import { FieldDescription, FieldError, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Toggle } from "@/components/ui/toggle"
import type { AvailabilityData } from "@/lib/api/types"
import { MAX_DURATION_MINUTES } from "@/lib/reservations/availability"
import {
  buildDayBands,
  dayWindow,
  defaultDuration,
  durationChoices,
  earliestStartForEnd,
  hourMarks,
  LABEL_MIN_PERCENT,
  latestEndTime,
  magnetize,
  nearestOpenStart,
  offsetPercent,
  snapAnchors,
  type DayBandKind,
  type DayWindow,
} from "@/lib/reservations/day-timeline"
import { cn } from "@/lib/utils"

const BAND_CLASS: Record<DayBandKind, string> = {
  open: "bg-success-soft",
  reserved: "bg-warning-soft",
  closed: "bg-muted",
}

/** Slot steps per key press: one slot sideways, four slots up and down. */
const KEY_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowDown: -4,
  ArrowUp: 4,
}

type Handle = "start" | "end"

/** Which edge, if any, is being dragged or hovered right now. */
type ActiveEdge = Handle | null

/**
 * Where a gesture sits on the track, which part owns it, and the grab offset
 * it keeps. Pointer events bubble, so the track's own move handler has to know
 * that a handle, not the background, is being dragged.
 */
type Gesture = { left: number; width: number; offset: number; owner: Handle | "track" }

/** The pair a gesture on either handle produces. */
export type ReservationRange = { startTime: number; endTime: number }

/**
 * The time choice as one control: the day's open, reserved and closed hours as
 * a single band, with a start and an end handle on it. The length chips stay
 * because "an hour, from four" is one tap, while the handles are there for
 * ranges the chips cannot offer.
 */
export function TimeRangePicker({
  availability,
  startTime,
  endTime,
  formatTime,
  loading,
  invalid,
  errors,
  startHandleRef,
  onStartBlur,
  onRefresh,
  onRangeChange,
}: {
  availability: AvailabilityData
  startTime: number
  endTime: number
  formatTime: (value: number) => string
  loading: boolean
  invalid: boolean
  errors: Array<{ message?: string } | undefined>
  startHandleRef?: (element: HTMLDivElement | null) => void
  onStartBlur?: () => void
  onRefresh: () => void
  onRangeChange: (range: ReservationRange) => void
}) {
  const t = useTranslations("booking")
  const hintId = useId()
  const track = useRef<HTMLDivElement | null>(null)
  const gesture = useRef<Gesture | null>(null)
  const { slots, slotMinutes, maxDurationMinutes } = availability

  const day = useMemo(() => {
    const window = dayWindow(slots)
    return window ? { window, bands: buildDayBands(slots), marks: hourMarks(window) } : undefined
  }, [slots])
  const choices = useMemo(
    () => durationChoices(slots, startTime, maxDurationMinutes),
    [slots, startTime, maxDurationMinutes],
  )
  const anchors = useMemo(() => (day ? snapAnchors(day.bands, day.window) : []), [day])
  const [active, setActive] = useState<ActiveEdge>(null)
  const [customOpen, setCustomOpen] = useState(false)
  const [hoverTime, setHoverTime] = useState(0)
  // Which handle the pointer is close enough to grab. Its grip stays hidden
  // otherwise, so it never covers the time written on the band.
  const [near, setNear] = useState<ActiveEdge>(null)
  const bandText: Record<DayBandKind, string> = {
    open: t("available"),
    reserved: t("occupied"),
    closed: t("unavailable"),
  }

  if (!day) return null

  const { window, bands, marks } = day
  const step = slotMinutes * 60
  const earliest = nearestOpenStart(slots, window.startTime)
  // The start handle rests on the first bookable slot until one is chosen, so
  // the day is grabbable and keyboard-reachable from the first paint.
  const shownStart = startTime || earliest
  const latest = startTime ? latestEndTime(slots, startTime, maxDurationMinutes) : 0
  const minutes = startTime && endTime > startTime ? (endTime - startTime) / 60 : 0
  // Each handle is bounded by the other: a range slider moves one edge at a
  // time, and the untouched edge stays exactly where the user put it.
  const startFloor = endTime ? earliestStartForEnd(slots, endTime, maxDurationMinutes) : earliest
  const startCeiling = endTime ? endTime - step : nearestOpenStart(slots, window.endTime - step)

  /** Pixel position of a timestamp inside the measured track. */
  function xOf(timestamp: number, at: Gesture) {
    return at.left + (offsetPercent(timestamp, window) / 100) * at.width
  }

  /**
   * 15-minute grid, then a short reach toward hours, half hours, and the edges
   * of an open run. The reach is a pixel radius, so a phone and a wide desktop
   * snap with the same feel.
   */
  function snap(clientX: number) {
    const current = gesture.current
    if (!current?.width) return 0
    const ratio = (clientX - current.offset - current.left) / current.width
    const raw = window.startTime + Math.min(1, Math.max(0, ratio)) * window.spanSeconds
    return magnetize(raw, step, anchors, current.width / window.spanSeconds)
  }

  /**
   * A tap re-anchors the whole range at the pointer: "I want to start around
   * here". The length rides along when the day still allows it.
   */
  function anchorStart(next: number) {
    const snapped = nearestOpenStart(slots, next)
    if (!snapped || snapped === startTime) return
    const available = durationChoices(slots, snapped, maxDurationMinutes)
    const length = (available.includes(minutes) ? minutes : 0) || defaultDuration(available)
    onRangeChange({
      startTime: snapped,
      endTime: length ? snapped + length * 60 : 0,
    })
  }

  /** Dragging the start handle moves the start alone: the end stays put. */
  function dragStart(next: number) {
    if (!endTime) {
      anchorStart(next)
      return
    }
    const snapped = Math.min(Math.max(nearestOpenStart(slots, next), startFloor), startCeiling)
    if (!snapped || snapped === startTime) return
    onRangeChange({ startTime: snapped, endTime })
  }

  /** Dragging the end handle moves the end alone, inside the open run. */
  function dragEnd(next: number) {
    if (!startTime) return
    const end = Math.min(Math.max(next, startTime + step), latest)
    if (end === endTime) return
    onRangeChange({ startTime, endTime: end })
  }

  function beginDrag(event: PointerEvent<HTMLDivElement>, handle: Handle) {
    const element = track.current
    if (!element) return
    const bounds = element.getBoundingClientRect()
    const at: Gesture = {
      left: bounds.left + element.clientLeft,
      width: element.clientWidth,
      offset: 0,
      owner: handle,
    }
    // The gesture keeps the offset between finger and value, so grabbing a
    // handle never snaps it to the pointer before the first move.
    at.offset = event.clientX - xOf(handle === "start" ? shownStart : endTime, at)
    gesture.current = at
    setActive(handle)
    event.currentTarget.setPointerCapture(event.pointerId)
    dragTo(event, handle)
  }

  function dragTo(event: PointerEvent<HTMLDivElement>, handle: Handle) {
    // Hovering a handle must not move it. Without a live gesture, snap() is 0
    // and the end collapses to the start plus one slot.
    if (gesture.current?.owner !== handle) return
    if (handle === "start") dragStart(snap(event.clientX))
    else dragEnd(snap(event.clientX))
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    gesture.current = null
    setActive(null)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function previewAt(clientX: number) {
    const element = track.current
    if (!element || element.clientWidth === 0) return
    const bounds = element.getBoundingClientRect()
    const left = bounds.left + element.clientLeft
    const ratio = Math.min(1, Math.max(0, (clientX - left) / element.clientWidth))
    const raw = window.startTime + ratio * window.spanSeconds
    setHoverTime(magnetize(raw, step, anchors, element.clientWidth / window.spanSeconds))
    // A grip appears once the pointer is within its own hit width of it.
    const reach = 12
    const distance = (timestamp: number) =>
      Math.abs(clientX - (left + (offsetPercent(timestamp, window) / 100) * element.clientWidth))
    const startGap = distance(shownStart)
    const endGap = endTime ? distance(endTime) : Infinity
    const closest = Math.min(startGap, endGap)
    setNear(closest > reach ? null : startGap <= endGap ? "start" : "end")
  }

  function applyKey(handle: Handle, next: number) {
    if (handle === "start") dragStart(next)
    else dragEnd(next)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>, handle: Handle) {
    const value = handle === "start" ? shownStart : endTime
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault()
      const low = handle === "start" ? startFloor : startTime + step
      const high = handle === "start" ? startCeiling : latest
      applyKey(handle, event.key === "Home" ? low : high)
      return
    }

    const steps = KEY_STEPS[event.key]
    if (steps === undefined) return
    event.preventDefault()
    applyKey(handle, value + steps * step)
  }

  const startLeft = `${offsetPercent(shownStart, window)}%`
  const endLeft = `${offsetPercent(endTime, window)}%`
  const hoverLeft = hoverTime ? `${offsetPercent(hoverTime, window)}%` : undefined
  const ticks = tickMarks(window)

  return (
    <FieldSet className="min-w-0" data-invalid={invalid}>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <FieldLegend variant="label">{t("timeRange")}</FieldLegend>
          <FieldDescription>{t("timeHelp")}</FieldDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 shrink-0"
          aria-label={t("refresh")}
          disabled={loading}
          onClick={onRefresh}
        >
          {loading ? <Spinner /> : <RefreshCw aria-hidden />}
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        <div aria-hidden className="relative h-8 overflow-hidden rounded-md border border-border">
          {bands.map((band) => (
            <PercentSpan
              key={`${band.kind}-${band.startTime}`}
              left={`${band.left}%`}
              width={`${band.width}%`}
              className={cn("inset-y-0", BAND_CLASS[band.kind])}
            />
          ))}
          {minutes ? (
            <PercentSpan
              left={startLeft}
              width={`${offsetPercent(endTime, window) - offsetPercent(startTime, window)}%`}
              className="inset-y-0 border-x-2 border-primary bg-primary/25"
            />
          ) : null}
        </div>
        <Select
          value={startTime ? String(startTime) : ""}
          onValueChange={(value) => anchorStart(Number(value))}
        >
          <SelectTrigger className="min-h-11 w-full" aria-label={t("startTime")}>
            <SelectValue placeholder={t("selectStartHint")} />
          </SelectTrigger>
          <SelectContent>
            {slots
              .filter((slot) => slot.status === "available")
              .map((slot) => (
                <SelectItem
                  key={slot.startTime}
                  value={String(slot.startTime)}
                  className="min-h-11"
                >
                  {formatTime(slot.startTime)}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select
          value={endTime ? String(endTime) : ""}
          disabled={!startTime}
          onValueChange={(value) => dragEnd(Number(value))}
        >
          <SelectTrigger className="min-h-11 w-full" aria-label={t("endTime")}>
            <SelectValue
              placeholder={
                maxDurationMinutes > MAX_DURATION_MINUTES
                  ? t("selectEndHintOpen")
                  : t("selectEndHint")
              }
            />
          </SelectTrigger>
          <SelectContent>
            {endChoices(slots, startTime, latest, step).map((timestamp) => (
              <SelectItem key={timestamp} value={String(timestamp)} className="min-h-11">
                {formatTime(timestamp)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden min-w-0 md:block">
        <div className="px-3">
          <div
            ref={track}
            // A tap on bare track re-anchors the range. A handle inside it owns
            // its own gesture, so the background check is on the target, not on
            // propagation: a handle's move events bubble through here too.
            onPointerDown={(event) => {
              if (event.target !== event.currentTarget) return
              if (event.pointerType === "mouse" && event.button !== 0) return
              const bounds = event.currentTarget.getBoundingClientRect()
              gesture.current = {
                left: bounds.left + event.currentTarget.clientLeft,
                width: event.currentTarget.clientWidth,
                offset: 0,
                owner: "track",
              }
              event.currentTarget.setPointerCapture(event.pointerId)
              anchorStart(snap(event.clientX))
            }}
            onPointerMove={(event) => {
              // Re-entering the track is not a drag. Only a pointer that is
              // still held down may move the range; otherwise a hover near the
              // selection snaps it back to a 15-minute slot.
              if (gesture.current?.owner === "track" && event.buttons === 1) {
                anchorStart(snap(event.clientX))
                return
              }
              if (!gesture.current && event.pointerType === "mouse") previewAt(event.clientX)
            }}
            onPointerLeave={() => {
              setHoverTime(0)
              setNear(null)
            }}
            onPointerUp={endDrag}
            onPointerCancel={() => {
              gesture.current = null
              setActive(null)
            }}
            className="relative h-11 w-full touch-none rounded-lg border border-border select-none"
          >
            {/* Fills are square spans. Clip them here, not on the track: the
                time bubble above a handle has to escape the rounded corner. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
            >
              <span className="absolute inset-x-0 top-0 z-20 h-1.5">
                {ticks.map((tick) => (
                  <PercentSpan
                    key={`top-${tick}`}
                    left={`${offsetPercent(tick, window)}%`}
                    className={cn(
                      "top-0 w-px -translate-x-1/2 bg-foreground/45",
                      tick % 3600 === 0 ? "h-1.5" : "h-1",
                    )}
                  />
                ))}
              </span>
              <span className="absolute inset-x-0 bottom-0 z-20 h-1.5">
                {ticks.map((tick) => (
                  <PercentSpan
                    key={`bottom-${tick}`}
                    left={`${offsetPercent(tick, window)}%`}
                    className={cn(
                      "bottom-0 w-px -translate-x-1/2 bg-foreground/45",
                      tick % 3600 === 0 ? "h-1.5" : "h-1",
                    )}
                  />
                ))}
              </span>
              {bands.map((band) => (
                <PercentSpan
                  key={`${band.kind}-${band.startTime}`}
                  left={`${band.left}%`}
                  width={`${band.width}%`}
                  className={cn(
                    "inset-y-0 flex items-center justify-center text-[11px] leading-tight tabular-nums",
                    BAND_CLASS[band.kind],
                  )}
                >
                  {band.width >= LABEL_MIN_PERCENT ? (
                    <span className="relative z-20 rounded-sm bg-inherit px-1">
                      {formatTime(band.startTime)}–{formatTime(band.endTime)}
                    </span>
                  ) : null}
                </PercentSpan>
              ))}
              {minutes ? (
                <PercentSpan
                  left={startLeft}
                  width={`${offsetPercent(endTime, window) - offsetPercent(startTime, window)}%`}
                  className={cn(
                    "inset-y-0 border-x-2 border-primary bg-primary/25",
                    "motion-safe:transition-[left,width] motion-safe:duration-150 motion-safe:ease-(--ease-smooth-out)",
                  )}
                />
              ) : null}
            </span>
            <RangeHandle
              label={t("startTime")}
              revealed={near === "start" || active === "start"}
              placed={Boolean(startTime)}
              active={active === "start"}
              left={startLeft}
              min={Math.round((startFloor - window.startTime) / 60)}
              max={Math.round((startCeiling - window.startTime) / 60)}
              now={Math.round((shownStart - window.startTime) / 60)}
              text={startTime ? formatTime(startTime) : t("selectStartHint")}
              hintId={hintId}
              invalid={invalid}
              handleRef={startHandleRef}
              onBlur={onStartBlur}
              onKeyDown={(event) => handleKeyDown(event, "start")}
              onPointerDown={(event) => {
                if (event.pointerType === "mouse" && event.button !== 0) return
                event.stopPropagation()
                beginDrag(event, "start")
              }}
              onPointerMove={(event) => dragTo(event, "start")}
              onPointerUp={endDrag}
              onPointerCancel={() => {
                gesture.current = null
                setActive(null)
              }}
              onFocus={() => setActive("start")}
            />
            {minutes ? (
              <RangeHandle
                label={t("endTime")}
                revealed={near === "end" || active === "end"}
                placed
                active={active === "end"}
                left={endLeft}
                min={Math.round((startTime + step - window.startTime) / 60)}
                max={Math.round((latest - window.startTime) / 60)}
                now={Math.round((endTime - window.startTime) / 60)}
                text={formatTime(endTime)}
                hintId={hintId}
                invalid={invalid}
                onKeyDown={(event) => handleKeyDown(event, "end")}
                onPointerDown={(event) => {
                  if (event.pointerType === "mouse" && event.button !== 0) return
                  event.stopPropagation()
                  beginDrag(event, "end")
                }}
                onPointerMove={(event) => dragTo(event, "end")}
                onPointerUp={endDrag}
                onPointerCancel={() => {
                  gesture.current = null
                  setActive(null)
                }}
                onFocus={() => setActive("end")}
              />
            ) : null}
            {hoverLeft && !active ? (
              <PercentSpan
                aria-hidden
                left={hoverLeft}
                className="pointer-events-none inset-y-0 z-20 -translate-x-1/2"
              >
                <span className="absolute inset-y-1 left-1/2 w-px -translate-x-1/2 bg-foreground/60" />
                <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 font-mono text-[11px] text-background tabular-nums">
                  {formatTime(hoverTime)}
                </span>
              </PercentSpan>
            ) : null}
          </div>
        </div>
        <div aria-hidden className="relative mx-3 mt-2 h-5">
          {marks.map((mark, index) => {
            const edge = index === 0 ? "left-0" : index === marks.length - 1 ? "right-0" : ""
            return edge ? (
              <span
                key={mark}
                className={cn(
                  "absolute top-0 font-mono text-xs text-muted-foreground tabular-nums",
                  edge,
                )}
              >
                {formatTime(mark)}
              </span>
            ) : (
              <PercentSpan
                key={mark}
                left={`${offsetPercent(mark, window)}%`}
                className="top-0 -translate-x-1/2 font-mono text-xs text-muted-foreground tabular-nums"
              >
                {formatTime(mark)}
              </PercentSpan>
            )
          })}
        </div>
      </div>

      <p id={hintId} className="sr-only">
        {t("timelineHint")}
      </p>
      <ul className="sr-only">
        {bands.map((band) => (
          <li key={`describe-${band.kind}-${band.startTime}`}>
            {bandText[band.kind]} {formatTime(band.startTime)} – {formatTime(band.endTime)}
          </li>
        ))}
      </ul>

      <div aria-live="polite">
        {minutes ? (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary">
            <Check aria-hidden className="size-4 shrink-0" />
            {t("selectedRange", { start: formatTime(startTime), end: formatTime(endTime) })}
            <span className="text-primary/80">· {t("minutes", { count: minutes })}</span>
          </p>
        ) : null}
      </div>

      {startTime ? (
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-sm text-muted-foreground">{t("duration")}</span>
          <div className="flex min-w-0 items-stretch gap-2">
            {choices.map((value) => {
              const selected = minutes === value
              return (
                <Toggle
                  key={value}
                  type="button"
                  variant="outline"
                  pressed={selected}
                  onPressedChange={() => {
                    setCustomOpen(false)
                    onRangeChange({ startTime, endTime: startTime + value * 60 })
                  }}
                  className={cn(
                    "h-auto min-h-11 min-w-0 flex-1 basis-0",
                    customOpen && "grow-[0.35]",
                  )}
                >
                  {t("minutes", { count: value })}
                </Toggle>
              )
            })}
            <div
              className={cn(
                "flex min-h-11 min-w-0 items-center overflow-hidden rounded-lg border",
                "motion-safe:transition-[flex-grow] motion-safe:duration-200",
                customOpen ? "min-w-28 flex-[2.4] border-primary" : "flex-1 border-input",
                !choices.includes(minutes) && minutes > 0 && "bg-primary/10 text-primary",
              )}
            >
              {customOpen ? (
                <DurationInput
                  minutes={minutes}
                  min={15}
                  max={Math.min(maxDurationMinutes, (latest - startTime) / 60)}
                  label={t("durationInput")}
                  onCommit={(value) =>
                    onRangeChange({ startTime, endTime: startTime + value * 60 })
                  }
                />
              ) : (
                <Toggle
                  type="button"
                  variant="outline"
                  pressed={!choices.includes(minutes) && minutes > 0}
                  onPressedChange={() => setCustomOpen(true)}
                  className="size-full"
                >
                  {t("otherDuration")}
                </Toggle>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="rounded-lg bg-muted/50 px-3 py-2.5 text-sm text-muted-foreground">
          {t("chooseStartFirst")}
        </p>
      )}

      <FieldError errors={errors} />
    </FieldSet>
  )
}

/**
 * A thin line with a small grip. While it is dragged or focused the grip grows
 * and a time bubble appears above it. Growth is a transform, so the track
 * height never changes and the time under the pointer never drifts.
 */
function RangeHandle({
  label,
  placed,
  revealed,
  active,
  left,
  min,
  max,
  now,
  text,
  hintId,
  invalid,
  handleRef,
  onBlur,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onFocus,
}: {
  label: string
  placed: boolean
  /** Grip and stem show only while the pointer is near, or the handle is held. */
  revealed: boolean
  active: boolean
  left: string
  min: number
  max: number
  now: number
  text: string
  hintId: string
  invalid: boolean
  handleRef?: (element: HTMLDivElement | null) => void
  onBlur?: () => void
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void
  onPointerCancel: () => void
  onFocus: () => void
}) {
  return (
    <PercentBox
      ref={handleRef}
      // Both edges of a range are sliders; a native input cannot be pinned to
      // a band edge without replacing the whole track.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-orientation="horizontal"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={now}
      aria-valuetext={text}
      aria-describedby={hintId}
      aria-invalid={invalid || undefined}
      onBlur={onBlur}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      left={left}
      className="inset-y-0 z-30 w-6 -translate-x-1/2 touch-none outline-none"
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-1 left-1/2 w-px -translate-x-1/2 rounded-full",
          "motion-safe:transition-opacity motion-safe:duration-150",
          revealed ? "opacity-100" : "opacity-0",
          placed ? "bg-primary" : "bg-primary/40",
          active && "inset-y-0 w-0.5",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 left-1/2 size-3 -translate-1/2 rounded-full border bg-background",
          "motion-safe:transition-[opacity,transform] motion-safe:duration-150 motion-safe:ease-(--ease-smooth-out)",
          revealed ? "opacity-100" : "opacity-0",
          placed ? "border-primary" : "border-dashed border-primary/40",
          active && "scale-125",
        )}
      />
      {active ? (
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap text-background tabular-nums">
          {text}
        </span>
      ) : null}
    </PercentBox>
  )
}

/** Hairlines on the track edges: hours and half hours, not the two ends. */
function tickMarks(window: DayWindow) {
  const halfHour = 1800
  const ticks: number[] = []
  for (
    let cursor = Math.ceil(window.startTime / halfHour) * halfHour;
    cursor <= window.endTime;
    cursor += halfHour
  ) {
    // The first and last marks sit on the rounded border, so a centered
    // hairline sticks out past the corner.
    if (cursor === window.startTime || cursor === window.endTime) continue
    ticks.push(cursor)
  }
  return ticks
}

/** End times a phone user can pick: every slot boundary inside the legal range. */
function endChoices(
  slots: AvailabilityData["slots"],
  startTime: number,
  latest: number,
  step: number,
) {
  if (!startTime) return []
  return slots
    .map((slot) => slot.endTime)
    .filter((timestamp) => timestamp > startTime && timestamp <= latest && timestamp % step === 0)
}

/**
 * A free-typed length. The draft stays as typed while focused, then rounds to
 * the nearest 15-minute step and clamps to the range the day can still hold.
 */
function DurationInput({
  minutes,
  min,
  max,
  label,
  onCommit,
}: {
  minutes: number
  min: number
  max: number
  label: string
  onCommit: (minutes: number) => void
}) {
  const [draft, setDraft] = useState<string>()

  function commit(value: string) {
    const typed = Number(value)
    if (!Number.isFinite(typed)) {
      setDraft(undefined)
      return
    }
    const rounded = Math.round(typed / 15) * 15
    const next = Math.min(max, Math.max(min, rounded || min))
    if (next !== minutes) onCommit(next)
    setDraft(undefined)
  }

  return (
    <Input
      ref={(element) => element?.focus()}
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      step={15}
      aria-label={label}
      value={draft ?? (minutes || "")}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={(event) => commit(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          commit(event.currentTarget.value)
        }
      }}
      className="h-11 w-full"
    />
  )
}
