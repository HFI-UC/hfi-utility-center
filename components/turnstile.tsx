"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void }) => string
      remove: (id: string) => void
    }
  }
}

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const localDevelopment = process.env.NODE_ENV === "development" && !siteKey

  useEffect(() => {
    if (localDevelopment) { onToken("development"); return () => onToken("") }
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
    const existing = document.querySelector<HTMLScriptElement>('script[data-hfiuc-turnstile="true"]')
    if (existing) render()
    else {
      const script = document.createElement("script")
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      script.async = true
      script.defer = true
      script.dataset.hfiucTurnstile = "true"
      script.onload = render
      document.head.appendChild(script)
    }
    return () => { if (widgetId && window.turnstile) window.turnstile.remove(widgetId) }
  }, [localDevelopment, onToken, siteKey])

  if (localDevelopment) return <p className="border-y py-4 text-sm text-muted-foreground">本地开发验证已启用。</p>
  if (!siteKey) return <p className="border-y py-4 text-sm text-muted-foreground">尚未配置 Cloudflare Turnstile 站点密钥。邮件登录链接仍可正常使用。</p>
  return <div ref={ref} className="min-h-16" />
}
