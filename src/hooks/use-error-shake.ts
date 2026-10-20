"use client"

import * as React from "react"

const INVALID = '[data-invalid="true"]'
const SHAKE = "animate-shake-x"

/**
 * Replays the error-state shake on every invalid `Field` / `FieldSet` inside
 * the returned ref.
 *
 * The persistent error styling is already driven by `data-invalid`, so this
 * only ever adds the shake animation — the two stay orthogonal, which is what
 * makes a replay (remove → forced reflow → re-add) safe. Call `shake()` from
 * a failed validation submit, never from render: on every render the shake
 * would re-fire and the form would never sit still.
 */
export function useErrorShake<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null)
  const [replay, setReplay] = React.useState(0)

  React.useEffect(() => {
    if (replay === 0) return
    const root = ref.current
    if (!root) return

    const fields = root.querySelectorAll<HTMLElement>(INVALID)
    if (!fields.length) return

    let longest = 0
    fields.forEach((field) => {
      field.classList.remove(SHAKE)
      void field.offsetWidth // force reflow so the keyframes restart
      field.classList.add(SHAKE)
      // Read the duration back off the element so the timer can never drift
      // from the CSS — and so a reduced-motion zero duration is honoured.
      const ms = parseFloat(getComputedStyle(field).animationDuration)
      if (Number.isFinite(ms)) longest = Math.max(longest, ms * 1000)
    })

    const timer = setTimeout(() => {
      root.querySelectorAll(`.${SHAKE}`).forEach((field) => {
        field.classList.remove(SHAKE)
      })
    }, longest + 20)

    return () => clearTimeout(timer)
  }, [replay])

  return { ref, shake: React.useCallback(() => setReplay((n) => n + 1), []) }
}
