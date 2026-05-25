import { type LoginUserResponse, type RegisterUserResponse } from "@proyecto-daw/shared"

import { AppError } from "../../http/app-error.js"
import { createAuthToken, createRefreshToken } from "../../auth-token.js"
import { hashPassword, verifyPassword } from "../../password.js"
import { toLoginUserResponse, toRegisterUserResponse, type UserRecord } from "./users.mapper.js"

export type CreateUserData = {
  name: string
  email: string
  passwordHash: string
}

export type UserWithPasswordRecord = UserRecord & {
  passwordHash: string
}

export type UsersRepository = {
  create(data: CreateUserData): Promise<UserRecord>
  findByEmail(email: string): Promise<UserWithPasswordRecord | null>
  findById(id: string): Promise<UserRecord | null>
}

export type PasswordService = {
  hash(password: string): Promise<string>
  verify(password: string, passwordHash: string): Promise<boolean>
}

export type TokenService = {
  createAccessToken(payload: { userId: string; roleId: number }): Promise<string>
  createRefreshToken(): string
}

const defaultPasswordService: PasswordService = {
  hash: hashPassword,
  verify: verifyPassword,
}

const defaultTokenService: TokenService = {
  createAccessToken: createAuthToken,
  createRefreshToken,
}

export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService = defaultPasswordService,
    private readonly tokenService: TokenService = defaultTokenService,
  ) {}

  async register(input: { name: string; email: string; password: string }): Promise<RegisterUserResponse> {
    const passwordHash = await this.passwordService.hash(input.password)
    const user = await this.usersRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    })

    return toRegisterUserResponse(user)
  }

  async login(input: { email: string; password: string }): Promise<LoginUserResponse> {
    const user = await this.usersRepository.findByEmail(input.email)

    if (!user || !(await this.passwordService.verify(input.password, user.passwordHash))) {
      throw new AppError("INVALID_CREDENTIALS")
    }

    const token = await this.tokenService.createAccessToken({ userId: user.id, roleId: user.roleId })
    const refreshToken = this.tokenService.createRefreshToken()

    return toLoginUserResponse(user, token, refreshToken)
  }
}
