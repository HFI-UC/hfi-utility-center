import { apiRequest, jsonBody } from "@/lib/api/client"

export type AIApprovalStrength = "relaxed" | "standard" | "strict"

export async function getAIApprovalSetting() {
  const response = await apiRequest<{ strength: AIApprovalStrength }>("/api/v1/admin/settings/ai-approval")
  return response.data?.strength ?? "strict"
}

export async function updateAIApprovalSetting(strength: AIApprovalStrength) {
  const response = await apiRequest<{ strength: AIApprovalStrength }>("/api/v1/admin/settings/ai-approval", { method: "PUT", ...jsonBody({ strength }) })
  return response.data?.strength ?? strength
}
