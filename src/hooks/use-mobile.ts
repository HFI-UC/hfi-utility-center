import * as React from "react"

const MOBILE_QUERY = "(max-width: 767px)"

function subscribe(onStoreChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY)
  query.addEventListener("change", onStoreChange)
  return () => query.removeEventListener("change", onStoreChange)
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  )
}
