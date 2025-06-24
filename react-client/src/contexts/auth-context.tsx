"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authApi } from "../lib/api"
import type { User, LoginRequest, RegisterRequest } from "../types/api"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (userData: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await authApi.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.log("No authenticated user")
      authApi.clearToken()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials)
    setUser(response.user)
  }

  const register = async (userData: RegisterRequest) => {
    const response = await authApi.register(userData)
    setUser(response.user)
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
