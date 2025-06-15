// 🔧 API Client with error handling - Adapted for Vite
import type { LoginRequest, RegisterRequest, AuthResponse, User, ApiError } from "../types/api"

// ✅ Updated to use the correct environment variable and add /api suffix
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    // Load token from localStorage on client side
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      console.log(`🌐 API Request: ${url}`) // Debug log

      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      // Handle empty responses (like 204 No Content)
      if (response.status === 204) {
        return {} as T
      }

      return response.json()
    } catch (error) {
      console.error(`❌ API Error for ${url}:`, error) // Debug log
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Network error occurred")
    }
  }

  // 🔐 Authentication Methods
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })

    this.setToken(response.token)
    return response
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/register", {
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

export const apiClient = new ApiClient(API_BASE_URL)

// Debug log to see what URL is being used
console.log(`🔗 API Base URL: ${API_BASE_URL}`)
