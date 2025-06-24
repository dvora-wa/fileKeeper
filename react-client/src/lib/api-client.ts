import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ApiError,
  Folder,
  CreateFolderRequest,
  FileUploadUrlResponse,
  FileItem,
  FileDownloadUrlResponse,
  SearchFilesRequest,
  PaginatedResult,
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
      console.log("❌ API Error for", url + ":", error)
      throw error
    }
  }

  // Auth methods
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })

    this.setToken(response.token)
    return response
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
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

  // 🗂️ Folder methods
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

  // 📁 File methods
  async getUploadUrl(fileName: string, folderId: string): Promise<FileUploadUrlResponse> {
    return this.request<FileUploadUrlResponse>("/files/upload-url", {
      method: "POST",
      body: JSON.stringify({ fileName, folderId }),
    })
  }

  async uploadFileDirect(formData: FormData): Promise<FileItem> {
    // For direct upload, we don't set Content-Type to let browser set it with boundary
    const headers: Record<string, string> = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}/files/direct-upload`, {
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

  async getFolderFiles(folderId: string): Promise<FileItem[]> {
    return this.request<FileItem[]>(`/files/folder/${folderId}`)
  }

  async getDownloadUrl(fileId: string): Promise<FileDownloadUrlResponse> {
    return this.request<FileDownloadUrlResponse>(`/files/download/${fileId}`)
  }

  async deleteFile(fileId: string): Promise<void> {
    return this.request(`/files/${fileId}`, {
      method: "DELETE",
    })
  }

  async searchFiles(params: SearchFilesRequest): Promise<PaginatedResult<FileItem>> {
    const searchParams = new URLSearchParams()

    if (params.searchTerm) searchParams.append("searchTerm", params.searchTerm)
    if (params.contentType) searchParams.append("contentType", params.contentType)
    if (params.fromDate) searchParams.append("fromDate", params.fromDate)
    if (params.toDate) searchParams.append("toDate", params.toDate)
    if (params.folderId) searchParams.append("folderId", params.folderId)
    if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString())
    if (params.pageNumber) searchParams.append("pageNumber", params.pageNumber.toString())
    if (params.sortBy) searchParams.append("sortBy", params.sortBy)
    if (params.sortDescending) searchParams.append("sortDescending", params.sortDescending.toString())

    return this.request<PaginatedResult<FileItem>>(`/files/search?${searchParams}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Re-export everything from the new API structure for backward compatibility
export * from "./api"
export { apiClient as default } from "./api"
