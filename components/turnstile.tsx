"use client"

import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "expired-callback": () => void
        }
      ) => string
      remove: (id: string) => void
    }
  }
}

const turnstileScriptSelector = 'script[data-hfiuc-turnstile="true"]'
const turnstileScriptUrl =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
let turnstileScriptRequest: Promise<void> | undefined

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve()
  if (turnstileScriptRequest) return turnstileScriptRequest

  turnstileScriptRequest = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      turnstileScriptSelector
    )
    const script = existing ?? document.createElement("script")

    script.addEventListener("load", () => resolve(), { once: true })
    script.addEventListener(
      "error",
      () => {
        turnstileScriptRequest = undefined
        reject(new Error("Unable to load Turnstile"))
      },
      { once: true }
    )

    if (!existing) {
      script.src = turnstileScriptUrl
      script.async = true
      script.defer = true
      script.dataset.hfiucTurnstile = "true"
      document.head.appendChild(script)
    }
  })
  return turnstileScriptRequest
}

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const t = useTranslations("admin")
  const ref = useRef<HTMLDivElement>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey || !ref.current) return
    const widgetSiteKey = siteKey
    let active = true
    let widgetId: string | undefined

    async function renderWidget() {
      try {
        await loadTurnstileScript()
      } catch {
        return
      }
      if (!active || !window.turnstile || !ref.current) return

      widgetId = window.turnstile.render(ref.current, {
        sitekey: widgetSiteKey,
        callback: onToken,
        "expired-callback": () => onToken(""),
      })
    }

    void renderWidget()
    return () => {
      active = false
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [onToken, siteKey])

  if (!siteKey)
    return (
      <p className="border-y py-4 text-sm text-muted-foreground">
        {t("turnstileMissing")}
      </p>
    )
  return <div ref={ref} className="min-h-16" />
}
