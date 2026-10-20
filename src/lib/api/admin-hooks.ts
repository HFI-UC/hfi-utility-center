"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { checkLogin } from "@/lib/api/auth"

export type AdminMutation = (
  action: () => Promise<unknown>,
  successMessage?: string,
) => Promise<boolean>

type AdminSessionStatus = "checking" | "authenticated" | "unauthenticated"

export function useAdminResource<T>({
  loadResource,
  initialData,
}: {
  loadResource: () => Promise<T>
  initialData: T
}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>()

  const reload = useCallback(async () => {
    setLoading(true)

    try {
      setData(await loadResource())
      setError(undefined)
    } catch (loadError) {
      setError(loadError)
      throw loadError
    } finally {
      setLoading(false)
    }
  }, [loadResource])

  useEffect(() => {
    let active = true

    async function loadInitialData() {
      try {
        const result = await loadResource()
        if (active) {
          setData(result)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadInitialData()
    return () => {
      active = false
    }
  }, [loadResource])

  return {
    data,
    loading,
    error,
    reload,
  }
}

export function useAdminMutation({ reload }: { reload: () => Promise<void> }) {
  const mutationInProgress = useRef(false)
  const [working, setWorking] = useState(false)

  const mutate: AdminMutation = useCallback(
    async (action, successMessage) => {
      if (mutationInProgress.current) return false

      mutationInProgress.current = true
      setWorking(true)
      void successMessage

      return await Promise.resolve()
        .then(action)
        .then(() => reload())
        .then(() => true)
        .finally(() => {
          mutationInProgress.current = false
          setWorking(false)
        })
    },
    [reload],
  )

  return { mutate, working }
}

export function useAdminSession(_initialPath?: string) {
  const [status, setStatus] = useState<AdminSessionStatus>("checking")

  useEffect(() => {
    let active = true

    async function loadSession() {
      try {
        const authenticated = await checkLogin()
        if (!active) return

        setStatus(authenticated ? "authenticated" : "unauthenticated")
      } catch {
        if (active) {
          setStatus("unauthenticated")
        }
      }
    }

    void loadSession()

    return () => {
      active = false
    }
  }, [])

  return {
    status,
    checking: status === "checking",
    authenticated: status === "authenticated",
  }
}
