import { describe, expect, it, vi } from "vitest"

import { SessionService } from "./session.service.js"

describe("SessionService", () => {
  it("returns null when either token is missing", async () => {
    const service = new SessionService({ verify: vi.fn() })

    await expect(service.getSession({ token: "access-token" })).resolves.toBeNull()
    await expect(service.getSession({ refreshToken: "refresh-token" })).resolves.toBeNull()
  })

  it("returns session tokens when the access token is valid", async () => {
    const service = new SessionService({ verify: vi.fn().mockResolvedValue({ userId: "user-1" }) })

    await expect(
      service.getSession({ token: "access-token", refreshToken: "refresh-token" }),
    ).resolves.toEqual({
      token: "access-token",
      refresh_token: "refresh-token",
    })
  })

  it("returns null when token verification fails", async () => {
    const service = new SessionService({ verify: vi.fn().mockRejectedValue(new Error("invalid")) })

    await expect(
      service.getSession({ token: "access-token", refreshToken: "refresh-token" }),
    ).resolves.toBeNull()
  })
})
