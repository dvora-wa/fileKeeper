import { baseApi } from './baseApi'
import type { LoginDto, RegisterDto, AuthResponse } from '../../types'

export class AuthApi {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    return baseApi.post<AuthResponse>('/auth/login', credentials)
  }

  async register(data: RegisterDto): Promise<AuthResponse> {
    return baseApi.post<AuthResponse>('/auth/register', data)
  }

  async refreshToken(): Promise<AuthResponse> {
    return baseApi.post<AuthResponse>('/auth/refresh')
  }

  async logout(): Promise<void> {
    return baseApi.post<void>('/auth/logout')
  }
}

export const authApi = new AuthApi()
