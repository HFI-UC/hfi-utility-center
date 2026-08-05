"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { checkLogin } from "@/lib/api/auth"

export type AdminMutation = (
  action: () => Promise<unknown>,
  successMessage?: string
) => Promise<boolean>

type AdminSessionStatus = "checking" | "authenticated" | "unauthenticated"

export function useAdminResource<T>(
  loadResource: () => Promise<T>,
  initialData: T
) {
  const requestId = useRef(0)
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>()

  const reload = useCallback(async () => {
    const currentRequest = ++requestId.current
    setLoading(true)
    setError(undefined)

    try {
      const nextData = await loadResource()
      if (requestId.current !== currentRequest) return false
      setData(nextData)
      return true
    } catch (error) {
      if (requestId.current === currentRequest) setError(error)
      return false
    } finally {
      if (requestId.current === currentRequest) setLoading(false)
    }
  }, [loadResource])

  useEffect(() => {
    const currentRequest = ++requestId.current

    loadResource()
      .then(
        (nextData) => {
          if (requestId.current === currentRequest) setData(nextData)
        },
        (error: unknown) => {
          if (requestId.current === currentRequest) setError(error)
        }
      )
      .finally(() => {
        if (requestId.current === currentRequest) setLoading(false)
      })

    return () => {
      if (requestId.current === currentRequest) requestId.current += 1
    }
  }, [loadResource])

  return {
    data,
    loading,
    error,
    reload,
  }
}

export function useAdminMutation(reload: () => Promise<boolean>) {
  const mutationInProgress = useRef(false)
  const [working, setWorking] = useState(false)
  const [notice, setNotice] = useState<string>()
  const [error, setError] = useState<unknown>()

  const mutate: AdminMutation = useCallback(
    async (action, successMessage) => {
      if (mutationInProgress.current) return false

      mutationInProgress.current = true
      setWorking(true)
      setNotice(undefined)
      setError(undefined)

      try {
        await action()
        if (!(await reload())) return false
        setNotice(successMessage)
        return true
      } catch (error) {
        setError(error)
        return false
      } finally {
        mutationInProgress.current = false
        setWorking(false)
      }
    },
    [reload]
  )

  return { mutate, working, notice, error }
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
