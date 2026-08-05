"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

import { checkLogin } from "@/lib/api/auth"

export type AdminMutation = (
  action: () => Promise<unknown>,
  successMessage?: string
) => Promise<boolean>

type AdminSessionStatus = "checking" | "authenticated" | "unauthenticated"

export function useAdminResource<T>({
  loadResource,
  initialData,
}: {
  loadResource: () => Promise<T>
  initialData: T
}) {
  const requestId = useRef(0)
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const currentRequest = ++requestId.current
    setLoading(true)

    const nextData = await loadResource()
    if (requestId.current !== currentRequest) return
    setData(nextData)
    setLoading(false)
  }, [loadResource])

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
    reload,
  }
}

export function useAdminMutation({ reload }: { reload: () => Promise<void> }) {
  const mutationInProgress = useRef(false)
  const [working, setWorking] = useState(false)
  const [notice, setNotice] = useState<string>()

  const mutate: AdminMutation = useCallback(
    async (action, successMessage) => {
      if (mutationInProgress.current) return false

      mutationInProgress.current = true
      setWorking(true)
      setNotice(undefined)

      await action()
      setNotice(successMessage)
      await reload()
      mutationInProgress.current = false
      setWorking(false)
      return true
    },
    [reload]
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
