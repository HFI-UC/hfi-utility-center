import { useCallback, useRef, useState } from "react"

export type AdminMutation = (
  key: string,
  action: () => Promise<unknown>,
  successMessage?: string
) => Promise<boolean>

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

  const runMutation: AdminMutation = useCallback(
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
        reportError(error instanceof Error ? error.message : fallbackError)
        return false
      } finally {
        mutationInProgress.current = false
        setWorkingKey(undefined)
      }
    },
    [fallbackError, reload, reportError]
  )

  return { runMutation, workingKey, notice }
}
