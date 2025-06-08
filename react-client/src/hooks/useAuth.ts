// // src/hooks/useAuth.ts
// import { useEffect } from 'react'
// import { useAuthStore } from '../store'
// import { authService } from '../services'

// export const useAuth = () => {
//   const store = useAuthStore()

//   useEffect(() => {
//     const initAuth = async () => {
//       try {
//         const user = await authService.initializeAuth()
//         if (user) {
//           store.setUser(user)
//         }
//       } catch (error) {
//         console.error('Auth initialization failed:', error)
//       }
//     }

//     initAuth()

//     return () => {
//       authService.stopTokenRefreshInterval()
//     }
//   }, [])

//   return {
//     ...store,
//     isAdmin: store.user?.role === 'Admin',
//     isUser: store.user?.role === 'User'
//   }
// }
//---------------------------------------------------------------------------------------------

// // src/hooks/useAuth.ts
// import { useEffect, useState } from 'react'
// import { useAuthStore } from '../store'
// import { authService } from '../services'

// export const useAuth = () => {
//   const store = useAuthStore()
//   const [isLoading, setIsLoading] = useState(true) // מנהל loading מקומי

//   useEffect(() => {
//     const initAuth = async () => {
//       try {
//         console.log('useAuth - Starting auth initialization')
//         setIsLoading(true)
        
//         const user = await authService.initializeAuth()
//         console.log('useAuth - Auth service returned:', user)
        
//         if (user) {
//           store.setUser(user)
//           console.log('useAuth - User set in store')
//         }
//       } catch (error) {
//         console.error('Auth initialization failed:', error)
//       } finally {
//         console.log('useAuth - Setting loading to false')
//         setIsLoading(false)
//       }
//     }

//     initAuth()

//     return () => {
//       authService.stopTokenRefreshInterval()
//     }
//   }, [])

//   const result = {
//     ...store,
//     isLoading, // משתמש ב-loading המקומי במקום של ה-store
//     isAdmin: store.user?.role === 'Admin',
//     isUser: store.user?.role === 'User'
//   }

//   console.log('useAuth - Returning:', { isLoading, isAuthenticated: result.isAuthenticated })
//   return result
// }

//------------------------------------------------------------------------
// src/hooks/useAuth.ts - טסט זמני
import { useEffect, useState } from 'react'
import { useAuthStore } from '../store'
import { authService } from '../services'

export const useAuth = () => {
  const store = useAuthStore()
  const [localLoading, setLocalLoading] = useState(true)

  useEffect(() => {
    // פשוט חכה שנייה ואז סיים
    const timer = setTimeout(() => {
      console.log('useAuth - Timer finished, setting loading to false')
      setLocalLoading(false)
      store.setLoading(false) // גם מעדכן את ה-store
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // החזר את ה-loading המקומי במקום של ה-store
  const result = {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: localLoading, // השתמש ב-loading המקומי
    isAdmin: false,
    isUser: false,
    setUser: store.setUser,
    setLoading: store.setLoading,
    login: store.login,
    register: store.register,
    logout: store.logout
  }

  console.log('useAuth - Returning (SIMPLE TEST):', { 
    localLoading, 
    storeLoading: store.isLoading,
    finalLoading: result.isLoading,
    isAuthenticated: result.isAuthenticated 
  })
  return result
}