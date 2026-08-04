"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { checkLogin } from "@/lib/api/auth"
import { getErrorMessage } from "@/lib/api/client"

export type AdminMutation = (
  key: string,
  action: () => Promise<unknown>,
  successMessage?: string
) => Promise<boolean>

type AdminSessionStatus = "checking" | "authenticated" | "unauthenticated"

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
      if (requestId.current === currentRequest) {
        setError(getErrorMessage(loadError, fallbackError))
      }
    } finally {
      if (requestId.current === currentRequest) setLoading(false)
    }
  }, [fallbackError, loadResource])

  useEffect(() => {
    async function fetchInitialResource() {
      await reload()
    }

    void fetchInitialResource()
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

export function useAdminMutation({
  reload,
  reportError,
  fallbackError,
}: {
  reload: () => Promise<void>
  reportError: (message?: string) => void
  fallbackError: string
}) {
  const mutationInProgress = useRef(false)
  const [workingKey, setWorkingKey] = useState<string>()
  const [notice, setNotice] = useState<string>()

  const performAction = useCallback(
    async (action: () => Promise<unknown>) => {
      try {
        await action()
        return true
      } catch (error) {
        reportError(getErrorMessage(error, fallbackError))
        return false
      }
    },
    [fallbackError, reportError]
  )

  const mutate: AdminMutation = useCallback(
    async (key, action, successMessage) => {
      if (mutationInProgress.current) return false

      mutationInProgress.current = true
      setWorkingKey(key)
      setNotice(undefined)
      reportError(undefined)

      try {
        if (!(await performAction(action))) return false

        setNotice(successMessage)
        await reload()
        return true
      } finally {
        mutationInProgress.current = false
        setWorkingKey(undefined)
      }
    },
    [performAction, reload, reportError]
  )

  return { mutate, workingKey, notice }
}

export function useAdminSession(enabled = true) {
  const router = useRouter()
  const pathname = usePathname()
  const [status, setStatus] = useState<AdminSessionStatus>("checking")

  useEffect(() => {
    if (!enabled || status !== "checking") return
    let active = true

    checkLogin()
      .then(() => {
        if (active) setStatus("authenticated")
      })
      .catch(() => {
        if (active) {
          setStatus("unauthenticated")
          router.replace(
            `/admin/login?redirect=${encodeURIComponent(pathname)}`
          )
        }
      })

    return () => {
      active = false
    }
  }, [enabled, pathname, router, status])

  return {
    checking: enabled && status === "checking",
    authenticated: enabled && status === "authenticated",
  }
}
