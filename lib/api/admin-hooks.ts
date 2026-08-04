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

  const mutate: AdminMutation = useCallback(
    async (key, action, successMessage) => {
      if (mutationInProgress.current) return false

      mutationInProgress.current = true
      setWorkingKey(key)
      setNotice(undefined)
      reportError(undefined)

      try {
        await action()
        await reload()
        setNotice(successMessage)
        return true
      } catch (error) {
        reportError(getErrorMessage(error, fallbackError))
        return false
      } finally {
        mutationInProgress.current = false
        setWorkingKey(undefined)
      }
    },
    [fallbackError, reload, reportError]
  )

  return { mutate, workingKey, notice }
}

export function useAdminSession(enabled = true) {
  const router = useRouter()
  const pathname = usePathname()
  const [verifiedPath, setVerifiedPath] = useState<string>()

  useEffect(() => {
    if (!enabled) return
    let active = true

    checkLogin()
      .then(() => {
        if (active) setVerifiedPath(pathname)
      })
      .catch(() => {
        if (active) {
          router.replace(
            `/admin/login?redirect=${encodeURIComponent(pathname)}`
          )
        }
      })

    return () => {
      active = false
    }
  }, [enabled, pathname, router])

  return {
    checking: enabled && verifiedPath !== pathname,
    authenticated: enabled && verifiedPath === pathname,
  }
}
