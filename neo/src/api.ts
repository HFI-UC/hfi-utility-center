import type {
  ApiEnvelope,
  Availability,
  Campus,
  CreateReservationPayload,
  CreateReservationResponse,
  Room,
  SchoolClass,
} from './types'

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'https://api.hfiuc.org'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options?.headers ?? {}),
    },
  })

  const body = (await response.json()) as ApiEnvelope<T>
  if (!response.ok || !body.success) {
    throw new Error(body.message ?? `请求失败（${response.status}）`)
  }
  return body.data as T
}

export const hfiApi = {
  listCampuses: () => request<Campus[]>('/campus/list'),
  listClasses: () => request<SchoolClass[]>('/class/list'),
  listRooms: () => request<Room[]>('/room/list'),
  availability: (roomId: number, date: string) =>
    request<Availability>(`/reservation/availability?roomId=${roomId}&date=${date}`),
  createReservation: async (payload: CreateReservationPayload) => {
    const csrf = await request<string>('/_csrf')
    return request<CreateReservationResponse>('/reservation/create', {
      method: 'POST',
      headers: { 'x-csrf-token': csrf },
      body: JSON.stringify(payload),
    })
  },
}
