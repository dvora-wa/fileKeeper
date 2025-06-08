// import { jwtDecode } from 'jwt-decode'

// interface TokenPayload {
//   userId: string
//   email: string
//   fullName: string
//   role: string
//   exp: number
//   iat: number
// }

// export class TokenService {
//   private readonly TOKEN_KEY = 'filekeeper_token'
//   private readonly REFRESH_TOKEN_KEY = 'filekeeper_refresh_token'

//   setToken(token: string): void {
//     localStorage.setItem(this.TOKEN_KEY, token)
//   }

//   getToken(): string | null {
//     return localStorage.getItem(this.TOKEN_KEY)
//   }

//   setRefreshToken(refreshToken: string): void {
//     localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
//   }

//   getRefreshToken(): string | null {
//     return localStorage.getItem(this.REFRESH_TOKEN_KEY)
//   }

//   clearTokens(): void {
//     localStorage.removeItem(this.TOKEN_KEY)
//     localStorage.removeItem(this.REFRESH_TOKEN_KEY)
//   }

//   isTokenValid(): boolean {
//     const token = this.getToken()
//     if (!token) return false

//     try {
//       const decoded = jwtDecode<TokenPayload>(token)
//       const currentTime = Date.now() / 1000
      
//       // Check if token expires in next 5 minutes
//       return decoded.exp > currentTime + 300
//     } catch {
//       return false
//     }
//   }

//   getTokenPayload(): TokenPayload | null {
//     const token = this.getToken()
//     if (!token) return null

//     try {
//       return jwtDecode<TokenPayload>(token)
//     } catch {
//       return null
//     }
//   }

//   getUserId(): string | null {
//     const payload = this.getTokenPayload()
//     return payload?.userId || null
//   }

//   getUserRole(): string | null {
//     const payload = this.getTokenPayload()
//     return payload?.role || null
//   }

//   isTokenExpiring(): boolean {
//     const token = this.getToken()
//     if (!token) return true

//     try {
//       const decoded = jwtDecode<TokenPayload>(token)
//       const currentTime = Date.now() / 1000
      
//       // Check if token expires in next 10 minutes
//       return decoded.exp < currentTime + 600
//     } catch {
//       return true
//     }
//   }

//   async refreshToken(): Promise<void> {
//     const { authApi } = await import('../../services/api')
    
//     try {
//       const response = await authApi.refreshToken()
//       this.setToken(response.token)
      
//       if (response.refreshToken) {
//         this.setRefreshToken(response.refreshToken)
//       }
//     } catch (error) {
//       this.clearTokens()
//       throw error
//     }
//   }
// }

// export const tokenService = new TokenService()
import { jwtDecode } from 'jwt-decode'

interface JWTPayload {
  sub: string
  email: string
  role: string
  exp: number
  iat: number
}

/**
 * שירות ניהול טוקנים
 * מטפל בשמירה, בדיקה וניקוי של JWT tokens
 */
class TokenService {
  private readonly TOKEN_KEY = 'filekeeper_token'
  private readonly REFRESH_TOKEN_KEY = 'filekeeper_refresh_token'

  /**
   * שמירת access token
   */
  setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token)
    } catch (error) {
      console.error('Failed to save token:', error)
    }
  }

  /**
   * קבלת access token
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY)
    } catch (error) {
      console.error('Failed to get token:', error)
      return null
    }
  }

  /**
   * שמירת refresh token
   */
  setRefreshToken(refreshToken: string): void {
    try {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
    } catch (error) {
      console.error('Failed to save refresh token:', error)
    }
  }

  /**
   * קבלת refresh token
   */
  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error('Failed to get refresh token:', error)
      return null
    }
  }

  /**
   * ניקוי כל הטוקנים
   */
  clearTokens(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    } catch (error) {
      console.error('Failed to clear tokens:', error)
    }
  }

  /**
   * בדיקה האם הטוקן קיים
   */
  hasToken(): boolean {
    return !!this.getToken()
  }

  /**
   * פיענוח הטוקן וקבלת הנתונים
   */
  decodeToken(): JWTPayload | null {
    const token = this.getToken()
    if (!token) return null

    try {
      return jwtDecode<JWTPayload>(token)
    } catch (error) {
      console.error('Failed to decode token:', error)
      return null
    }
  }

  /**
   * בדיקה האם הטוקן תקף (לא פג)
   */
  isTokenValid(): boolean {
    const decoded = this.decodeToken()
    if (!decoded) return false

    // בדיקה שהטוקן לא פג (עם מרווח של 5 דקות)
    const currentTime = Date.now() / 1000
    const bufferTime = 5 * 60 // 5 דקות
    
    return decoded.exp > (currentTime + bufferTime)
  }

  /**
   * קבלת זמן פקיעת הטוקן
   */
  getTokenExpiration(): Date | null {
    const decoded = this.decodeToken()
    if (!decoded) return null

    return new Date(decoded.exp * 1000)
  }

  /**
   * בדיקה כמה זמן נותר עד פקיעת הטוקן (בדקות)
   */
  getTimeUntilExpiration(): number | null {
    const expiration = this.getTokenExpiration()
    if (!expiration) return null

    const now = new Date()
    const diffMs = expiration.getTime() - now.getTime()
    
    return Math.floor(diffMs / (1000 * 60)) // המרה לדקות
  }

  /**
   * קבלת מידע המשתמש מהטוקן
   */
  getUserFromToken(): Partial<{ id: string; email: string; role: string }> | null {
    const decoded = this.decodeToken()
    if (!decoded) return null

    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    }
  }

  /**
   * יצירת Authorization header עבור API calls
   */
  getAuthHeader(): Record<string, string> {
    const token = this.getToken()
    
    if (!token) {
      return {}
    }

    return {
      Authorization: `Bearer ${token}`,
    }
  }

  /**
   * בדיקה האם הטוקן יפוג בקרוב (בתוך 10 דקות)
   */
  shouldRefreshToken(): boolean {
    const timeLeft = this.getTimeUntilExpiration()
    return timeLeft !== null && timeLeft <= 10
  }

  /**
   * עיבוד שגיאות הקשורות לטוקן
   */
  handleTokenError(error: any): boolean {
    // בדיקה אם השגיאה קשורה לטוקן פג או לא תקף
    if (
      error?.response?.status === 401 || 
      error?.response?.data?.message?.includes('token') ||
      error?.message?.includes('Unauthorized')
    ) {
      this.clearTokens()
      return true // מציין שהטוקן נוקה
    }
    
    return false
  }

  /**
   * פונקציה לדיבוג - הצגת מידע על הטוקן
   */
  debugToken(): void {
    const token = this.getToken()
    const decoded = this.decodeToken()
    const timeLeft = this.getTimeUntilExpiration()

    console.group('🔐 Token Debug Info')
    console.log('Has Token:', !!token)
    console.log('Is Valid:', this.isTokenValid())
    console.log('Time Until Expiration:', timeLeft, 'minutes')
    console.log('Should Refresh:', this.shouldRefreshToken())
    console.log('Decoded Payload:', decoded)
    console.groupEnd()
  }
}

// יצירת instance יחיד
export const tokenService = new TokenService()

// Export הקלאס למקרה הצורך
export { TokenService }