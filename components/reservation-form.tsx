"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowUpRight, RotateCw } from "lucide-react"
import { utilityApi, type DirectoryItem } from "@/lib/utility-api"

async function fetchDirectory() {
  const [rooms, classes, campuses] = await Promise.all([
    utilityApi<DirectoryItem[]>("room/list"),
    utilityApi<DirectoryItem[]>("class/list"),
    utilityApi<DirectoryItem[]>("campus/list"),
  ])
  return { rooms, classes, campuses }
}

export function ReservationForm() {
  const [directory, setDirectory] = useState<{
    rooms: DirectoryItem[]
    classes: DirectoryItem[]
    campuses: DirectoryItem[]
  } | null>(null)
  const [campus, setCampus] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState<number | null>(null)
  async function load() {
    try {
      setDirectory(await fetchDirectory())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load rooms.")
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    let active = true
    fetchDirectory()
      .then((data) => {
        if (active) setDirectory(data)
      })
      .catch((e: unknown) => {
        if (active)
          setError(e instanceof Error ? e.message : "Unable to load rooms.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const startTime = Math.floor(
      new Date(String(data.get("startTime"))).getTime() / 1000
    )
    const endTime = Math.floor(
      new Date(String(data.get("endTime"))).getTime() / 1000
    )
    if (
      startTime <= Date.now() / 1000 ||
      startTime > Date.now() / 1000 + 30 * 86400 ||
      endTime <= startTime ||
      endTime - startTime > 7200
    ) {
      setError(
        "Choose a future time within 30 days, with a duration of up to 2 hours."
      )
      return
    }
    setBusy(true)
    setError("")
    try {
      const result = await utilityApi<{ reservationId: number }>(
        "reservation/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room: Number(data.get("room")),
            classId: Number(data.get("classId")),
            studentName: String(data.get("studentName")).trim(),
            studentId: String(data.get("studentId")).trim(),
            email: String(data.get("email")).trim(),
            reason: String(data.get("reason")).trim(),
            startTime,
            endTime,
          }),
        }
      )
      setCreated(result.reservationId)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to submit your reservation."
      )
    } finally {
      setBusy(false)
    }
  }
  if (created !== null)
    return (
      <section className="service-notice" role="status">
        <span className="notice-icon">↗</span>
        <div>
          <p className="eyebrow">REQUEST RECEIVED / #{created}</p>
          <h2>Your next idea has a starting point.</h2>
          <p>
            Your reservation request has been submitted. Check its latest status
            before using the room.
          </p>
          <Link
            className="text-link"
            href={`/reservation/search?keyword=${created}`}
          >
            View reservation <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    )
  const rooms =
    directory?.rooms.filter((r) => r.enabled && String(r.campus) === campus) ||
    []
  const classes =
    directory?.classes.filter((c) => String(c.campus) === campus) || []
  return (
    <div className="reservation-layout">
      <aside className="form-aside">
        <span className="eyebrow">
          A LITTLE PLANNING.
          <br />A LOT OF POSSIBILITY.
        </span>
        <div className="aside-graphic" aria-hidden="true">
          ↗
        </div>
        <h2>Make it happen.</h2>
        <p>Choose your space, tell us your plans, and send a request.</p>
        <ul>
          <li>Book up to 30 days ahead</li>
          <li>Up to 2 hours per reservation</li>
          <li>Times use your device’s time zone</li>
        </ul>
      </aside>
      <form className="reservation-form" onSubmit={submit}>
        {error && (
          <div className="form-error" role="alert">
            {error}
            {!directory && (
              <button
                type="button"
                className="text-link"
                disabled={loading}
                onClick={() => {
                  setLoading(true)
                  setError("")
                  void load()
                }}
              >
                <RotateCw size={14} /> Retry loading
              </button>
            )}
          </div>
        )}
        {loading && (
          <p role="status" className="form-hint">
            Loading campus spaces…
          </p>
        )}
        <fieldset disabled={loading || !directory || busy}>
          <legend>01 — YOUR SPACE</legend>
          <div className="form-grid">
            <label className="field-wide">
              Campus
              <select
                required
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
              >
                <option value="">Choose a campus</option>
                {directory?.campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label key={`room-${campus}`}>
              Room
              <select
                name="room"
                required
                disabled={!campus || !rooms.length}
                defaultValue=""
              >
                <option value="">
                  {campus && !rooms.length
                    ? "No rooms available"
                    : "Choose a room"}
                </option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
            <label key={`class-${campus}`}>
              Class
              <select
                name="classId"
                required
                disabled={!campus || !classes.length}
                defaultValue=""
              >
                <option value="">
                  {campus && !classes.length
                    ? "No classes available"
                    : "Choose your class"}
                </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Starts at
              <input name="startTime" type="datetime-local" required />
            </label>
            <label>
              Ends at
              <input name="endTime" type="datetime-local" required />
            </label>
          </div>
        </fieldset>
        <fieldset disabled={busy}>
          <legend>02 — YOUR DETAILS</legend>
          <div className="form-grid">
            <label>
              Full name
              <input
                name="studentName"
                autoComplete="name"
                required
                maxLength={100}
                placeholder="Your name"
              />
            </label>
            <label>
              Student ID
              <input
                name="studentId"
                required
                pattern="GJ[0-9]{8}"
                title="GJ followed by eight digits"
                placeholder="GJ12345678"
              />
            </label>
            <label className="field-wide">
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </label>
            <label className="field-wide">
              What are you planning?
              <textarea
                name="reason"
                required
                maxLength={2000}
                rows={3}
                placeholder="Tell us how you’ll use the space."
              />
            </label>
          </div>
        </fieldset>
        <div className="form-submit">
          <p className="form-hint">
            Room availability and policies are checked on submission.
          </p>
          <button
            className="primary-button"
            disabled={
              busy || loading || !directory || !rooms.length || !classes.length
            }
          >
            {busy ? "Submitting…" : "Send request"}
            <ArrowUpRight size={18} />
          </button>
        </div>
      </form>
    </div>
  )
}
