"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

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
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)

    try {
      setData(await loadResource())
    } finally {
      setLoading(false)
    }
  }, [loadResource])

  useEffect(() => {
    async function loadInitialData() {
      try {
        setData(await loadResource())
      } finally {
        setLoading(false)
      }
    }

    loadInitialData()
  }, [loadResource])

  return {
    data,
    loading,
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

      try {
        await action()
        if (successMessage) toast.success(successMessage)
        await reload()
        return true
      } finally {
        mutationInProgress.current = false
        setWorking(false)
      }
    },
    [reload]
  )

  return { mutate, working }
}

export function useAdminSession(initialPath: string) {
  const router = useRouter()
  const [status, setStatus] = useState<AdminSessionStatus>("checking")

  useEffect(() => {
    let active = true

    async function loadSession() {
      const authenticated = await checkLogin()
      if (!active) return

      if (authenticated) {
        setStatus("authenticated")
        return
      }

      setStatus("unauthenticated")
      const redirectTo = `${initialPath}${window.location.search}`
      router.replace(`/admin/login?redirect=${encodeURIComponent(redirectTo)}`)
    }

    loadSession()

    return () => {
      active = false
    }
  }, [initialPath, router])

  return {
    checking: status === "checking",
    authenticated: status === "authenticated",
  }
}
