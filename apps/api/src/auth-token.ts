import { randomBytes } from "node:crypto"

import { SignJWT, jwtVerify } from "jose"

const jwtAlgorithm = "HS256"
const issuer = "proyecto-daw-v2-api"
const audience = "proyecto-daw-v2-web"
const expiresIn = "7d"

export const authCookieName = "access_token"
export const refreshTokenCookieName = "refresh_token"

export type AuthTokenPayload = {
  userId: string
  roleId: number
}

export async function createAuthToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({ roleId: payload.roleId })
    .setProtectedHeader({ alg: jwtAlgorithm })
    .setSubject(payload.userId)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret())
}

export function createRefreshToken(): string {
  return randomBytes(48).toString("base64url")
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    issuer,
    audience,
  })

  if (!payload.sub || typeof payload.roleId !== "number") {
    throw new Error("Invalid auth token payload")
  }

  return {
    userId: payload.sub,
    roleId: payload.roleId,
  }
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  }
}

export function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  }
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters")
  }

  return new TextEncoder().encode(secret)
}
