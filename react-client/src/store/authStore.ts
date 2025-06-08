// import { create } from 'zustand'
// import type { User } from '../types'
// // import { User } from '@/types'

// interface AuthState {
//   user: User | null
//   isAuthenticated: boolean
//   isLoading: boolean
//   setUser: (user: User | null) => void
//   setLoading: (loading: boolean) => void
//   logout: () => void
// }

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   isAuthenticated: false,
//   isLoading: false,

//   setUser: (user: User | null) => {
//     set({ 
//       user, 
//       isAuthenticated: !!user 
//     })
//   },

//   setLoading: (isLoading: boolean) => {
//     set({ isLoading })
//   },

//   logout: () => {
//     set({ 
//       user: null, 
//       isAuthenticated: false,
//       isLoading: false 
//     })
//   }
// }))

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginDto, RegisterDto } from '../types'
import { authApi } from '../services/api'
import { tokenService } from '../services'
import { toast } from 'react-hot-toast'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  login: (credentials: LoginDto) => Promise<void>
  register: (data: RegisterDto) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false
        })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      login: async (credentials: LoginDto) => {
        try {
          set({ isLoading: true })
          
          const response = await authApi.login(credentials)
          
          // שמירת הטוקן
          tokenService.setToken(response.token)
          if (response.refreshToken) {
            tokenService.setRefreshToken(response.refreshToken)
          }
          
          // עדכון state
          set({ 
            user: response.user, 
            isAuthenticated: true,
            isLoading: false
          })
          
          toast.success(`ברוך הבא, ${response.user.firstName}!`)
          
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.error || 'שגיאה בהתחברות'
          toast.error(message)
          throw error
        }
      },

      register: async (data: RegisterDto) => {
        try {
          set({ isLoading: true })
          
          const response = await authApi.register(data)
          
          // שמירת הטוקן
          tokenService.setToken(response.token)
          if (response.refreshToken) {
            tokenService.setRefreshToken(response.refreshToken)
          }
          
          // עדכון state
          set({ 
            user: response.user, 
            isAuthenticated: true,
            isLoading: false
          })
          
          toast.success('נרשמת בהצלחה!')
          
        } catch (error: any) {
          set({ isLoading: false })
          const message = error.response?.data?.error || 'שגיאה ברישום'
          toast.error(message)
          throw error
        }
      },

      logout: () => {
        // ניקוי טוקנים
        tokenService.clearTokens()
        
        // איפוס state
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        })
        
        toast.success('התנתקת בהצלחה')
        
        // הפניה לדף התחברות
        window.location.href = '/auth/login'
      },

      refreshToken: async () => {
        try {
          const response = await authApi.refreshToken()
          tokenService.setToken(response.token)
          
          if (response.refreshToken) {
            tokenService.setRefreshToken(response.refreshToken)
          }
          
        } catch (error) {
          // אם הרענון נכשל, מתנתק
          get().logout()
          throw error
        }
      },

      initializeAuth: async () => {
        try {
          set({ isLoading: true })
          
          const token = tokenService.getToken()
          
          if (!token || !tokenService.isTokenValid()) {
            set({ isLoading: false })
            return
          }

          // קבלת פרטי משתמש מהשרת
          const { usersApi } = await import('../services/api')
          const user = await usersApi.getCurrentUser()
          
          set({ 
            user, 
            isAuthenticated: true,
            isLoading: false
          })
          
        } catch (error) {
          // אם יש שגיאה, מנקה הכל
          tokenService.clearTokens()
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)