import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Button, Calendar, ScrollableArea, TextArea } from '@astryxdesign/core'
import { Check, ChevronDown, LoaderCircle, RotateCcw } from 'lucide-react'
import { hfiApi } from './api'
import type {
  Availability,
  Campus,
  CreateReservationPayload,
  PanelName,
  Room,
  SchoolClass,
  TimeSlot,
} from './types'

const DISPLAY_CAMPUSES = [
  { id: 1, label: '石牌校区' },
  { id: 2, label: '知识城校区' },
]

const MAX_DAYS = 30
const MINUTE_STEP = 15

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function toDateValue(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function minutesOfDay(dateTime: string) {
  const match = dateTime.match(/T(\d{2}):(\d{2})/)
  return match ? Number(match[1]) * 60 + Number(match[2]) : -1
}

function toShanghaiEpoch(date: string, minutes: number) {
  const [year, month, day] = date.split('-').map(Number)
  const utcMillis = Date.UTC(year, month - 1, day, Math.floor(minutes / 60) - 8, minutes % 60)
  return Math.floor(utcMillis / 1000)
}

function formatSlot(minutes: number) {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

function formatDateChinese(date: string) {
  if (!date) return '哪一天'
  const value = toDateValue(date)
  return `${value.getMonth() + 1}月${value.getDate()}日`
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : '暂时无法连接预约服务，请稍后再试。'
}

function SelectionButton({
  label,
  selected,
  onClick,
  disabled = false,
}: {
  label: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      className={`sentence-choice ${selected ? 'sentence-choice--selected' : ''}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      <span>{label}</span>
      {selected && <Check size={15} strokeWidth={2.4} aria-hidden="true" />}
    </button>
  )
}

function ExpandablePanel({ open, children, className = '' }: { open: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={`expand-panel ${open ? 'expand-panel--open' : ''} ${className}`} aria-hidden={!open}>
      <div className="expand-panel__inner">{children}</div>
    </div>
  )
}

function InlineValue({
  value,
  placeholder,
  onClick,
  invalid = false,
}: {
  value: string
  placeholder: string
  onClick: () => void
  invalid?: boolean
}) {
  return (
    <button
      type="button"
      className={`inline-value ${value ? 'inline-value--filled' : ''} ${invalid ? 'inline-value--invalid' : ''}`}
      onClick={onClick}
    >
      {value || placeholder}
    </button>
  )
}

function InlineTextInput({
  value,
  placeholder,
  ariaLabel,
  onChange,
  invalid = false,
  className = '',
  autoComplete,
  inputMode,
}: {
  value: string
  placeholder: string
  ariaLabel: string
  onChange: (value: string) => void
  invalid?: boolean
  className?: string
  autoComplete?: string
  inputMode?: 'email' | 'text'
}) {
  return (
    <span className={`inline-input ${invalid ? 'inline-input--invalid' : ''} ${className}`}>
      <span className="inline-input__measure" aria-hidden="true">
        {value || placeholder}
      </span>
      <input
        className="inline-input__control"
        size={1}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={invalid}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
      />
    </span>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [activePanel, setActivePanel] = useState<PanelName | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [reservationId, setReservationId] = useState<number | null>(null)
  const [catalogError, setCatalogError] = useState('')

  const [name, setName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [emailPrefix, setEmailPrefix] = useState('')
  const [classCampusId, setClassCampusId] = useState<number | null>(null)
  const [classId, setClassId] = useState<number | null>(null)
  const [campusId, setCampusId] = useState<number | null>(null)
  const [roomId, setRoomId] = useState<number | null>(null)
  const [date, setDate] = useState('')
  const [startMinutes, setStartMinutes] = useState<number | null>(null)
  const [endMinutes, setEndMinutes] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [needsMultimedia, setNeedsMultimedia] = useState<boolean | null>(null)

  const today = useMemo(() => formatDate(new Date()), [])
  const maxDate = useMemo(() => formatDate(addDays(toDateValue(today), MAX_DAYS)), [today])

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 3000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoadingCatalog(true)
    Promise.all([hfiApi.listCampuses(), hfiApi.listClasses(), hfiApi.listRooms()])
      .then(([campusData, classData, roomData]) => {
        if (cancelled) return
        setCampuses(campusData)
        setClasses(classData)
        setRooms(roomData.filter((room) => room.enabled && [1, 2].includes(room.campus)))
        setCatalogError('')
      })
      .catch((error: unknown) => {
        if (!cancelled) setCatalogError(formatError(error))
      })
      .finally(() => {
        if (!cancelled) setLoadingCatalog(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selectedClassCampus = campuses.find((campus) => campus.id === classCampusId)
  const selectedCampus = campuses.find((campus) => campus.id === campusId)
  const selectedRoom = rooms.find((room) => room.id === roomId)
  const selectedClass = classes.find((schoolClass) => schoolClass.id === classId)
  const visibleClasses = classes.filter((schoolClass) => schoolClass.campus === classCampusId)
  const visibleRooms = rooms.filter((room) => room.campus === campusId)
  const dateWeekday = date ? toDateValue(date).getDay() : null

  const occupiedIntervals = useMemo(
    () => (availability?.occupied ?? []).map((item) => ({
      start: minutesOfDay(item.startTime),
      end: minutesOfDay(item.endTime),
    })),
    [availability],
  )

  const activePolicies = useMemo(() => {
    if (!selectedRoom || dateWeekday === null) return []
    return selectedRoom.policies
      .filter((item) => item.enabled && item.days.includes(dateWeekday))
      .map((policy) => ({
        start: policy.startTime[0] * 60 + policy.startTime[1],
        end: policy.endTime[0] * 60 + policy.endTime[1],
      }))
  }, [dateWeekday, selectedRoom])

  const timeSlots = useMemo<TimeSlot[]>(() => {
    if (!selectedRoom || dateWeekday === null || !date) return []
    const now = new Date()
    const isToday = date === formatDate(now)
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const slots: TimeSlot[] = []
    for (const policy of activePolicies) {
      for (let minutes = policy.start; minutes < policy.end; minutes += MINUTE_STEP) {
        const unavailable = occupiedIntervals.some((interval) => minutes >= interval.start && minutes < interval.end)
        const inPast = isToday && minutes <= nowMinutes + 15
        if (!unavailable && !inPast && !slots.some((slot) => slot.minutes === minutes)) {
          slots.push({ minutes, label: formatSlot(minutes), epoch: toShanghaiEpoch(date, minutes) })
        }
      }
    }
    return slots.sort((a, b) => a.minutes - b.minutes)
  }, [activePolicies, date, dateWeekday, occupiedIntervals, selectedRoom])

  const endSlots = useMemo<TimeSlot[]>(() => {
    if (startMinutes === null || !date) return []
    const containingPolicy = activePolicies.find((policy) => startMinutes >= policy.start && startMinutes < policy.end)
    if (!containingPolicy) return []
    const finalMinute = Math.min(startMinutes + 120, containingPolicy.end)
    const slots: TimeSlot[] = []
    for (let minutes = startMinutes + MINUTE_STEP; minutes <= finalMinute; minutes += MINUTE_STEP) {
      const conflicts = occupiedIntervals.some((interval) => startMinutes < interval.end && minutes > interval.start)
      if (conflicts) break
      slots.push({ minutes, label: formatSlot(minutes), epoch: toShanghaiEpoch(date, minutes) })
    }
    return slots
  }, [activePolicies, date, occupiedIntervals, startMinutes])

  const selectedTimeLabel = startMinutes === null
    ? '时间'
    : endMinutes === null
      ? `${formatSlot(startMinutes)}`
      : `${formatSlot(startMinutes)} 至 ${formatSlot(endMinutes)}`

  const email = emailPrefix.trim() ? `${emailPrefix.trim()}@gdhfi.com` : ''
  const formReady = Boolean(
    name.trim() &&
    /^GJ\d{8}$/.test(studentId.trim()) &&
    /^[a-zA-Z0-9._%+-]+$/.test(emailPrefix.trim()) &&
    classCampusId &&
    classId &&
    campusId &&
    roomId &&
    date &&
    startMinutes !== null &&
    endMinutes !== null &&
    reason.trim() &&
    needsMultimedia !== null,
  )

  useEffect(() => {
    setRoomId(null)
    setAvailability(null)
    setStartMinutes(null)
    setEndMinutes(null)
  }, [campusId])

  useEffect(() => {
    setClassId(null)
  }, [classCampusId])

  useEffect(() => {
    if (!roomId || !date) {
      setAvailability(null)
      return
    }
    let cancelled = false
    setLoadingAvailability(true)
    hfiApi.availability(roomId, date)
      .then((data) => {
        if (!cancelled) setAvailability(data)
      })
      .catch((error: unknown) => {
        if (!cancelled) setSubmitError(formatError(error))
      })
      .finally(() => {
        if (!cancelled) setLoadingAvailability(false)
      })
    return () => {
      cancelled = true
    }
  }, [date, roomId])

  useEffect(() => {
    if (startMinutes !== null && endMinutes !== null && endMinutes <= startMinutes) setEndMinutes(null)
    if (endMinutes !== null && startMinutes !== null && endMinutes > startMinutes + 120) setEndMinutes(null)
  }, [endMinutes, startMinutes])

  function togglePanel(panel: PanelName) {
    setSubmitError('')
    setActivePanel((current) => (current === panel ? null : panel))
  }

  function selectClassCampus(id: number) {
    setClassCampusId(id)
    setActivePanel('schoolClass')
  }

  function selectClass(id: number) {
    setClassId(id)
    setActivePanel('campus')
  }

  function selectCampus(id: number) {
    setCampusId(id)
    setActivePanel('room')
  }

  function selectRoom(id: number) {
    setRoomId(id)
    setStartMinutes(null)
    setEndMinutes(null)
    setActivePanel('date')
  }

  function selectDate(nextDate: string) {
    setDate(nextDate)
    setStartMinutes(null)
    setEndMinutes(null)
    setActivePanel('time')
  }

  function selectStart(minutes: number) {
    setStartMinutes(minutes)
    setEndMinutes(null)
  }

  function selectEnd(minutes: number) {
    setEndMinutes(minutes)
    setActivePanel('reason')
  }

  async function submitReservation() {
    if (!formReady || !selectedRoom || !selectedClass || startMinutes === null || endMinutes === null || !date) {
      setSubmitError('请把句子里的每一处都填写完整，再完成预约。')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    const payload: CreateReservationPayload = {
      room: selectedRoom.id,
      startTime: toShanghaiEpoch(date, startMinutes),
      endTime: toShanghaiEpoch(date, endMinutes),
      studentName: name.trim(),
      studentId: studentId.trim(),
      email,
      reason: reason.trim(),
      classId: selectedClass.id,
      purposeType: 'personal',
      needsMultimedia: needsMultimedia === true,
    }
    try {
      const result = await hfiApi.createReservation(payload)
      setReservationId(result.reservationId)
    } catch (error: unknown) {
      setSubmitError(formatError(error))
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setReservationId(null)
    setName('')
    setStudentId('')
    setEmailPrefix('')
    setClassCampusId(null)
    setClassId(null)
    setCampusId(null)
    setRoomId(null)
    setDate('')
    setStartMinutes(null)
    setEndMinutes(null)
    setReason('')
    setNeedsMultimedia(null)
    setAvailability(null)
    setSubmitError('')
    setActivePanel(null)
  }

  if (showSplash) {
    return (
      <main className="splash" aria-label="HFI Utility Center">
        <h1>HFI Utility Center</h1>
        <span className="splash__rule" />
      </main>
    )
  }

  if (reservationId !== null) {
    const campusLabel = selectedCampus?.id === 1 ? '石牌校区' : '知识城校区'
    return (
      <main className="confirmation-page">
        <header className="topline">HFI Utility Center</header>
        <section className="confirmation-sentence-wrap">
          <p className="confirmation-sentence">
            你的预约已提交，预约编号是
            <span className="confirmation-value">#{reservationId}</span>
            。你在
            <span className="confirmation-value">{formatDateChinese(date)}</span>
            <span className="confirmation-value">{selectedTimeLabel}</span>
            预约了
            <span className="confirmation-value">{campusLabel}</span>
            的
            <span className="confirmation-value">{selectedRoom?.name}</span>
            ，审核结果会发送至
            <span className="confirmation-value">{email}</span>
            。
          </p>
          <div className="confirmation-actions">
            <Button label="再预约一次" variant="secondary" icon={<RotateCcw size={15} />} onClick={resetForm} />
          </div>
        </section>
        <footer className="page-footer">
          <span>DESIGNED BY MAKERs'</span>
        </footer>
      </main>
    )
  }

  return (
    <main className="booking-page">
      <header className="topline">HFI Utility Center</header>
      <section className="sentence-wrap" aria-label="教室预约表单">
        <div className="sentence" aria-live="polite">
          <span>我是</span>
          <InlineTextInput
            value={name}
            placeholder="预约人姓名"
            ariaLabel="预约人姓名"
            autoComplete="name"
            onChange={setName}
          />
          <span>，学号</span>
          <InlineTextInput
            value={studentId}
            placeholder="GJ00000000"
            ariaLabel="学号，格式为 GJ 加 8 位数字"
            autoComplete="off"
            className="inline-input--student-id"
            invalid={Boolean(studentId && !/^GJ\d{8}$/.test(studentId))}
            onChange={(value) => setStudentId(value.toUpperCase())}
          />
          <span>，邮箱</span>
          <InlineTextInput
            value={emailPrefix}
            placeholder="邮箱前缀"
            ariaLabel="邮箱前缀"
            autoComplete="off"
            inputMode="email"
            className="inline-input--email"
            invalid={Boolean(emailPrefix && !/^[a-zA-Z0-9._%+-]+$/.test(emailPrefix))}
            onChange={setEmailPrefix}
          />
          <span className="sentence-fixed">@gdhfi.com</span>
          <span>，我来自</span>
          <InlineValue value={selectedClassCampus ? (selectedClassCampus.id === 1 ? '石牌校区' : '知识城校区') : ''} placeholder="哪个校区" onClick={() => togglePanel('classCampus')} />
          <ExpandablePanel open={activePanel === 'classCampus'} className="panel-choice">
            <div className="choice-list choice-list--wide">
              {DISPLAY_CAMPUSES.map((option) => (
                <SelectionButton
                  key={option.id}
                  label={option.label}
                  selected={classCampusId === option.id}
                  onClick={() => selectClassCampus(option.id)}
                  disabled={loadingCatalog || !campuses.some((campus) => campus.id === option.id && !campus.isPrivileged)}
                />
              ))}
            </div>
          </ExpandablePanel>
          <span>的</span>
          <InlineValue value={selectedClass?.name ?? ''} placeholder="哪个班级" onClick={() => togglePanel('schoolClass')} invalid={Boolean(classCampusId && !classId)} />
          <span>班</span>
          <ExpandablePanel open={activePanel === 'schoolClass'} className="panel-class">
            {classCampusId ? (
              <ScrollableArea axis="block" label="班级列表" height={220} className="class-scroll">
                <div className="choice-list choice-list--classes">
                  {visibleClasses.map((schoolClass) => (
                    <SelectionButton key={schoolClass.id} label={schoolClass.name} selected={classId === schoolClass.id} onClick={() => selectClass(schoolClass.id)} />
                  ))}
                </div>
              </ScrollableArea>
            ) : <span className="panel-note">请先选择所在校区。</span>}
          </ExpandablePanel>
          <span>，我要预约</span>
          <InlineValue value={selectedCampus ? (selectedCampus.id === 1 ? '石牌校区' : '知识城校区') : ''} placeholder="哪个校区" onClick={() => togglePanel('campus')} />
          <ExpandablePanel open={activePanel === 'campus'} className="panel-choice">
            <div className="choice-list choice-list--wide">
              {DISPLAY_CAMPUSES.map((option) => (
                <SelectionButton
                  key={option.id}
                  label={option.label}
                  selected={campusId === option.id}
                  onClick={() => selectCampus(option.id)}
                  disabled={loadingCatalog || !campuses.some((campus) => campus.id === option.id && !campus.isPrivileged)}
                />
              ))}
            </div>
          </ExpandablePanel>
          <span>的</span>
          <InlineValue value={selectedRoom?.name ?? ''} placeholder="哪间教室" onClick={() => togglePanel('room')} invalid={Boolean(classId && !roomId)} />
          <ExpandablePanel open={activePanel === 'room'} className="panel-choice">
            <div className="panel-heading-row">
              <span>{campusId ? `${selectedCampus?.name ?? ''} · 可用教室` : '先选择校区和班级'}</span>
              {loadingCatalog && <LoaderCircle size={15} className="spin" aria-label="加载中" />}
            </div>
            <div className="choice-list choice-list--rooms">
              {visibleRooms.map((room) => (
                <SelectionButton key={room.id} label={room.name} selected={roomId === room.id} onClick={() => selectRoom(room.id)} />
              ))}
              {!loadingCatalog && campusId && visibleRooms.length === 0 && <span className="panel-note">这个校区目前没有可用教室。</span>}
            </div>
          </ExpandablePanel>
          <span>，在</span>
          <InlineValue value={date ? formatDateChinese(date) : ''} placeholder="哪一天" onClick={() => togglePanel('date')} invalid={Boolean(roomId && !date)} />
          <ExpandablePanel open={activePanel === 'date'} className="panel-calendar">
            {roomId ? (
              <Calendar
                mode="single"
                value={date as `${number}${number}${number}${number}-${number}${number}-${number}${number}` | undefined}
                min={today as `${number}${number}${number}${number}-${number}${number}-${number}${number}`}
                max={maxDate as `${number}${number}${number}${number}-${number}${number}-${number}${number}`}
                onChange={(nextDate) => selectDate(nextDate)}
                weekStartsOn="mon"
                hasOutsideDays={false}
              />
            ) : <span className="panel-note">选好教室后，这里会出现可预约日期。</span>}
          </ExpandablePanel>
          <InlineValue value={selectedTimeLabel === '时间' ? '' : selectedTimeLabel} placeholder="什么时间" onClick={() => togglePanel('time')} invalid={Boolean(date && !endMinutes)} />
          <ExpandablePanel open={activePanel === 'time'} className="panel-time">
            <div className="panel-heading-row">
              <span>{loadingAvailability ? '正在查看可用时间…' : startMinutes === null ? '先选开始时间' : '再选结束时间（最多 2 小时）'}</span>
              {loadingAvailability && <LoaderCircle size={15} className="spin" aria-label="加载中" />}
            </div>
            <div className="time-selection">
              <ScrollableArea axis="block" label="开始时间" height={220} className="time-column">
                <div className="time-list">
                  {timeSlots.map((slot) => (
                    <SelectionButton key={slot.minutes} label={slot.label} selected={startMinutes === slot.minutes} onClick={() => selectStart(slot.minutes)} />
                  ))}
                </div>
              </ScrollableArea>
              <span className="time-arrow" aria-hidden="true">→</span>
              <ScrollableArea axis="block" label="结束时间" height={220} className="time-column">
                <div className="time-list">
                  {endSlots.map((slot) => (
                    <SelectionButton key={slot.minutes} label={slot.label} selected={endMinutes === slot.minutes} onClick={() => selectEnd(slot.minutes)} />
                  ))}
                </div>
              </ScrollableArea>
            </div>
            {!date && <span className="panel-note">先选日期，系统会实时查看这个教室的占用情况。</span>}
            {date && !loadingAvailability && timeSlots.length === 0 && <span className="panel-note">这一天没有可预约的时间段，请换一天。</span>}
          </ExpandablePanel>
          <span>，原因是</span>
          <InlineValue value={reason} placeholder="为什么" onClick={() => togglePanel('reason')} invalid={Boolean(activePanel !== 'reason' && !reason)} />
          <ExpandablePanel open={activePanel === 'reason'} className="panel-reason">
            <TextArea label="预约理由" isLabelHidden value={reason} onChange={setReason} placeholder="写下你预约这个教室的理由…" rows={4} />
          </ExpandablePanel>
          <span>，需要使用多媒体设备？</span>
          <InlineValue value={needsMultimedia === null ? '' : needsMultimedia ? '是' : '否'} placeholder="是/否" onClick={() => togglePanel('multimedia')} />
          <span>。</span>
          <ExpandablePanel open={activePanel === 'multimedia'} className="panel-choice">
            <div className="choice-list choice-list--binary">
              <SelectionButton label="是" selected={needsMultimedia === true} onClick={() => setNeedsMultimedia(true)} />
              <SelectionButton label="否" selected={needsMultimedia === false} onClick={() => setNeedsMultimedia(false)} />
            </div>
          </ExpandablePanel>
        </div>

        {catalogError && <p className="form-message form-message--error">{catalogError}</p>}
        {submitError && <p className="form-message form-message--error">{submitError}</p>}
        <div className="sentence-footer">
          <Button
            label="完成预约"
            variant="primary"
            size="lg"
            isDisabled={!formReady || submitting}
            isLoading={submitting}
            icon={formReady ? <Check size={16} /> : <ChevronDown size={16} />}
            onClick={() => void submitReservation()}
          />
        </div>
      </section>

      <footer className="page-footer">
        <span>DESIGNED BY MAKERs'</span>
      </footer>
    </main>
  )
}

export default App
