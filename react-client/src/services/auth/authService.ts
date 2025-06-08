import { tokenService } from './tokenService'
// import { authApi } from '../services/api'
import type { User } from '../../types'

export class AuthService {
  private tokenRefreshInterval: NodeJS.Timeout | null = null

  async initializeAuth(): Promise<User | null> {
    const token = tokenService.getToken()
    
    if (!token || !tokenService.isTokenValid()) {
      tokenService.clearTokens()
      return null
    }

    try {
      // Try to get current user to validate token
      const { usersApi } = await import('../../services/api')
      const user = await usersApi.getCurrentUser()
      
      // Start token refresh interval
      this.startTokenRefreshInterval()
      
      return user
    } catch (error) {
      tokenService.clearTokens()
      return null
    }
  }

  startTokenRefreshInterval(): void {
    // Clear existing interval
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval)
    }

    // Check every 5 minutes if token needs refresh
    this.tokenRefreshInterval = setInterval(() => {
      if (tokenService.isTokenExpiring()) {
        tokenService.refreshToken().catch(() => {
          // If refresh fails, the token service will clear tokens
          // and the user will be redirected to login
        })
      }
    }, 5 * 60 * 1000) // 5 minutes
  }

  stopTokenRefreshInterval(): void {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval)
      this.tokenRefreshInterval = null
    }
  }

  logout(): void {
    this.stopTokenRefreshInterval()
    tokenService.clearTokens()
  }

  isAuthenticated(): boolean {
    return tokenService.isTokenValid()
  }

  getCurrentUserId(): string | null {
    return tokenService.getUserId()
  }

  getUserRole(): string | null {
    return tokenService.getUserRole()
  }

  isAdmin(): boolean {
    return tokenService.getUserRole() === 'Admin'
  }
}

export const authService = new AuthService()