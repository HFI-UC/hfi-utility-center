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

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const t = useTranslations("admin")
  const ref = useRef<HTMLDivElement>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey || !ref.current) return
    let widgetId: string | undefined
    const render = () => {
      if (window.turnstile && ref.current && !widgetId) {
        widgetId = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: onToken,
          "expired-callback": () => onToken(""),
        })
      }
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-hfiuc-turnstile="true"]'
    )
    if (existing) render()
    else {
      const script = document.createElement("script")
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      script.async = true
      script.defer = true
      script.dataset.hfiucTurnstile = "true"
      script.onload = render
      document.head.appendChild(script)
    }
    return () => {
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
