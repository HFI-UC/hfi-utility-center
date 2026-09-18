"use client"

import { useState, type FormEvent } from "react"
import { ArrowUpRight, Search } from "lucide-react"
import { utilityApi, type Reservation } from "@/lib/utility-api"

export function ReservationSearch({
  initialKeyword,
}: {
  initialKeyword: string
}) {
  const [keyword, setKeyword] = useState(initialKeyword)
  const [status, setStatus] = useState("")
  const [result, setResult] = useState<{
    total: number
    reservations: Reservation[]
  } | null>(null)
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState({ keyword: "", status: "" })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function search(nextPage: number, filters = query) {
    setBusy(true)
    setError("")
    setResult(null)
    try {
      const params = new URLSearchParams({ ...filters, page: String(nextPage) })
      setResult(await utilityApi(`reservation/get?${params}`))
      setPage(nextPage)
      setQuery(filters)
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Search failed. Please try again."
      )
    } finally {
      setBusy(false)
    }
  }
  function submit(e: FormEvent) {
    e.preventDefault()
    void search(0, { keyword: keyword.trim(), status })
  }
  return (
    <section className="search-workspace">
      <form className="search-form" onSubmit={submit}>
        <label>
          Reservation ID, name, or email
          <div className="search-input">
            <Search size={18} />
            <input
              required
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Find your next plan"
            />
          </div>
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
        <button className="primary-button" disabled={busy}>
          {busy ? "Searching…" : "Search"}
          <ArrowUpRight size={18} />
        </button>
      </form>
      <div aria-live="polite" aria-busy={busy}>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {!result && !error && (
          <div className="search-empty">
            <Search size={36} strokeWidth={1} />
            <h2>
              {busy ? "Finding your plans…" : "Every plan starts somewhere."}
            </h2>
            <p>Search for a reservation to see its room, time, and status.</p>
          </div>
        )}
        {result && (
          <>
            <div className="section-label">
              <h2>{result.total} RESERVATIONS FOUND</h2>
              <span>PAGE {page + 1}</span>
            </div>
            {result.reservations.length === 0 ? (
              <div className="search-empty">
                <h2>No matching plans yet.</h2>
                <p>Try another name, email, or reservation ID.</p>
              </div>
            ) : (
              <div className="reservation-results">
                {result.reservations.map((r) => (
                  <article className="result-card" key={r.id}>
                    <div className="result-top">
                      <span className="eyebrow">RESERVATION / {r.id}</span>
                      <span className={`status-badge status-${r.status}`}>
                        {r.status}
                      </span>
                    </div>
                    <h2>{r.roomName || "Room"}</h2>
                    <p>{r.studentName}</p>
                    <p className="result-time">
                      {new Date(r.startTime).toLocaleString()} →{" "}
                      {new Date(r.endTime).toLocaleString()}
                    </p>
                    <p>{r.reason}</p>
                  </article>
                ))}
              </div>
            )}
            <div className="pagination">
              <button
                disabled={busy || page === 0}
                onClick={() => search(page - 1)}
              >
                ← Previous
              </button>
              <span>
                {result.total ? page * 20 + 1 : 0}–
                {Math.min((page + 1) * 20, result.total)} of {result.total}
              </span>
              <button
                disabled={busy || (page + 1) * 20 >= result.total}
                onClick={() => search(page + 1)}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
