"use client"

import { useLocale, useTranslations } from "next-intl"
import { useCallback, useEffect, useMemo, useState } from "react"

import { getCatalog } from "@/lib/api/catalog"
import {
  cancelReservation,
  getAvailability,
  modifyReservation,
  previewCancellation,
  type CancellationPreview,
} from "@/lib/api/reservations"
import type { AvailabilityData, CatalogData, Room } from "@/lib/api/types"
import { parseApiTimestamp } from "@/lib/date-time"
import { rangeIsAvailable } from "@/lib/reservations/availability"

import {
  buildTimeOptions,
  timeIsSelected,
  timeShouldBeVisible,
  type TimeOption,
} from "../create/steps/time-options"

export type EditDraft = {
  campus: number
  room: number
  date: string
  startTime: number
  endTime: number
}

export type EditStep = "location" | "time"

export function initialDraft(preview: CancellationPreview, rooms: Room[]): EditDraft {
  const room = rooms.find((item) => item.id === preview.roomId)
  return {
    campus: room?.campus ?? 0,
    room: preview.roomId ?? 0,
    date: preview.startTime.slice(0, 10),
    startTime: parseApiTimestamp(preview.startTime).getTime() / 1000,
    endTime: parseApiTimestamp(preview.endTime).getTime() / 1000,
  }
}

