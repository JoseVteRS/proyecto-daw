import { type SessionResponse } from "@proyecto-daw/shared"

import { verifyAuthToken } from "../../auth-token.js"

export type AuthVerifier = {
  verify(token: string): Promise<unknown>
}

const defaultAuthVerifier: AuthVerifier = {
  verify: verifyAuthToken,
}

export class SessionService {
  constructor(private readonly authVerifier: AuthVerifier = defaultAuthVerifier) {}

  async getSession(input: { token?: string; refreshToken?: string }): Promise<SessionResponse | null> {
    if (!input.token || !input.refreshToken) {
      return null
    }

    try {
      await this.authVerifier.verify(input.token)

      return {
        token: input.token,
        refresh_token: input.refreshToken,
      }
    } catch {
      return null
    }
  }
}
