import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { toast } from 'react-hot-toast'
import { tokenService } from '../auth/tokenService'

export class BaseApi {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = tokenService.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - Handle common errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { response } = error

        if (response?.status === 401) {
          // Try to refresh token
          try {
            await tokenService.refreshToken()
            // Retry the original request
            return this.client.request(error.config)
          } catch (refreshError) {
            // Refresh failed, logout user
            tokenService.clearTokens()
            window.location.href = '/login'
          }
        }

        // Handle other errors
        this.handleApiError(error)
        return Promise.reject(error)
      }
    )
  }

  private handleApiError(error: any) {
    const message = error.response?.data?.error || error.message || 'שגיאה לא צפויה'
    
    // Don't show toast for auth pages
    if (!window.location.pathname.includes('/auth/')) {
      toast.error(message)
    }
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config)
    return response.data
  }

  async upload<T>(
    url: string, 
    formData: FormData, 
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    })
    return response.data
  }
}

export const baseApi = new BaseApi()
