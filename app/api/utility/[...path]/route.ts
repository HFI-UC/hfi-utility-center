import { z } from "zod"

const base = (process.env.UTILITY_API_URL || "http://127.0.0.1:8000").replace(
  /\/$/,
  ""
)
const readable = new Set([
  "room/list",
  "campus/list",
  "class/list",
  "reservation/get",
])
type Context = { params: Promise<{ path: string[] }> }
const failure = (message: string, status: number) =>
  Response.json({ success: false, message }, { status })
const options = { cache: "no-store" as const, redirect: "error" as const }

export async function GET(request: Request, context: Context) {
  const path = (await context.params).path.join("/")
  if (!readable.has(path)) return failure("Not found.", 404)
  try {
    const response = await fetch(
      `${base}/${path}${new URL(request.url).search}`,
      { ...options, signal: AbortSignal.timeout(10000) }
    )
    return Response.json(await response.json(), {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    })
  } catch {
    return failure(
      "The reservation service is currently unavailable. Please try again shortly.",
      503
    )
  }
}

const reservation = z
  .object({
    room: z.number().int().positive(),
    classId: z.number().int().positive(),
    studentName: z.string().trim().min(1).max(100),
    studentId: z.string().regex(/^GJ\d{8}$/),
    email: z.email(),
    reason: z.string().trim().min(1).max(2000),
    startTime: z.number().int(),
    endTime: z.number().int(),
  })
  .refine(
    (v) =>
      v.startTime > Date.now() / 1000 &&
      v.startTime <= Date.now() / 1000 + 30 * 86400 &&
      v.endTime > v.startTime &&
      v.endTime - v.startTime <= 7200
  )

export async function POST(request: Request, context: Context) {
  if ((await context.params).path.join("/") !== "reservation/create")
    return failure("Not found.", 404)
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return failure("Request origin is not allowed.", 403)
  let payload
  try {
    payload = reservation.safeParse(await request.json())
  } catch {
    return failure("Invalid request.", 400)
  }
  if (!payload.success)
    return failure(
      "Check your details. Book within 30 days for up to 2 hours, using a student ID in GJ12345678 format.",
      400
    )
  try {
    // The backend issues a single-use CSRF token through Set-Cookie, not JSON.
    const csrf = await fetch(`${base}/_csrf`, {
      ...options,
      signal: AbortSignal.timeout(10000),
    })
    const token = csrf.headers
      .getSetCookie()
      .map((cookie) => cookie.match(/^_csrf=([^;]+)/)?.[1])
      .find(Boolean)
    if (!csrf.ok || !token)
      return failure(
        "Could not prepare your reservation. Please try again.",
        503
      )
    const response = await fetch(`${base}/reservation/create`, {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", "x-csrf-token": token },
      body: JSON.stringify(payload.data),
      signal: AbortSignal.timeout(20000),
    })
    return Response.json(await response.json(), {
      status: response.status,
      headers: { "Cache-Control": "no-store" },
    })
  } catch {
    return failure(
      "We could not confirm the result. Search your reservations before submitting again.",
      503
    )
  }
}
