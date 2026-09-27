"use client"

import { cn } from "@/lib/utils"

/** Replays a per-digit pop when `value` changes. Static glyphs stay put. */
export function MotionNumber({ value, className }: { value: string; className?: string }) {
  const glyphs = Array.from(value)
  const occurrences = new Map<string, number>()
  let digit = 0

  return (
    <span className={cn("t-digit-group is-animating", className)}>
      {glyphs.map((glyph) => {
        const isDigit = /\d/.test(glyph)
        const stagger = isDigit ? digit++ : undefined
        const occurrence = occurrences.get(glyph) ?? 0
        occurrences.set(glyph, occurrence + 1)
        return (
          <span
            key={`${glyph}-${occurrence}`}
            className={cn("t-digit", !isDigit && "w-[0.35em] text-center")}
            data-stagger={
              stagger !== undefined && stagger > 0 ? String(Math.min(stagger, 2)) : undefined
            }
          >
            {glyph}
          </span>
        )
      })}
    </span>
  )
}
