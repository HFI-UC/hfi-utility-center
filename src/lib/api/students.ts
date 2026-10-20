import { api } from "@/lib/api/client"
import type { ApiResponse } from "@/lib/api/types"

export interface StudentRecord {
  email: string
  name: string
  classId: number | null
  className: string | null
}

export interface StudentInput {
  email: string
  name: string
  classId: number | null
}

export async function getStudents() {
  const response = await api.get<ApiResponse<StudentRecord[]>>("/student/list")
  return response.data.data!
}

export const createStudent = (student: StudentInput) => api.post("/student/create", student)

export const editStudent = (student: StudentInput) => api.post("/student/edit", student)

export const deleteStudent = (email: string) => api.post("/student/delete", { email })
