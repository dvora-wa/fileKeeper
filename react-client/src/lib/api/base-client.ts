import type { ApiError } from "../../types/api"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

console.log("🔗 API Base URL:", API_BASE_URL)

export class BaseApiClient {
  protected baseUrl: string
  protected token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
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

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    console.log("🌐 API Request:", url)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      console.log("📤 Request Data:", options.body)

      const response = await fetch(url, {
        ...options,
        headers,
      })

      console.log("📥 Response Status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("❌ Error Response:", errorText)

        let errorData: ApiError
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
        }

        interface ApiClientError extends Error {
          details?: unknown
          status?: number
        }
        const error: ApiClientError = new Error(errorData.error || `HTTP ${response.status}`)
        error.details = errorData.details
        error.status = response.status
        throw error
      }

      if (response.status === 204) {
        return {} as T
      }

      const responseData = await response.json()
      console.log("✅ Success Response:", responseData)
      return responseData
    } catch (error) {
      console.log("❌ API Error for", url + ":", error)
      throw error
    }
  }

  // Special request for file uploads (without Content-Type header)
  protected async requestFile<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData: ApiError
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
      }
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    return response.json()
  }
}
