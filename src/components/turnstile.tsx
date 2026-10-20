"use client"

import { RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "expired-callback": () => void
        },
      ) => string
      remove: (id: string) => void
    }
  }
}

const turnstileScriptSelector = 'script[data-hfiuc-turnstile="true"]'
const turnstileScriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
let turnstileScriptRequest: Promise<void> | undefined

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve()
  if (turnstileScriptRequest) return turnstileScriptRequest

  turnstileScriptRequest = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(turnstileScriptSelector)
    const script = existing ?? document.createElement("script")

    script.addEventListener("load", () => resolve(), { once: true })
    script.addEventListener(
      "error",
      () => {
        turnstileScriptRequest = undefined
        script.remove()
        reject(new Error("Unable to load Turnstile"))
      },
      { once: true },
    )

    if (!existing) {
      script.src = turnstileScriptUrl
      script.async = true
      script.defer = true
      script.dataset.hfiucTurnstile = "true"
      document.head.append(script)
    }
  })
  return turnstileScriptRequest
}

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const t = useTranslations("admin")
  const ref = useRef<HTMLDivElement>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    if (!siteKey || !ref.current) return
    const widgetSiteKey = siteKey
    let active = true
    let widgetId: string | undefined

    async function renderWidget() {
      setLoadFailed(false)
      try {
        await loadTurnstileScript()
        if (!active || !window.turnstile || !ref.current) return

        widgetId = window.turnstile.render(ref.current, {
          sitekey: widgetSiteKey,
          callback: onToken,
          "expired-callback": () => onToken(""),
        })
      } catch {
        if (active) setLoadFailed(true)
      }
    }

    void renderWidget()

    return () => {
      active = false
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [loadAttempt, onToken, siteKey])

  function retry() {
    setLoadFailed(false)
    setLoadAttempt((attempt) => attempt + 1)
  }

  if (!siteKey)
    return (
      <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        {t("turnstileMissing")}
      </p>
    )
  if (loadFailed) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg bg-muted p-4">
        <p className="text-sm text-destructive">{t("turnstileLoadFailed")}</p>
        <Button size="sm" variant="outline" onClick={retry}>
          <RefreshCw />
          {t("retryVerification")}
        </Button>
      </div>
    )
  }

  return (
    <div className="turnstile-widget-shell">
      <div ref={ref} className="min-h-16" />
    </div>
  )
}
