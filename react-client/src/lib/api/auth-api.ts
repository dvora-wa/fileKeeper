import { BaseApiClient } from "./base-client"
import type { LoginRequest, RegisterRequest, AuthResponse, User } from "../../types/api"

export class AuthApi extends BaseApiClient {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })

    this.setToken(response.token)
    return response
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })

    this.setToken(response.token)
    return response
  }

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" })
    } finally {
      this.clearToken()
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>("/users/me")
  }
}
