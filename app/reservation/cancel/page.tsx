"use client"

import { enUS, zhCN } from "date-fns/locale"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  DoorOpen,
  FileText,
  MapPin,
  Monitor,
  Pencil,
  RefreshCw,
  Save,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { Button, Calendar, Spinner } from "@/components/astryx"
import {
  ActionButton,
  NeoFooter,
  NeoPage,
  StatusBadge,
  Surface,
} from "@/components/neo/shared"
import { getCatalog } from "@/lib/api/catalog"
import {
  cancelReservation,
  getAvailability,
  modifyReservation,
  previewCancellation,
  type CancellationPreview,
} from "@/lib/api/reservations"
import type {
  AvailabilityData,
  CatalogData,
  PurposeType,
  Room,
} from "@/lib/api/types"
import { dateToInputValue, inputValueToDate } from "@/lib/date-time"
import { rangeIsAvailable } from "@/lib/reservations/availability"

import {
  buildTimeOptions,
  timeCanBeSelected,
  timeIsSelected,
  timeShouldBeVisible,
  type TimeOption,
} from "../create/steps/time-options"

type EditDraft = {
  campus: number
  room: number
  date: string
  startTime: number
  endTime: number
}

function initialDraft(preview: CancellationPreview, rooms: Room[]): EditDraft {
  const room = rooms.find((item) => item.id === preview.roomId)
  return {
    campus: room?.campus || 0,
    room: preview.roomId,
    date: preview.startTime.slice(0, 10),
    startTime: new Date(preview.startTime).getTime() / 1000,
    endTime: new Date(preview.endTime).getTime() / 1000,
  }
}

function startOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export default function CancelReservationPage() {
  const params = useSearchParams()
  const token = params.get("token") || ""
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
  const [loading, setLoading] = useState(Boolean(token))
  const [working, setWorking] = useState(false)
  const [mode, setMode] = useState<"details" | "edit" | "cancel">("details")
  const [editStep, setEditStep] = useState<"location" | "time">("location")
  const [result, setResult] = useState<"modified" | "cancelled">()
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!token) return
    let active = true
    if (process.env.NODE_ENV === "development" && token === "design-preview") {
      Promise.resolve().then(() => {
        if (!active) return
        const reservation: CancellationPreview = {
          reservationId: 0,
          roomId: 2,
          status: "approved",
          roomName: "iStudy Meeting Room 2",
          studentName: "许恩澄",
          reason: "社团项目讨论与设备测试",
          startTime: "2026-09-18T15:30:00",
          endTime: "2026-09-18T17:00:00",
          purposeType: "club",
          needsMultimedia: true,
          editCount: 0,
          remainingEdits: 2,
        }
        const demoCatalog: CatalogData = {
          campuses: [
            { id: 1, name: "石牌校区", isPrivileged: false },
            { id: 2, name: "知识城校区", isPrivileged: false },
          ],
          classes: [],
          rooms: [
            {
              id: 2,
              name: "iStudy Meeting Room 2",
              campus: 1,
              enabled: true,
              policies: [
                {
                  id: 1,
                  roomId: 2,
                  days: [0, 1, 2, 3, 4, 5, 6],
                  startTime: [8, 0],
                  endTime: [21, 30],
                  enabled: true,
                },
              ],
            },
            {
              id: 3,
              name: "Innovation Lab",
              campus: 2,
              enabled: true,
              policies: [
                {
                  id: 2,
                  roomId: 3,
                  days: [1, 2, 3, 4, 5],
                  startTime: [9, 0],
                  endTime: [18, 0],
                  enabled: true,
                },
              ],
            },
          ],
        }
        setPreview(reservation)
        setCatalog(demoCatalog)
        setDraft(initialDraft(reservation, demoCatalog.rooms))
        setLoading(false)
      })
      return () => {
        active = false
      }
    }
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
      .catch((reason) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : t("invalidLink"))
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
    [catalog?.rooms, draft?.room]
  )
  const roomsForCampus = useMemo(
    () =>
      catalog?.rooms.filter(
        (room) => room.enabled && room.campus === draft?.campus
      ) || [],
    [catalog?.rooms, draft?.campus]
  )

  useEffect(() => {
    if (
      mode !== "edit" ||
      editStep !== "time" ||
      !draft?.date ||
      !selectedRoom ||
      !preview
    ) {
      return
    }
    let active = true
    Promise.resolve()
      .then(() => {
        if (!active) return undefined
        setLoadingAvailability(true)
        setAvailabilityError(undefined)
        return getAvailability(
          selectedRoom.id,
          draft.date,
          selectedRoom,
          preview.reservationId
        )
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
  }, [
    availabilityReload,
    bookingT,
    draft?.date,
    editStep,
    mode,
    preview,
    selectedRoom,
  ])

  const today = useMemo(() => startOfToday(), [])
  const maximumDate = useMemo(() => addDays(today, 30), [today])
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [locale]
  )
  const timeOptions = useMemo(
    () => buildTimeOptions(availability?.slots || []),
    [availability]
  )
  const visibleTimeOptions = useMemo(() => {
    if (!availability || !draft) return []
    return timeOptions.filter((option) =>
      timeShouldBeVisible({
        option,
        slots: availability.slots,
        startTime: draft.startTime,
        endTime: draft.endTime,
      })
    )
  }, [availability, draft, timeOptions])

  function resetTimes(nextDate = draft?.date || "") {
    if (!draft) return
    setDraft({ ...draft, date: nextDate, startTime: 0, endTime: 0 })
    setAvailability(undefined)
    setAvailabilityError(undefined)
  }

  function selectTime(option: TimeOption) {
    if (!draft || !availability) return
    if (timeIsSelected(option.timestamp, draft.startTime, draft.endTime)) {
      setDraft({ ...draft, startTime: 0, endTime: 0 })
      return
    }
    if (
      !draft.startTime ||
      draft.endTime ||
      option.timestamp < draft.startTime
    ) {
      setDraft({ ...draft, startTime: option.timestamp, endTime: 0 })
      return
    }
    if (
      rangeIsAvailable(availability.slots, draft.startTime, option.timestamp)
    ) {
      setDraft({ ...draft, endTime: option.timestamp })
    } else {
      setAvailabilityError(bookingT("rangeUnavailable"))
    }
  }

  async function saveChanges() {
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
      setMode("details")
      setEditStep("location")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("modifyFailed"))
    } finally {
      setWorking(false)
    }
  }

  async function confirmCancellation() {
    setWorking(true)
    setError(undefined)
    try {
      await cancelReservation(token)
      setResult("cancelled")
      setMode("details")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("cancelFailed"))
    } finally {
      setWorking(false)
    }
  }

  const purposeKey = (preview?.purposeType || "personal") as PurposeType
  const formatTime = (value: number) =>
    timeFormatter.format(new Date(value * 1000))

  return (
    <NeoPage>
      <main className="internal-main management-page">
        <div className="management-shell">
          <header className="management-hero">
            <div className="management-hero__icon">
              <ShieldCheck size={28} />
            </div>
            <div>
              <span className="page-overline">HFI Utility Center</span>
              <h1>{t("title")}</h1>
              <p>{t("description")}</p>
            </div>
          </header>

          <Surface className="management-card">
            {loading ? (
              <div className="neo-load-state management-loading">
                <Spinner />
                <strong>{t("loading")}</strong>
                <span>{t("loadingDescription")}</span>
              </div>
            ) : null}

            {!loading && (error || !token) && !preview ? (
              <div className="management-empty-state">
                <div className="management-empty-state__icon">
                  <XCircle size={28} />
                </div>
                <h2>{t("unavailable")}</h2>
                <p>{error || t("invalidLink")}</p>
                <ActionButton variant="secondary" href="/">
                  {t("home")}
                </ActionButton>
              </div>
            ) : null}

            {result === "cancelled" ? (
              <div className="management-empty-state management-empty-state--success">
                <div className="management-empty-state__icon">
                  <CheckCircle2 size={30} />
                </div>
                <h2>{t("cancelledTitle")}</h2>
                <p>{t("cancelledDescription")}</p>
                <div className="management-empty-state__actions">
                  <ActionButton href="/reservation/create">
                    {t("bookAgain")}
                  </ActionButton>
                  <ActionButton variant="secondary" href="/">
                    {t("home")}
                  </ActionButton>
                </div>
              </div>
            ) : null}

            {preview && catalog && draft && result !== "cancelled" ? (
              <div className="management-content">
                <div className="management-summary">
                  <div className="management-summary__room">
                    <span className="management-summary__glyph">
                      <MapPin size={22} />
                    </span>
                    <div>
                      <span>{t("location")}</span>
                      <h2>{preview.roomName}</h2>
                    </div>
                  </div>
                  <div className="management-summary__meta">
                    <StatusBadge
                      tone={
                        preview.status === "approved" ? "success" : "warning"
                      }
                    >
                      {preview.status === "approved"
                        ? t("approved")
                        : t("pending")}
                    </StatusBadge>
                    <span>
                      {t("remainingEdits", { count: preview.remainingEdits })}
                    </span>
                  </div>
                </div>

                {result === "modified" ? (
                  <div className="management-notice management-notice--success">
                    <CheckCircle2 size={19} />
                    <div>
                      <strong>{t("modifiedTitle")}</strong>
                      <span>{t("modifiedDescription")}</span>
                    </div>
                  </div>
                ) : null}
                {error ? (
                  <div className="management-notice management-notice--error">
                    <AlertTriangle size={19} />
                    <span>{error}</span>
                  </div>
                ) : null}

                {mode === "details" ? (
                  <>
                    <div className="management-detail-grid">
                      <article>
                        <CalendarDays size={19} />
                        <span>{t("date")}</span>
                        <strong>{preview.startTime.slice(0, 10)}</strong>
                      </article>
                      <article>
                        <Clock3 size={19} />
                        <span>{t("time")}</span>
                        <strong>
                          {preview.startTime.slice(11, 16)} –{" "}
                          {preview.endTime.slice(11, 16)}
                        </strong>
                      </article>
                      <article>
                        <UserRound size={19} />
                        <span>{t("reservedBy")}</span>
                        <strong>{preview.studentName}</strong>
                      </article>
                      <article>
                        <FileText size={19} />
                        <span>{t("purpose")}</span>
                        <strong>{t(`purposeOptions.${purposeKey}`)}</strong>
                      </article>
                      <article className="management-detail-grid__wide">
                        <Monitor size={19} />
                        <span>{t("multimedia")}</span>
                        <strong>
                          {preview.needsMultimedia
                            ? t("required")
                            : t("notRequired")}
                        </strong>
                      </article>
                      <article className="management-detail-grid__wide">
                        <FileText size={19} />
                        <span>{t("reason")}</span>
                        <strong>{preview.reason}</strong>
                      </article>
                    </div>
                    <div className="management-actions">
                      <ActionButton
                        icon={<Pencil size={17} />}
                        disabled={preview.remainingEdits <= 0}
                        onClick={() => {
                          setError(undefined)
                          setResult(undefined)
                          setEditStep("location")
                          setMode("edit")
                        }}
                      >
                        {t("modify")}
                      </ActionButton>
                      <ActionButton
                        icon={<XCircle size={17} />}
                        variant="destructive"
                        onClick={() => {
                          setError(undefined)
                          setMode("cancel")
                        }}
                      >
                        {t("cancelReservation")}
                      </ActionButton>
                      <ActionButton variant="secondary" href="/">
                        {t("home")}
                      </ActionButton>
                    </div>
                  </>
                ) : null}

                {mode === "edit" ? (
                  <div className="management-editor">
                    <div
                      className="management-edit-progress"
                      aria-label={t("modifyProgress")}
                    >
                      <div
                        className={
                          editStep === "location" ? "is-active" : "is-complete"
                        }
                      >
                        <span>
                          {editStep === "time" ? <Check size={15} /> : "1"}
                        </span>
                        <strong>{t("selectLocation")}</strong>
                      </div>
                      <i />
                      <div className={editStep === "time" ? "is-active" : ""}>
                        <span>2</span>
                        <strong>{t("selectDateTime")}</strong>
                      </div>
                    </div>

                    {editStep === "location" ? (
                      <div className="management-booking-step">
                        <div className="management-section-heading">
                          <div>
                            <span className="page-overline">
                              {t("stepOne")}
                            </span>
                            <h3>{t("selectLocation")}</h3>
                          </div>
                          <span>{t("locationHint")}</span>
                        </div>
                        <div className="campus-tabs">
                          {catalog.campuses
                            .filter((campus) => !campus.isPrivileged)
                            .map((campus) => (
                              <button
                                type="button"
                                key={campus.id}
                                className={`campus-tab ${draft.campus === campus.id ? "campus-tab--active" : ""}`}
                                onClick={() => {
                                  setDraft({
                                    ...draft,
                                    campus: campus.id,
                                    room: 0,
                                    startTime: 0,
                                    endTime: 0,
                                  })
                                  setAvailability(undefined)
                                }}
                              >
                                {campus.name}
                              </button>
                            ))}
                        </div>
                        <div className="resource-heading management-resource-heading">
                          <div>
                            <span className="page-overline">
                              Room resources
                            </span>
                            <h2>{bookingT("rooms")}</h2>
                          </div>
                          <span className="resource-count">
                            {t("availableSpaces", {
                              count: roomsForCampus.length,
                            })}
                          </span>
                        </div>
                        <div className="room-grid">
                          {roomsForCampus.map((room) => (
                            <button
                              type="button"
                              key={room.id}
                              className={`room-card ${draft.room === room.id ? "room-card--selected" : ""}`}
                              onClick={() => {
                                setDraft({
                                  ...draft,
                                  room: room.id,
                                  startTime: 0,
                                  endTime: 0,
                                })
                                setAvailability(undefined)
                              }}
                            >
                              <span className="room-card__icon">
                                <DoorOpen size={18} />
                              </span>
                              <strong>{room.name}</strong>
                              {draft.room === room.id ? (
                                <span className="room-card__check">
                                  <Check size={13} />
                                </span>
                              ) : null}
                            </button>
                          ))}
                        </div>
                        <div className="management-actions">
                          <ActionButton
                            variant="secondary"
                            onClick={() => {
                              setDraft(initialDraft(preview, catalog.rooms))
                              setMode("details")
                            }}
                          >
                            {t("exitModify")}
                          </ActionButton>
                          <ActionButton
                            endContent={<ArrowRight size={17} />}
                            disabled={!draft.room}
                            onClick={() => {
                              if (!draft.room) return
                              setEditStep("time")
                            }}
                          >
                            {t("next")}
                          </ActionButton>
                        </div>
                      </div>
                    ) : null}

                    {editStep === "time" ? (
                      <div className="management-booking-step">
                        <div className="management-section-heading">
                          <div>
                            <span className="page-overline">
                              {t("stepTwo")}
                            </span>
                            <h3>{t("selectDateTime")}</h3>
                          </div>
                          <span>{selectedRoom?.name}</span>
                        </div>
                        {availabilityError ? (
                          <div className="management-notice management-notice--error">
                            <AlertTriangle size={19} />
                            <span>{availabilityError}</span>
                          </div>
                        ) : null}
                        <div className="datetime-card management-datetime-card">
                          <div className="datetime-card__calendar">
                            <div className="panel-heading">
                              <span className="panel-heading__accent" />
                              <div>
                                <strong>{bookingT("dateTitle")}</strong>
                                <span>{bookingT("dateDescription")}</span>
                              </div>
                            </div>
                            <Calendar
                              className="booking-calendar"
                              classNames={{
                                month: "booking-calendar__month",
                                month_caption: "booking-calendar__caption",
                                caption_label:
                                  "booking-calendar__caption-label",
                                nav: "booking-calendar__nav",
                                button_previous: "booking-calendar__previous",
                                button_next: "booking-calendar__next",
                                month_grid: "booking-calendar__grid",
                                weekdays: "booking-calendar__weekdays",
                                weekday: "booking-calendar__weekday",
                                week: "booking-calendar__week",
                                day: "booking-calendar__day",
                                day_button: "booking-calendar__day-button",
                                selected: "booking-calendar__selected",
                                outside: "booking-calendar__outside",
                                disabled: "booking-calendar__disabled",
                                today: "booking-calendar__today",
                              }}
                              mode="single"
                              showOutsideDays
                              locale={locale === "zh-CN" ? zhCN : enUS}
                              selected={inputValueToDate(draft.date)}
                              defaultMonth={
                                inputValueToDate(draft.date) || today
                              }
                              startMonth={today}
                              endMonth={maximumDate}
                              disabled={{ before: today, after: maximumDate }}
                              onSelect={(selected) => {
                                if (selected)
                                  resetTimes(dateToInputValue(selected))
                              }}
                            />
                          </div>
                          <div className="datetime-card__divider" />
                          <div className="datetime-card__time">
                            <div className="panel-heading datetime-panel-heading">
                              <span className="panel-heading__accent" />
                              <div>
                                <strong>{bookingT("timeRange")}</strong>
                                <span>
                                  {draft.startTime && draft.endTime
                                    ? bookingT("selectedRange", {
                                        start: formatTime(draft.startTime),
                                        end: formatTime(draft.endTime),
                                      })
                                    : draft.startTime
                                      ? bookingT("selectEndHint")
                                      : bookingT("selectStartHint")}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="availability-refresh-button"
                                aria-label={bookingT("refresh")}
                                disabled={loadingAvailability}
                                onClick={() =>
                                  setAvailabilityReload((value) => value + 1)
                                }
                              >
                                {loadingAvailability ? (
                                  <Spinner />
                                ) : (
                                  <RefreshCw size={15} />
                                )}
                              </Button>
                            </div>
                            {loadingAvailability ? (
                              <div className="management-availability-loading">
                                <Spinner />
                                {bookingT("checking")}
                              </div>
                            ) : null}
                            {availability && !loadingAvailability ? (
                              <>
                                <div
                                  className="neo-time-legend"
                                  aria-hidden="true"
                                >
                                  <span>
                                    <i className="neo-time-legend__available" />
                                    {bookingT("available")}
                                  </span>
                                  <span>
                                    <i className="neo-time-legend__occupied" />
                                    {bookingT("occupied")}
                                  </span>
                                </div>
                                <div className="neo-time-grid">
                                  {visibleTimeOptions.map((option) => {
                                    const selected = timeIsSelected(
                                      option.timestamp,
                                      draft.startTime,
                                      draft.endTime
                                    )
                                    const selectable = timeCanBeSelected({
                                      option,
                                      slots: availability.slots,
                                      startTime: draft.startTime,
                                      endTime: draft.endTime,
                                    })
                                    return (
                                      <Button
                                        type="button"
                                        key={option.timestamp}
                                        disabled={!selectable && !selected}
                                        aria-pressed={selected}
                                        variant={
                                          selected ? "default" : "outline"
                                        }
                                        className={`neo-time-cell ${option.status === "occupied" && !selectable ? "neo-time-cell--occupied" : ""} ${selected ? "neo-time-cell--selected" : ""}`}
                                        onClick={() => selectTime(option)}
                                      >
                                        {formatTime(option.timestamp)}
                                      </Button>
                                    )
                                  })}
                                </div>
                              </>
                            ) : null}
                          </div>
                        </div>
                        <div className="management-actions">
                          <ActionButton
                            icon={<ArrowLeft size={17} />}
                            variant="secondary"
                            disabled={working}
                            onClick={() => setEditStep("location")}
                          >
                            {t("previous")}
                          </ActionButton>
                          <ActionButton
                            icon={working ? <Spinner /> : <Save size={17} />}
                            disabled={
                              working || !draft.startTime || !draft.endTime
                            }
                            onClick={saveChanges}
                          >
                            {t("save")}
                          </ActionButton>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {mode === "cancel" ? (
                  <div className="management-confirm">
                    <div className="management-confirm__icon">
                      <AlertTriangle size={26} />
                    </div>
                    <h3>{t("cancelConfirmTitle")}</h3>
                    <p>
                      {t("cancelConfirmDescription", {
                        date: preview.startTime.slice(0, 10),
                      })}
                    </p>
                    <div className="management-actions">
                      <ActionButton
                        icon={working ? <Spinner /> : <XCircle size={17} />}
                        variant="destructive"
                        disabled={working}
                        onClick={confirmCancellation}
                      >
                        {t("confirmCancel")}
                      </ActionButton>
                      <ActionButton
                        variant="secondary"
                        disabled={working}
                        onClick={() => setMode("details")}
                      >
                        {t("keepReservation")}
                      </ActionButton>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Surface>
        </div>
      </main>
      <NeoFooter />
    </NeoPage>
  )
}
