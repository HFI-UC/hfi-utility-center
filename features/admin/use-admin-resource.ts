import { useCallback, useEffect, useRef, useState } from "react"

import { getErrorMessage } from "@/lib/api/client"

export function useAdminResource<T>({
  loadResource,
  initialData,
  fallbackError,
}: {
  loadResource: () => Promise<T>
  initialData: T
  fallbackError: string
}) {
  const requestId = useRef(0)
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const reload = useCallback(async () => {
    const currentRequest = ++requestId.current
    setLoading(true)
    setError(undefined)

    try {
      const nextData = await loadResource()
      if (requestId.current === currentRequest) setData(nextData)
    } catch (loadError) {
      if (requestId.current !== currentRequest) return
      setError(getErrorMessage(loadError, fallbackError))
    } finally {
      if (requestId.current === currentRequest) setLoading(false)
    }
  }, [fallbackError, loadResource])

  useEffect(() => {
    async function loadInitialResource() {
      await reload()
    }

    void loadInitialResource()
    return () => {
      requestId.current += 1
    }
  }, [reload])

  return {
    data,
    setData,
    loading,
    error,
    reload,
    reportError: setError,
  }
}
