import { baseApi } from './baseApi'
import type { Folder, CreateFolderDto } from '../../types'

export class FoldersApi {
  async createFolder(data: CreateFolderDto): Promise<Folder> {
    return baseApi.post<Folder>('/folders', data)
  }

  async getFolders(parentFolderId?: string): Promise<Folder[]> {
    const params = parentFolderId ? `?parentFolderId=${parentFolderId}` : ''
    return baseApi.get<Folder[]>(`/folders${params}`)
  }

  async getFolder(folderId: string): Promise<Folder> {
    return baseApi.get<Folder>(`/folders/${folderId}`)
  }

  async updateFolder(folderId: string, data: CreateFolderDto): Promise<void> {
    return baseApi.put<void>(`/folders/${folderId}`, data)
  }

  async deleteFolder(folderId: string): Promise<void> {
    return baseApi.delete<void>(`/folders/${folderId}`)
  }
}

export const foldersApi = new FoldersApi()