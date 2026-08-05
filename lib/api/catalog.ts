import { api } from "@/lib/api/client"
import type {
  ApiResponse,
  Campus,
  CatalogData,
  Room,
  SchoolClass,
} from "@/lib/api/types"

export async function getCatalog(): Promise<CatalogData> {
  const [campuses, classes, rooms] = await Promise.all([
    getCampuses(),
    getClasses(),
    getRooms(),
  ])
  return { campuses, classes, rooms }
}

export async function getCampuses() {
  const response = await api.get<ApiResponse<Campus[]>>("/campus/list")
  return response.data.data!
}

export async function getClasses() {
  const response = await api.get<ApiResponse<SchoolClass[]>>("/class/list")
  return response.data.data!
}

export async function getRooms() {
  const response = await api.get<ApiResponse<Room[]>>("/room/list")
  return response.data.data!
}

export const createCampus = (name: string) =>
  api.post("/campus/create", { name })
export const editCampus = (id: number, name: string) =>
  api.post("/campus/edit", { id, name })
export const deleteCampus = (id: number) => api.post("/campus/delete", { id })
export const createClass = (name: string, campus: number) =>
  api.post("/class/create", { name, campus })
export const editClass = (id: number, name: string, campus: number) =>
  api.post("/class/edit", { id, name, campus })
export const deleteClass = (id: number) => api.post("/class/delete", { id })
export const createRoom = (name: string, campus: number) =>
  api.post("/room/create", { name, campus })
export const editRoom = (
  id: number,
  name: string,
  campus: number,
  enabled: boolean
) => api.post("/room/edit", { id, name, campus, enabled })
export const deleteRoom = (id: number) => api.post("/room/delete", { id })
export const createPolicy = (
  room: number,
  days: number[],
  startTime: number[],
  endTime: number[]
) => api.post("/policy/create", { room, days, startTime, endTime })
export const editPolicy = (
  id: number,
  days: number[],
  startTime: number[],
  endTime: number[]
) => api.post("/policy/edit", { id, days, startTime, endTime })
export const togglePolicy = (id: number) => api.post("/policy/toggle", { id })
export const deletePolicy = (id: number) => api.post("/policy/delete", { id })
