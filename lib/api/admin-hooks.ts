"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { checkLogin } from "@/lib/api/auth"
import { getErrorMessage } from "@/lib/api/client"

export type AdminMutation = (
  action: () => Promise<void>,
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
  const [working, setWorking] = useState(false)
  const [notice, setNotice] = useState<string>()

  const mutate: AdminMutation = useCallback(
    async (action, successMessage) => {
      if (mutationInProgress.current) return false

      mutationInProgress.current = true
      setWorking(true)
      setNotice(undefined)
      reportError(undefined)

      try {
        await action()
        setNotice(successMessage)
        await reload()
        return true
      } catch (error) {
        reportError(getErrorMessage(error, fallbackError))
        return false
      } finally {
        mutationInProgress.current = false
        setWorking(false)
      }
    },
    [fallbackError, reload, reportError]
  )

  return { mutate, working, notice }
}

export function useAdminSession(initialPath: string) {
  const router = useRouter()
  const [status, setStatus] = useState<AdminSessionStatus>("checking")

  useEffect(() => {
    let active = true

    checkLogin()
      .then(() => {
        if (active) setStatus("authenticated")
      })
      .catch(() => {
        if (active) {
          setStatus("unauthenticated")
          router.replace(
            `/admin/login?redirect=${encodeURIComponent(initialPath)}`
          )
        }
      })

    return () => {
      active = false
    }
  }, [initialPath, router])

  return {
    checking: status === "checking",
    authenticated: status === "authenticated",
  }
}
