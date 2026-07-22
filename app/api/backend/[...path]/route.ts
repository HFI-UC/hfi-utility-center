import type { NextRequest } from "next/server"

const backendUrl = process.env.VERCEL
  ? "https://api.hfiuc.org"
  : (process.env.BACKEND_URL ?? "https://api.hfiuc.org")
const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE"])

async function fetchBackend(target: URL, init: RequestInit) {
  const attempts = init.method === "GET" ? 2 : 1
  let lastError: unknown

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fetch(target, {
        ...init,
        signal: AbortSignal.timeout(12_000),
      })
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

function isLocalRequest(request: NextRequest) {
  return (
    request.nextUrl.hostname === "localhost" ||
    request.nextUrl.hostname === "127.0.0.1"
  )
}

function normalizeSetCookie(value: string, local: boolean) {
  const sameOriginCookie = value.replace(/;\s*Domain=[^;]+/gi, "")
  if (!local) return sameOriginCookie
  return sameOriginCookie
    .replace(/;\s*Secure/gi, "")
    .replace(/SameSite=None/gi, "SameSite=Lax")
}

async function proxyRequest(
  request: NextRequest,
  context: RouteContext<"/api/backend/[...path]">
) {
  const { path } = await context.params
  const target = new URL(`/${path.join("/")}`, backendUrl)
  target.search = request.nextUrl.search

  const headers = new Headers()
  for (const name of [
    "accept",
    "content-type",
    "cookie",
    "authorization",
    "user-agent",
  ]) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  if (mutationMethods.has(request.method) && !headers.get("authorization")) {
    const csrfResponse = await fetchBackend(new URL("/_csrf", backendUrl), {
      method: "GET",
      cache: "no-store",
    })
    const csrfCookie = csrfResponse.headers.get("set-cookie")
    const csrfToken = csrfCookie?.match(/_csrf=([^;]+)/)?.[1]
    if (csrfToken) {
      const existingCookie = headers.get("cookie")
      headers.set(
        "cookie",
        [existingCookie, `_csrf=${csrfToken}`].filter(Boolean).join("; ")
      )
      headers.set("x-csrf-token", decodeURIComponent(csrfToken))
    }
  }

  const response = await fetchBackend(target, {
    method: request.method,
    headers,
    body: mutationMethods.has(request.method)
      ? await request.arrayBuffer()
      : undefined,
    cache: "no-store",
    redirect: "manual",
  })

  const responseHeaders = new Headers()
  for (const name of [
    "content-type",
    "content-disposition",
    "etag",
    "cache-control",
    "location",
    "x-request-id",
  ]) {
    const value = response.headers.get(name)
    if (value) responseHeaders.set(name, value)
  }

  const getSetCookie = (
    response.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie
  const cookies = getSetCookie ? getSetCookie.call(response.headers) : []
  for (const cookie of cookies) {
    responseHeaders.append(
      "set-cookie",
      normalizeSetCookie(cookie, isLocalRequest(request))
    )
  }
  if (!cookies.length) {
    const cookie = response.headers.get("set-cookie")
    if (cookie)
      responseHeaders.append(
        "set-cookie",
        normalizeSetCookie(cookie, isLocalRequest(request))
      )
  }

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  })
}

async function proxy(
  request: NextRequest,
  context: RouteContext<"/api/backend/[...path]">
) {
  try {
    return await proxyRequest(request, context)
  } catch {
    return Response.json(
      { success: false, message: "Backend connection failed" },
      { status: 502 }
    )
  }
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const maxDuration = 30
export const runtime = "edge"
export const preferredRegion = "global"
