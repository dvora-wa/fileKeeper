import type { User } from '../../types'
import { baseApi } from './baseApi'
// import { User } from '@/types'

export interface UpdateUserDto {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export class UsersApi {
  async getCurrentUser(): Promise<User> {
    return baseApi.get<User>('/users/me')
  }

  async getUser(id: string): Promise<User> {
    return baseApi.get<User>(`/users/${id}`)
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<void> {
    return baseApi.put<void>(`/users/${id}`, data)
  }

  async deleteUser(id: string): Promise<void> {
    return baseApi.delete<void>(`/users/${id}`)
  }
}

export const usersApi = new UsersApi()