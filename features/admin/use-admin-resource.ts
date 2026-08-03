import { useCallback, useEffect, useRef, useState } from "react"

export function useAdminResource<T>({
  load,
  initialData,
  fallbackError,
}: {
  load: () => Promise<T>
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
      const nextData = await load()
      if (requestId.current === currentRequest) setData(nextData)
    } catch (loadError) {
      if (requestId.current !== currentRequest) return
      setError(loadError instanceof Error ? loadError.message : fallbackError)
    } finally {
      if (requestId.current === currentRequest) setLoading(false)
    }
  }, [fallbackError, load])

  useEffect(() => {
    async function loadInitialData() {
      await reload()
    }

    void loadInitialData()
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
