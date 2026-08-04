import { apiClient } from "@/lib/api/client"
import type { BootstrapData, Campus, Room, SchoolClass } from "@/lib/api/types"

export async function getBootstrap() {
  const [campuses, classes, rooms] = await Promise.all([
    getCampuses(),
    getClasses(),
    getRooms(),
  ])
  return {
    schemaVersion: 1,
    dataVersion: new Date().toISOString(),
    generatedAt: new Date().toISOString(),
    campuses,
    classes,
    rooms,
  } satisfies BootstrapData
}

export const getCampuses = () => apiClient.get<Campus[]>("/campus/list")
export const getClasses = () => apiClient.get<SchoolClass[]>("/class/list")
export const getRooms = () => apiClient.get<Room[]>("/room/list")

export const createCampus = (name: string) =>
  apiClient.post("/campus/create", { name })
export const editCampus = (id: number, name: string) =>
  apiClient.post("/campus/edit", { id, name })
export const deleteCampus = (id: number) =>
  apiClient.post("/campus/delete", { id })
export const createClass = (name: string, campus: number) =>
  apiClient.post("/class/create", { name, campus })
export const editClass = (id: number, name: string, campus: number) =>
  apiClient.post("/class/edit", { id, name, campus })
export const deleteClass = (id: number) =>
  apiClient.post("/class/delete", { id })
export const createRoom = (name: string, campus: number) =>
  apiClient.post("/room/create", { name, campus })
export const editRoom = (
  id: number,
  name: string,
  campus: number,
  enabled: boolean
) => apiClient.post("/room/edit", { id, name, campus, enabled })
export const deleteRoom = (id: number) => apiClient.post("/room/delete", { id })
export const createPolicy = (
  room: number,
  days: number[],
  startTime: number[],
  endTime: number[]
) => apiClient.post("/policy/create", { room, days, startTime, endTime })
export const editPolicy = (
  id: number,
  days: number[],
  startTime: number[],
  endTime: number[]
) => apiClient.post("/policy/edit", { id, days, startTime, endTime })
export const togglePolicy = (id: number) =>
  apiClient.post("/policy/toggle", { id })
export const deletePolicy = (id: number) =>
  apiClient.post("/policy/delete", { id })