export function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Manages reservation state, draft editing, slot availability, and outcomes for the cancel page.
export function useCancellation(token: string) {
  const locale = useLocale()
  const t = useTranslations("neo.management")
  const bookingT = useTranslations("booking")
  const [preview, setPreview] = useState<CancellationPreview>()
  const [catalog, setCatalog] = useState<CatalogData>()
  const [draft, setDraft] = useState<EditDraft>()
  const [availability, setAvailability] = useState<AvailabilityData>()
  const [availabilityError, setAvailabilityError] = useState<string>()
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [availabilityReload, setAvailabilityReload] = useState(0)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [loading, setLoading] = useState(Boolean(token))
  const [working, setWorking] = useState(false)
  const [mode, setMode] = useState<"details" | "edit">("details")
  const [editStep, setEditStep] = useState<EditStep>("location")
  // Guard to prevent sliding animation on initial mount.
  const [slideDirection, setSlideDirection] = useState<"forward" | "back">("forward")
  const [hasSlid, setHasSlid] = useState(false)
  const slideKey = mode === "edit" ? `edit-${editStep}` : "details"
  const [result, setResult] = useState<"modified" | "cancelled">()
  const [error, setError] = useState<string>()

  const navigate = useCallback((direction: "forward" | "back") => {
    setSlideDirection(direction)
    setHasSlid(true)
  }, [])

  useEffect(() => {
    if (!token) return
    let active = true
    Promise.all([previewCancellation(token), getCatalog()])
      .then(([reservation, nextCatalog]) => {
        if (!active) return
        const enabledCatalog = {
          ...nextCatalog,
          rooms: nextCatalog.rooms.filter((room) => room.enabled),
        }
        setPreview(reservation)
        setCatalog(enabledCatalog)
        setDraft(initialDraft(reservation, enabledCatalog.rooms))
      })
      .catch((failure: unknown) => {
        if (!active) return
        setError(failure instanceof Error ? failure.message : t("invalidLink"))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [t, token])

  const selectedRoom = useMemo(
    () => catalog?.rooms.find((room) => room.id === draft?.room),
    [catalog?.rooms, draft?.room],
  )
  const roomsForCampus = useMemo(
    () => catalog?.rooms.filter((room) => room.enabled && room.campus === draft?.campus) || [],
    [catalog?.rooms, draft?.campus],
  )

  useEffect(() => {
    if (mode !== "edit" || editStep !== "time" || !draft?.date || !selectedRoom || !preview) {
      return
    }
    let active = true
    Promise.resolve()
      .then(() => {
        if (!active) return undefined
        setLoadingAvailability(true)
        setAvailabilityError(undefined)
        return getAvailability(selectedRoom.id, draft.date, selectedRoom, preview.reservationId)
      })
      .then((value) => {
        if (active && value) setAvailability(value)
      })
      .catch(() => {
        if (active) setAvailabilityError(bookingT("availabilityError"))
      })
      .finally(() => {
        if (active) setLoadingAvailability(false)
      })
    return () => {
      active = false
    }
  }, [availabilityReload, bookingT, draft?.date, editStep, mode, preview, selectedRoom])

  const today = useMemo(() => startOfToday(), [])
  const maximumDate = useMemo(() => addDays(today, 30), [today])
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
      }),
    [locale],
  )
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        timeZone: "Asia/Shanghai",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [locale],
  )

  const formatTime = useCallback(
    (value: number) => timeFormatter.format(new Date(value * 1000)),
    [timeFormatter],
  )
  const timeOptions = useMemo(() => buildTimeOptions(availability?.slots || []), [availability])
  const visibleTimeOptions = useMemo(() => {
    if (!availability || !draft) return []
    return timeOptions.filter((option) =>
      timeShouldBeVisible({
        option,
        slots: availability.slots,
        startTime: draft.startTime,
        endTime: draft.endTime,
      }),
    )
  }, [availability, draft, timeOptions])

  const resetTimes = useCallback(
    (nextDate = draft?.date || "") => {
      if (!draft) return
      setDraft({ ...draft, date: nextDate, startTime: 0, endTime: 0 })
      setAvailability(undefined)
      setAvailabilityError(undefined)
    },
    [draft],
  )

  const selectTime = useCallback(
    (option: TimeOption) => {
      if (!draft || !availability) return
      if (timeIsSelected(option.timestamp, draft.startTime, draft.endTime)) {
        setDraft({ ...draft, startTime: 0, endTime: 0 })
        return
      }
      if (!draft.startTime || draft.endTime || option.timestamp < draft.startTime) {
        setDraft({ ...draft, startTime: option.timestamp, endTime: 0 })
        return
      }
      if (rangeIsAvailable(availability.slots, draft.startTime, option.timestamp)) {
        setDraft({ ...draft, endTime: option.timestamp })
      } else {
        setAvailabilityError(bookingT("rangeUnavailable"))
      }
    },
    [availability, bookingT, draft],
  )

  const saveChanges = useCallback(async () => {
    if (!draft || !preview || !availability) return
    if (!rangeIsAvailable(availability.slots, draft.startTime, draft.endTime)) {
      setAvailabilityError(bookingT("rangeUnavailable"))
      return
    }
    setWorking(true)
    setError(undefined)
    try {
      await modifyReservation(token, {
        room: draft.room,
        startTime: draft.startTime,
        endTime: draft.endTime,
        reason: preview.reason,
        purposeType: preview.purposeType || "personal",
        needsMultimedia: preview.needsMultimedia,
      })
      const refreshed = await previewCancellation(token)
      setPreview(refreshed)
      setDraft(initialDraft(refreshed, catalog?.rooms || []))
      setResult("modified")
      navigate("back")
      setMode("details")
      setEditStep("location")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("modifyFailed"))
    } finally {
      setWorking(false)
    }
  }, [availability, bookingT, catalog, draft, navigate, preview, t, token])

  const confirmCancellation = useCallback(async () => {
    setWorking(true)
    setError(undefined)
    try {
      await cancelReservation(token)
      setResult("cancelled")
      navigate("back")
      setMode("details")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("cancelFailed"))
    } finally {
      setWorking(false)
    }
  }, [navigate, t, token])

  return {
    preview,
    catalog,
    draft,
    availability,
    availabilityError,
    loadingAvailability,
    calendarOpen,
    setCalendarOpen,
    reloadAvailability: () => setAvailabilityReload((value) => value + 1),
    loading,
    working,
    mode,
    setMode,
    editStep,
    setEditStep,
    slideDirection,
    hasSlid,
    slideKey,
    result,
    error,
    setError,
    setResult,
    setDraft,
    clearAvailability: () => setAvailability(undefined),
    selectedRoom,
    roomsForCampus,
    today,
    maximumDate,
    dateFormatter,
    formatTime,
    visibleTimeOptions,
    navigate,
    resetTimes,
    selectTime,
    saveChanges,
    confirmCancellation,
  }
}
