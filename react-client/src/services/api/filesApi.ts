import { baseApi } from './baseApi'
import type {
  FileItem,
  FileUploadUrl,
  FileDownloadUrl,
  DirectUploadDto,
  SearchFilesDto,
  PaginatedResult
} from '../../types'

export class FilesApi {
  async getUploadUrl(fileName: string, folderId: string): Promise<FileUploadUrl> {
    return baseApi.post<FileUploadUrl>('/files/upload-url', {
      fileName,
      folderId
    })
  }

  async directUpload(
    data: DirectUploadDto,
    onProgress?: (progress: number) => void
  ): Promise<FileItem> {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('folderId', data.folderId)
    if (data.description) formData.append('description', data.description)
    if (data.tags) formData.append('tags', data.tags)

    return baseApi.upload<FileItem>('/files/direct-upload', formData, onProgress)
  }

  async getFolderFiles(folderId: string): Promise<FileItem[]> {
    return baseApi.get<FileItem[]>(`/files/folder/${folderId}`)
  }

  async getDownloadUrl(fileId: string): Promise<FileDownloadUrl> {
    return baseApi.get<FileDownloadUrl>(`/files/download/${fileId}`)
  }

  async deleteFile(fileId: string): Promise<void> {
    return baseApi.delete<void>(`/files/${fileId}`)
  }

  async searchFiles(params: SearchFilesDto): Promise<PaginatedResult<FileItem>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return baseApi.get<PaginatedResult<FileItem>>(`/files/search?${searchParams}`)
  }

  async updateFile(fileId: string, updates: Partial<FileItem>): Promise<void> {
    return baseApi.put<void>(`/files/${fileId}`, updates)
  }
}

export const filesApi = new FilesApi()
