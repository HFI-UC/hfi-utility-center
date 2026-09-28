import { api } from "@/lib/api/client"
import type { ApiResponse } from "@/lib/api/types"

export interface DirectoryProfile {
  email: string
  studentName: string
  studentId: string | null
  classId: number | null
  className: string | null
  privileged: boolean
}

interface DirectoryPayload {
  email?: string | null
  studentName?: string | null
  name?: string | null
  studentId?: string | null
  classId?: number | null
  className?: string | null
  privileged?: boolean | null
  isPrivileged?: boolean | null
}

export async function lookupDirectoryProfile(email: string): Promise<DirectoryProfile | null> {
  const { data } = await api.get<ApiResponse<DirectoryPayload>>("/directory/lookup", {
    params: { email },
    suppressErrorToast: true,
  })
  if (!data.success || !data.data) {
    if (data.message === "Not found.") return null
    throw new Error(data.message || "Directory lookup failed.")
  }
  const profile = data.data
  return {
    email: profile.email?.trim() || email,
    studentName: (profile.studentName || profile.name || "").trim(),
    studentId: profile.studentId?.trim() || null,
    classId: profile.classId ?? null,
    className: profile.className?.trim() || null,
    privileged: Boolean(profile.privileged ?? profile.isPrivileged),
  }
}
