import type { NextRequest } from "next/server"

type BackendContext = { params: Promise<{ path: string[] }> }

const backendUrl = process.env.VERCEL
  ? "https://api.hfiuc.org"
  : (process.env.BACKEND_URL ?? "https://api.hfiuc.org")

const forwardedRequestHeaders = [
  "accept",
  "authorization",
  "content-type",
  "cookie",
  "user-agent",
  "x-csrf-token",
]

const forwardedResponseHeaders = [
  "cache-control",
  "content-disposition",
  "content-type",
  "etag",
  "location",
  "x-request-id",
]

function normalizeCookie(cookie: string, local: boolean) {
  const sameOriginCookie = cookie.replace(/;\s*Domain=[^;]+/gi, "")
  if (!local) return sameOriginCookie
  return sameOriginCookie
    .replace(/;\s*Secure/gi, "")
    .replace(/SameSite=None/gi, "SameSite=Lax")
}

function copyHeaders(source: Headers, names: string[]) {
  const headers = new Headers()
  for (const name of names) {
    const value = source.get(name)
    if (value) headers.set(name, value)
  }
  return headers
}

async function requestBody(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD") return undefined
  return request.arrayBuffer()
}

function appendResponseCookies(
  headers: Headers,
  response: Response,
  local: boolean
) {
  const cookies = response.headers.getSetCookie?.() ?? []
  if (cookies.length) {
    for (const cookie of cookies) {
      headers.append("set-cookie", normalizeCookie(cookie, local))
    }
    return
  }

  const cookie = response.headers.get("set-cookie")
  if (cookie) headers.append("set-cookie", normalizeCookie(cookie, local))
}

async function forward(request: NextRequest, context: BackendContext) {
  try {
    const { path } = await context.params
    const target = new URL(`/${path.join("/")}`, backendUrl)
    target.search = request.nextUrl.search

    const response = await fetch(target, {
      method: request.method,
      headers: copyHeaders(request.headers, forwardedRequestHeaders),
      body: await requestBody(request),
      cache: "no-store",
      redirect: "manual",
    })

    const outgoingHeaders = copyHeaders(
      response.headers,
      forwardedResponseHeaders
    )
    const local = ["localhost", "127.0.0.1"].includes(request.nextUrl.hostname)
    appendResponseCookies(outgoingHeaders, response, local)

    return new Response(response.body, {
      status: response.status,
      headers: outgoingHeaders,
    })
  } catch {
    return Response.json(
      { success: false, message: "Backend connection failed" },
      { status: 502 }
    )
  }
}

export const GET = forward
export const HEAD = forward
export const POST = forward
export const PUT = forward
export const PATCH = forward
export const DELETE = forward
export const runtime = "edge"
