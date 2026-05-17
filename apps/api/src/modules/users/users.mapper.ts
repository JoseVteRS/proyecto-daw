import { type LoginUserResponse, type RegisterUserResponse } from "@proyecto-daw/shared"

export type UserRecord = {
  id: string
  roleId: number
  name: string
  email: string
  createdAt: Date
}

export function toRegisterUserResponse(user: UserRecord): RegisterUserResponse {
  return { user: toUserDto(user) }
}

export function toLoginUserResponse(
  user: UserRecord,
  token: string,
  refreshToken: string,
): LoginUserResponse {
  return {
    user: toUserDto(user),
    token,
    refresh_token: refreshToken,
  }
}

function toUserDto(user: UserRecord) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    createdAt: user.createdAt.toISOString(),
  }
}
