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
  
  export interface FileUploadUrl {
    uploadUrl: string
    fileId: string
    expiresAt: string
    s3Key: string
  }
  
  export interface FileDownloadUrl {
    downloadUrl: string
    fileName: string
    expiresAt: string
    fileSize: number
    contentType: string
  }
  
  export interface DirectUploadDto {
    file: File
    folderId: string
    description?: string
    tags?: string
  }
  
  export interface SearchFilesDto {
    searchTerm?: string
    contentType?: string
    fromDate?: string
    toDate?: string
    folderId?: string
    pageSize?: number
    pageNumber?: number
    sortBy?: 'name' | 'size' | 'contentType' | 'createdAt'
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