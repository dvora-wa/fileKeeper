import { BaseApiClient } from "./base-client"
import type { Folder, CreateFolderRequest } from "../../types/api"

export class FolderApi extends BaseApiClient {
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
