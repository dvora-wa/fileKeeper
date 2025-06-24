import { AuthApi } from "./auth-api"
import { FolderApi } from "./folder-api"
import { FileApi } from "./file-api"

// יצירת instances של כל ה-APIs
export const authApi = new AuthApi()
export const folderApi = new FolderApi()
export const fileApi = new FileApi()

// API Client מאוחד (לתאימות לאחור)
export class ApiClient {
  // Auth methods
  async register(data: any) {
    return authApi.register(data)
  }
  async login(data: any) {
    return authApi.login(data)
  }
  async logout() {
    return authApi.logout()
  }
  async getCurrentUser() {
    return authApi.getCurrentUser()
  }

  // Folder methods
  async getFolders(parentFolderId?: string) {
    return folderApi.getFolders(parentFolderId)
  }
  async createFolder(data: any) {
    return folderApi.createFolder(data)
  }
  async deleteFolder(folderId: string) {
    return folderApi.deleteFolder(folderId)
  }
  async updateFolder(folderId: string, data: any) {
    return folderApi.updateFolder(folderId, data)
  }

  // File methods
  async uploadFileDirect(formData: FormData) {
    return fileApi.uploadFileDirect(formData)
  }
  async uploadFilePresigned(file: File, folderId: string, description?: string, tags?: string) {
    return fileApi.uploadFilePresigned(file, folderId, description, tags)
  }
  async getFolderFiles(folderId: string) {
    return fileApi.getFolderFiles(folderId)
  }
  async getDownloadUrl(fileId: string) {
    return fileApi.getDownloadUrl(fileId)
  }
  async deleteFile(fileId: string) {
    return fileApi.deleteFile(fileId)
  }
  async searchFiles(params: any) {
    return fileApi.searchFiles(params)
  }

  // Token management
  setToken(token: string) {
    authApi.setToken(token)
    folderApi.setToken(token)
    fileApi.setToken(token)
  }

  clearToken() {
    authApi.clearToken()
    folderApi.clearToken()
    fileApi.clearToken()
  }
}

export const apiClient = new ApiClient()

// Export individual APIs for direct use
export type { UploadMethod } from "./file-api"
