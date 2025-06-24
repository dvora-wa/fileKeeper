import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ApiError,
  Folder,
  CreateFolderRequest,
} from "../types/api"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
console.log("🔗 API Base URL:", API_BASE_URL)

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
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

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    console.log("🌐 API Request:", url)
    if (options.body) {
      console.log("📤 Request Data:", options.body)
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
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

        const error = new Error(errorData.error || `HTTP ${response.status}`)
        ;(error as any).details = errorData.details
        ;(error as any).status = response.status
        throw error
      }

      if (response.status === 204) {
        return {} as T
      }

      const responseData = await response.json()
      console.log("✅ Success Response:", responseData)
      return responseData
    } catch (error) {
      console.error(`❌ API Error for ${url}:`, error)
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

  // 🗂️ Folder Management
  async getFolders(parentFolderId?: string): Promise<Folder[]> {
    const params = parentFolderId ? `?parentFolderId=${parentFolderId}` : ""
    return this.request<Folder[]>(`/folders${params}`)
  }

  async createFolder(data: CreateFolderRequest): Promise<Folder> {
    return this.request<Folder>("/folders", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async deleteFolder(folderId: string): Promise<void> {
    return this.request(`/folders/${folderId}`, {
      method: "DELETE",
    })
  }

  async updateFolder(folderId: string, data: CreateFolderRequest): Promise<void> {
    return this.request(`/folders/${folderId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
