// 🔷 TypeScript Types - מבוסס על ה-DTOs שלך
export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  token: string
  user: User
  expiresAt: string
  refreshToken?: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  emailConfirmed: boolean
  lastLoginAt?: string
  createdAt: string
  fullName: string
  isAdmin: boolean
}

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

export interface FileItem {
  id: string
  name: string
  contentType: string
  size: number
  createdAt: string
  description?: string
  isPublic: boolean
  tags?: string
  downloadCount: number
  lastAccessedAt?: string
  sizeFormatted: string
  fileExtension: string
  isImage: boolean
  isVideo: boolean
  isDocument: boolean
}

export interface CreateFolderRequest {
  name: string
  parentFolderId?: string
  description?: string
  color?: string
}

export interface FileUploadUrlResponse {
  uploadUrl: string
  fileId: string
  expiresAt: string
  s3Key: string
}

export interface FileDownloadUrlResponse {
  downloadUrl: string
  fileName: string
  expiresAt: string
  fileSize: number
  contentType: string
}

export interface SearchFilesRequest {
  searchTerm?: string
  contentType?: string
  fromDate?: string
  toDate?: string
  folderId?: string
  pageSize?: number
  pageNumber?: number
  sortBy?: string
  sortDescending?: boolean
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface ApiError {
  error: string
  details?: string
}
