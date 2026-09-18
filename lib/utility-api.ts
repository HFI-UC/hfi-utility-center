export type DirectoryItem = {
  id: number
  name: string
  campus?: number
  enabled?: boolean
}
export type Reservation = {
  id: number
  roomName: string
  studentName: string
  startTime: string
  endTime: string
  status: string
  reason: string
}

export async function utilityApi<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`/api/utility/${path}`, {
    cache: "no-store",
    ...init,
  })
  const body = await response.json()
  if (!response.ok || !body.success)
    throw new Error(
      body.message || "The request could not be completed. Please try again."
    )
  return body.data as T
}
