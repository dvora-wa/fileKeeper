import type { FileItem } from "./file.types"

export interface Folder {
  id: string
  name: string
  parentFolderId?: string
  userId: string
  createdAt: string
  description?: string
  color?: string
  isPublic: boolean
  isFavorite: boolean
  subFolders: Folder[]
  files: FileItem[]
  isRootFolder: boolean
  totalFilesCount: number
  path: string
}

export interface CreateFolderDto {
  name: string
  parentFolderId?: string
  description?: string
  color?: string
}

export interface FolderStore {
  folders: Folder[]
  currentFolder: Folder | null
  isLoading: boolean
  error: string | null
  fetchFolders: (parentId?: string) => Promise<void>
  createFolder: (data: CreateFolderDto) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
  setCurrentFolder: (folder: Folder | null) => void
}

export interface UpdateFolderDto extends Partial<CreateFolderDto> { }

export interface FolderTreeItem extends Folder {
  children: FolderTreeItem[]
  isExpanded: boolean
}