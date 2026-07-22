"use client"

import dynamic from "next/dynamic"
import { useCallback, useSyncExternalStore } from "react"

import { cn } from "@/lib/utils"

const LiquidGlass = dynamic(() => import("liquid-glass-react"), { ssr: false })

function useMediaQuery(query: string) {
  const subscribe = useCallback((onChange: () => void) => {
    const media = window.matchMedia(query)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [query])
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

function useBackdropSupport() {
  return useSyncExternalStore(
    () => () => undefined,
    () => CSS.supports("backdrop-filter", "blur(1px)") || CSS.supports("-webkit-backdrop-filter", "blur(1px)"),
    () => false,
  )
}

type GlassVariant = "action" | "toolbar"

const settings: Record<GlassVariant, {
  displacementScale: number
  blurAmount: number
  saturation: number
  aberrationIntensity: number
  elasticity: number
}> = {
  action: { displacementScale: 28, blurAmount: 0.08, saturation: 118, aberrationIntensity: 0.7, elasticity: 0.08 },
  toolbar: { displacementScale: 18, blurAmount: 0.06, saturation: 112, aberrationIntensity: 0.4, elasticity: 0.04 },
}

export function GlassSurface({
  children,
  className,
  contentClassName,
  variant = "action",
}: {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  variant?: GlassVariant
}) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const reducedTransparency = useMediaQuery("(prefers-reduced-transparency: reduce)")
  const coarsePointer = useMediaQuery("(pointer: coarse)")
  const enhanced = useBackdropSupport() && !reducedMotion && !reducedTransparency

  const content = <div className={cn("glass-content", contentClassName)}>{children}</div>
  if (!enhanced) return <div className={cn("glass-fallback", className)}>{content}</div>

  const config = settings[variant]
  return (
    <div className={cn("glass-host relative", variant === "action" ? "min-h-[17rem]" : "min-h-16", className)}>
      <LiquidGlass
        className="glass-enhanced"
        displacementScale={coarsePointer ? Math.round(config.displacementScale * 0.55) : config.displacementScale}
        blurAmount={config.blurAmount}
        saturation={config.saturation}
        aberrationIntensity={coarsePointer ? 0 : config.aberrationIntensity}
        elasticity={coarsePointer ? 0.02 : config.elasticity}
        cornerRadius={8}
        mode="standard"
        overLight
        padding="0"
        style={{ position: "absolute", left: "50%", top: "50%", width: "100%" }}
      >
        {content}
      </LiquidGlass>
    </div>
  )
}
