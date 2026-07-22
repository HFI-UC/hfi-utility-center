import { apiRequest, jsonBody } from "@/lib/api/client"
import type { BootstrapData, Campus, Room, SchoolClass } from "@/lib/api/types"

export async function getBootstrap() {
  const response = await apiRequest<BootstrapData>("/api/v1/bootstrap")
  if (!response.data) throw new Error("Bootstrap data is missing")
  return response.data
}

export async function getCampuses() {
  const response = await apiRequest<Campus[]>("/campus/list")
  return response.data ?? []
}
export async function getClasses() {
  const response = await apiRequest<SchoolClass[]>("/class/list")
  return response.data ?? []
}
export async function getRooms() {
  const response = await apiRequest<Room[]>("/room/list")
  return response.data ?? []
}

export const createCampus = (name: string) =>
  apiRequest("/campus/create", { method: "POST", ...jsonBody({ name }) })
export const editCampus = (id: number, name: string) =>
  apiRequest("/campus/edit", { method: "POST", ...jsonBody({ id, name }) })
export const deleteCampus = (id: number) =>
  apiRequest("/campus/delete", { method: "POST", ...jsonBody({ id }) })
export const createClass = (name: string, campus: number) =>
  apiRequest("/class/create", { method: "POST", ...jsonBody({ name, campus }) })
export const editClass = (id: number, name: string, campus: number) =>
  apiRequest("/class/edit", { method: "POST", ...jsonBody({ id, name, campus }) })
export const deleteClass = (id: number) =>
  apiRequest("/class/delete", { method: "POST", ...jsonBody({ id }) })
export const createRoom = (name: string, campus: number) =>
  apiRequest("/room/create", { method: "POST", ...jsonBody({ name, campus }) })
export const editRoom = (id: number, name: string, campus: number, enabled: boolean) =>
  apiRequest("/room/edit", { method: "POST", ...jsonBody({ id, name, campus, enabled }) })
export const deleteRoom = (id: number) =>
  apiRequest("/room/delete", { method: "POST", ...jsonBody({ id }) })
export const createPolicy = (room: number, days: number[], startTime: number[], endTime: number[]) =>
  apiRequest("/policy/create", { method: "POST", ...jsonBody({ room, days, startTime, endTime }) })
export const editPolicy = (id: number, days: number[], startTime: number[], endTime: number[]) =>
  apiRequest("/policy/edit", { method: "POST", ...jsonBody({ id, days, startTime, endTime }) })
export const togglePolicy = (id: number) =>
  apiRequest("/policy/toggle", { method: "POST", ...jsonBody({ id }) })
export const deletePolicy = (id: number) =>
  apiRequest("/policy/delete", { method: "POST", ...jsonBody({ id }) })
