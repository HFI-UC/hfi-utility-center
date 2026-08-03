import { afterEach, describe, expect, it, vi } from "vitest"

import { api, apiRequest, ApiError, requireData } from "@/lib/api/client"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("apiRequest", () => {
  it("returns successful API responses", async () => {
    vi.spyOn(api, "request").mockResolvedValue({
      status: 200,
      data: { success: true, data: { id: 7 } },
    })

    await expect(apiRequest<{ id: number }>("/example")).resolves.toEqual({
      success: true,
      data: { id: 7 },
    })
  })

  it("preserves status and code for business errors", async () => {
    vi.spyOn(api, "request").mockResolvedValue({
      status: 409,
      data: { success: false, code: "ROOM_UNAVAILABLE" },
    })

    const error = await apiRequest("/example").catch((reason) => reason)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 409, code: "ROOM_UNAVAILABLE" })
  })

  it("normalizes transport failures", async () => {
    vi.spyOn(api, "request").mockRejectedValue(new Error("offline"))

    const error = await apiRequest("/example").catch((reason) => reason)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 0 })
  })

  it("treats malformed successful responses as API errors", async () => {
    vi.spyOn(api, "request").mockResolvedValue({ status: 200, data: undefined })

    await expect(apiRequest("/example")).rejects.toBeInstanceOf(ApiError)
  })
})

describe("requireData", () => {
  it("returns defined data and rejects missing data", () => {
    expect(requireData({ success: true, data: 0 }, "missing")).toBe(0)
    expect(() => requireData({ success: true }, "missing")).toThrow("missing")
  })
})
