import type { NextRequest } from "next/server"

type BackendContext = { params: Promise<{ path: string[] }> }

const backendUrl = process.env.VERCEL
  ? "https://api.hfiuc.org"
  : (process.env.BACKEND_URL ?? "https://api.hfiuc.org")

const requestHeaders = [
  "accept",
  "authorization",
  "content-type",
  "cookie",
  "user-agent",
  "x-csrf-token",
]

const responseHeaders = [
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

async function forward(request: NextRequest, context: BackendContext) {
  try {
    const { path } = await context.params
    const target = new URL(`/${path.join("/")}`, backendUrl)
    target.search = request.nextUrl.search

    const headers = new Headers()
    for (const name of requestHeaders) {
      const value = request.headers.get(name)
      if (value) headers.set(name, value)
    }

    const response = await fetch(target, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    })

    const outgoingHeaders = new Headers()
    for (const name of responseHeaders) {
      const value = response.headers.get(name)
      if (value) outgoingHeaders.set(name, value)
    }

    const local = ["localhost", "127.0.0.1"].includes(request.nextUrl.hostname)
    const cookies = response.headers.getSetCookie?.() ?? []
    for (const cookie of cookies) {
      outgoingHeaders.append("set-cookie", normalizeCookie(cookie, local))
    }
    if (!cookies.length) {
      const cookie = response.headers.get("set-cookie")
      if (cookie) {
        outgoingHeaders.append("set-cookie", normalizeCookie(cookie, local))
      }
    }

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
