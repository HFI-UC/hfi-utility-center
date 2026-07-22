import { describe, expect, it } from "vitest"
import { localizedApiError } from "@/lib/messages"

describe("后端错误中文映射", () => {
  it("映射稳定错误代码", () => expect(localizedApiError(409, undefined, "ROOM_UNAVAILABLE")).toBe("该房间目前不可预约。"))
  it("不向用户显示未知英文异常", () => expect(localizedApiError(500, "Internal Server Error")).toBe("服务器暂时不可用，请稍后重试。"))
  it("兼容旧接口消息", () => expect(localizedApiError(401, "Invalid email or password.")).toBe("邮箱或密码不正确。"))
})
